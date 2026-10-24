#include <Servo.h>

// ==========================================================
// CONFIGURACIÓN DE PINES Y ACTUADORES (GATE 1)
// ==========================================================
// Driver ULN2003 para motor paso a paso 28BYJ-48 (Rotación del Domo)
#define DOMO_IN1 8
#define DOMO_IN2 9
#define DOMO_IN3 10
#define DOMO_IN4 11

// Servomotores SG90 (Montura Altazimutal del Telescopio)
#define PIN_SERVO_ALT 5
#define PIN_SERVO_AZ 6

Servo servoAltitud;
Servo servoAzimut;

// ==========================================================
// CÁLCULOS MECÁNICOS Y RELACIÓN DE TRANSMISIÓN (DOMO)
// ==========================================================
// Geometría del ensamble CAD:
// - Diámetro del anillo base: 240 mm (Radio = 120 mm).
// - Distancia del eje del engranaje del motor al centro: ~10 cm (101.0 mm).
// - Corona interna del domo: Z1 = 113 dientes (Módulo 2.0).
// - Piñón motriz en eje del motor: Z2 = 12 dientes (Módulo 2.0).
// - Relación de engrane exterior: i_ext = 113 / 12 = 9.416667
// - Calibración cinemática real en banco de pruebas (Gate 1):
//   Medición experimental: para 320° teóricos el domo avanzó 400° físicos.
//   Factor de corrección de escala = 320.0 / 400.0 = 0.80 (exceso del 25%).
//   Constante empírica corregida: 53.3055 * 0.80 = 42.6444 pasos/grado
//   Pasos por vuelta completa real (360°): 42.6444 * 360 = 15,352 pasos
const float PASOS_POR_GRADO_DOMO = 42.6444; // 42.6444 pasos/grado (Calibración exacta)

long targetDomoPasos = 0;
long currentDomoPasos = 0;

// Variables de posición y pulsos para servos (SG90)
int targetPwmAz = 1500;  // 1500 us = 90° (Centro/Norte calibrado)
int targetPwmAlt = 1500; // 1500 us = 90° (Cenit calibrado)

// Telemetría y temporización
unsigned long lastHeartbeat = 0;
unsigned long tiempoMarcaServo = 0;
long pasosRecorridosEnTrayecto = 0;

// ==========================================================
// MÁQUINA DE ESTADOS SECUENCIAL (BAJO CONSUMO USB)
// Flujo estricto: 1° Stepper (Domo) -> 2° Azimut -> 3° Altitud
// ==========================================================
enum EstadoSecuencia {
  REPOSO,
  DOMO_ACTIVO,
  AZIMUT_ACTIVO,
  ESPERA_AZIMUT,
  ALTITUD_ACTIVO
};
EstadoSecuencia faseActual = REPOSO;

// ==========================================================
// SECUENCIA DE PASOS CON INVERSIÓN DE SENTIDO (MÁXIMO TORQUE)
// ==========================================================
// Invertida la secuencia de bobinas para corregir el giro al revés.
// Ahora la cúpula gira en el sentido azimutal astronómico correcto.
const int pasosMagneticos[4][4] = {
  {1, 0, 0, 1},  // 0: IN4 + IN1 (LED D + A)
  {0, 0, 1, 1},  // 1: IN3 + IN4 (LED C + D)
  {0, 1, 1, 0},  // 2: IN2 + IN3 (LED B + C)
  {1, 1, 0, 0}   // 3: IN1 + IN2 (LED A + B)
};

void setup() {
  Serial.begin(115200);
  
  pinMode(DOMO_IN1, OUTPUT);
  pinMode(DOMO_IN2, OUTPUT);
  pinMode(DOMO_IN3, OUTPUT);
  pinMode(DOMO_IN4, OUTPUT);
  
  // Apagar bobinas inicialmente
  digitalWrite(DOMO_IN1, LOW);
  digitalWrite(DOMO_IN2, LOW);
  digitalWrite(DOMO_IN3, LOW);
  digitalWrite(DOMO_IN4, LOW);
  
  servoAltitud.attach(PIN_SERVO_ALT);
  servoAzimut.attach(PIN_SERVO_AZ);
  
  // Posición inicial neutra (Norte y Cenit)
  servoAzimut.writeMicroseconds(1500);
  servoAltitud.writeMicroseconds(1500);
  
  Serial.println("GATE1_TRACKER_READY");
}

