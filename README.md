# Observatorio Astronómico Automatizado – Suite de Control y Firmware (Gate 1)

Repositorio oficial del software de control, telemetría y firmware para el **Observatorio Astronómico Automatizado (Gate 1 - Modelo Mecatrónico a Escala 1:12.5)**, desarrollado en la Facultad de Ingeniería de la Universidad Mesoamericana (UMES), Guatemala.

---

## 🏛️ Arquitectura del Sistema

El ecosistema de software opera bajo una arquitectura distribuida en tres capas principales:

```
06_SOFTWARE/
├── arduino/                  # Capa Embebida de Control en Tiempo Real
│   └── gate1_tracker/
│       └── gate1_tracker.ino # Firmware C++ para microcontrolador Arduino Uno R3
│
├── frontend/                 # Capa de Aplicación Web y Servidor de Cinemática
│   ├── api/
│   │   └── index.py          # Backend Python (FastAPI/Flask + Astropy + Serial)
│   ├── src/                  # Frontend en React + Vite + Tailwind CSS
│   │   ├── App.jsx           # Tablero de control, telemetría y conexión serial
│   │   ├── components/       # Visualizador 3D Three.js, catálogo estelar y gráficos
│   │   └── ...
│   └── package.json          # Dependencias y scripts del frontend
│
└── README.md                 # Este documento de especificación y despliegue
```

---

## 🚀 1. Firmware Arduino (`arduino/gate1_tracker/`)
* **Hardware:** Microcontrolador ATmega328P (Arduino Uno R3).
* **Funciones:**
  * Control del eje acimutal mediante motor paso a paso unipolar 28BYJ-48 y etapa de potencia ULN2003A (4096 medios pasos por revolución).
  * Control de elevación mediante microservomotor SG90 (rango 0° a 90°).
  * Protocolo de comunicación G-code simplificado sobre bus UART a 115200 baudios (comandos `G0 A<pasos> E<pasos>`).
  * Rutina de referencia cero (*Homing*) asistida por sensor de efecto Hall magnético.
  * Heartbeat de seguridad y enclavamiento ante pérdida de comunicación (*Watchdog* a 2000 ms).

### Carga del firmware:
1. Abrir `arduino/gate1_tracker/gate1_tracker.ino` en el IDE de Arduino.
2. Seleccionar la placa **Arduino Uno** y el puerto COM correspondiente.
3. Compilar y subir el sketch.

---

## 🌌 2. Backend Astrofísico y Cinemático (`frontend/api/`)
* **Entorno:** Python 3.10+
* **Librerías principales:** `astropy`, `pyserial`, `fastapi`, `uvicorn`.
* **Funciones:**
  * Conexión con catálogos celestes y efemérides (SIMBAD / JPL Horizons).
  * Reducción y conversión de coordenadas ecuatoriales absolutas $(\alpha, \delta)$ a coordenadas horizontales locales $(Az, Alt)$ en tiempo real para las coordenadas geográficas del observatorio.
  * Transformación cinemática mediante matrices ortogonales euclidianas $SO(3)$.
  * Transmisión serial de comandos de pasos al microcontrolador con resolución de $42.6444\text{ pasos/grado}$ en acimut y compensación de backlash ($0.15\text{ mm}$).

### Ejecución del backend:
```bash
cd frontend/api
pip install -r requirements.txt   # o: pip install astropy pyserial fastapi uvicorn
uvicorn index:app --reload --port 8000
```

---

## 🖥️ 3. Frontend de Telemetría y Control Web (`frontend/`)
* **Entorno:** Node.js 18+, React 18, Vite.
* **Funciones:**
  * Interfaz de usuario para selección de astros visibles en el cielo nocturno.
  * Visualización 3D interactiva del domo geodésico y puntero óptico.
  * Monitorización de telemetría en tiempo real: estado del puerto serial, comando activo, posición angular actual vs prescrita.
  * Terminal de depuración y envío manual de comandos G-code.

### Ejecución del frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 🔒 Licencia y Reproducibilidad Académica
Este repositorio forma parte del proyecto de graduación profesional del autor en la Universidad Mesoamericana. El código se proporciona bajo propósitos educativos y de investigación científica abierta.