void loop() {
  // 1. Telemetría de presencia para Auto-Detección web
  if (millis() - lastHeartbeat >= 2000) {
    Serial.println("GATE1_TRACKER_READY");
    lastHeartbeat = millis();
  }

  // 2. Parser de comandos G-Code desde Python/Frontend
  if (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    if (cmd.startsWith("G0")) {
      int a_index = cmd.indexOf('A');
      int e_index = cmd.indexOf('E');
      
      if (a_index != -1 && e_index != -1) {
        float azimutReal = cmd.substring(a_index + 1, e_index).toFloat();
        float altitudReal = cmd.substring(e_index + 1).toFloat();

        // Compensación de gravedad y holgura mecánica en altitud (+3.5°)
        float compensacionAltitud = 3.5;
        altitudReal = altitudReal + compensacionAltitud;

        // --- CÁLCULO DE PASOS DEL DOMO ---
        // El domo gira solidario con la coordenada de azimut para alinear la ranura
        targetDomoPasos = (long)(azimutReal * PASOS_POR_GRADO_DOMO);
        
        // --- CÁLCULO DEL TELESCOPIO (CENTRO GEOMÉTRICO INTELIGENTE) ---
        float servoAz_grados = 0.0;
        float servoAlt_grados = 0.0;
        
        // Escala angular centrada en el Norte (-180° a +180°)
        float azShifted = azimutReal;
        if (azShifted > 180.0) azShifted -= 360.0;
        
        if (azShifted >= -90.0 && azShifted <= 90.0) {
          // HEMISFERIO NORTE (Telescopio de frente)
          // Inversión de giro mecánico: el centro es 90° (Norte)
          servoAz_grados = 90.0 - azShifted;  
          servoAlt_grados = altitudReal; 
        } else {
          // HEMISFERIO SUR (Meridian Flip por límite físico de 180° del SG90)
          float azOpuesto = azimutReal - 180.0;
          if (azOpuesto > 180.0) azOpuesto -= 360.0;
          
          servoAz_grados = 90.0 - azOpuesto; 
          servoAlt_grados = 180.0 - altitudReal; // Tubo pasa el cenit hacia atrás
        }
        
        // Mapeo a microsegundos de alta resolución (0.09° por microsegundo)
        targetPwmAz = 500 + (int)(servoAz_grados * 11.111);
        targetPwmAlt = 500 + (int)(servoAlt_grados * 11.111);

        // Iniciar la secuencia de movimiento: Paso 1 es el Domo con rampa de despegue
        pasosRecorridosEnTrayecto = 0;
        faseActual = DOMO_ACTIVO;
      }
    }
  }

  // 3. MÁQUINA DE ESTADOS: Ejecución en Cadena (1 motor a la vez para cuidar corriente USB)
  switch (faseActual) {
    
    // --- PASO 1: ROTACIÓN DEL STEPPER (DOMO) ---
    case DOMO_ACTIVO:
      if (currentDomoPasos != targetDomoPasos) {
        if (currentDomoPasos < targetDomoPasos) {
          currentDomoPasos++;
        } else {
          currentDomoPasos--;
        }
        pasosRecorridosEnTrayecto++;
        
        // Índice circular 0 a 3 inmune a números negativos (4 pasos de alto torque)
        int indice = (int)(((currentDomoPasos % 4) + 4) % 4);
        digitalWrite(DOMO_IN1, pasosMagneticos[indice][0]);
        digitalWrite(DOMO_IN2, pasosMagneticos[indice][1]);
        digitalWrite(DOMO_IN3, pasosMagneticos[indice][2]);
        digitalWrite(DOMO_IN4, pasosMagneticos[indice][3]);
        
        // RAMPA DE ARRANQUE PARA USB (Rompe la inercia estática sin ayuda manual):
        // Los primeros pasos tienen pulsos de 6 ms para máxima saturación magnética de arranque.
        // Luego acelera progresivamente a 4 ms y velocidad de crucero rápida de 2 ms.
        if (pasosRecorridosEnTrayecto < 12) {
          delay(6); // Máximo par magnético para romper la inercia estática
        } else if (pasosRecorridosEnTrayecto < 30) {
          delay(4); // Transición suave
        } else {
          delay(2); // Velocidad crucero (~9.3°/segundo)
        }
      } else {
        // FRENO MAGNÉTICO ACTIVO (Elimina el "overshoot" / pasarse de largo):
        // La cúpula tiene inercia de giro. Al mantener el campo magnético activo
        // durante 250 ms con el motor clavado en su posición final, absorbe la inercia
        // y evita que la cúpula siga rodando por su propio peso.
        delay(250);

        // Desenergizar bobinas para ahorrar corriente y evitar calor:
        digitalWrite(DOMO_IN1, LOW);
        digitalWrite(DOMO_IN2, LOW);
        digitalWrite(DOMO_IN3, LOW);
        digitalWrite(DOMO_IN4, LOW);
        
        delay(100);
        
        // Avanzar a la siguiente fase: Azimut
        faseActual = AZIMUT_ACTIVO;
      }
      break;

    // --- PASO 2: ROTACIÓN DEL SERVO AZIMUTAL (BASE TELESCOPIO) ---
    case AZIMUT_ACTIVO:
      servoAzimut.writeMicroseconds(targetPwmAz);
      tiempoMarcaServo = millis();
      faseActual = ESPERA_AZIMUT;
      break;

    case ESPERA_AZIMUT:
      // Esperar 1000 ms para que el SG90 azimutal complete su desplazamiento físico
      if (millis() - tiempoMarcaServo >= 1000) {
        // Avanzar a la siguiente fase: Altitud
        faseActual = ALTITUD_ACTIVO;
      }
      break;

    // --- PASO 3: ROTACIÓN DEL SERVO DE ALTITUD (EJE DE ELEVACIÓN) ---
    case ALTITUD_ACTIVO:
      servoAltitud.writeMicroseconds(targetPwmAlt);
      // Fin del ciclo de seguimiento cinemático
      faseActual = REPOSO;
      break;

    case REPOSO:
      // Estado pasivo en espera de nuevas órdenes G-Code
      break;
  }
}