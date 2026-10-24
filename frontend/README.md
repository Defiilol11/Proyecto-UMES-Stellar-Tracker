# 🔭 Stellar Tracker

![License](https://img.shields.io/badge/License-CC%20BY%204.0-blue.svg)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat&logo=three.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat&logo=vite&logoColor=FFD62E)

**Stellar Tracker** es un sistema mecatrónico automatizado y un simulador 3D diseñado para la localización y rastreo de cuerpos celestes en tiempo real. Este proyecto integra disciplinas de física astronómica, álgebra lineal, ingeniería de software y mecatrónica para traducir coordenadas ecuatoriales absolutas en movimientos físicos precisos.

---

## 🚀 Características Principales

- **Simulación Ciberfísica 3D:** Un entorno virtual interactivo renderizado con `React Three Fiber` y `Three.js` que simula la bóveda celeste completa y un telescopio robótico (Pan-Tilt).
- **Trigonometría Esférica en Tiempo Real:** Convierte coordenadas Ecuatoriales (Ascensión Recta y Declinación) obtenidas de la base de datos SIMBAD hacia Coordenadas Topocéntricas (Azimut y Altitud) considerando la latitud, longitud y hora exacta del usuario.
- **Compensación Atmosférica:** El backend en Python ajusta automáticamente las coordenadas tomando en cuenta la refracción de la luz en la atmósfera.
- **Cinemática Directa y Cuaterniones:** Utiliza matrices del grupo ortogonal SO(3) e interpolación esférica lineal (SLERP) para simular el movimiento fluido de los servomotores sin sufrir *Gimbal Lock*.
- **Interfaz Glassmorphism:** UI de grado profesional con acabados esmerilados y navegación inmersiva en 360 grados.

---

## ⚙️ Arquitectura del Sistema

El proyecto está diseñado bajo una arquitectura *Serverless* compatible de forma nativa con **Vercel**:

- **Frontend (Capa de Presentación):** 
  - `React.js` empaquetado con `Vite`.
  - `Three.js` y `@react-three/drei` para el motor gráfico webGL.
  - Diseño *Glassmorphism* sin librerías pesadas de CSS.
- **Backend (Capa Lógica):** 
  - `FastAPI` (Python) para los microservicios.
  - `Astropy` y `Astroquery` para los cálculos astronómicos de alta precisión y extracción de efemérides.

---

## 🛠️ Instalación y Ejecución Local

Para ejecutar el simulador y el backend simultáneamente en tu máquina local:

### 1. Clonar el repositorio
```bash
git clone https://github.com/Defiilol11/stellar-tracker.git
cd stellar-tracker
```

### 2. Levantar el Backend (Python)
Abre una terminal y ejecuta:
```bash
python -m venv .venv

# En Windows:
.\.venv\Scripts\activate
# En Mac/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn api.index:app --reload --port 8000
```

### 3. Levantar el Frontend (React)
Abre otra pestaña de terminal en la raíz del proyecto y ejecuta:
```bash
npm install
npm run dev
```

El simulador estará disponible en `http://localhost:5173`.

---

## 🌐 Despliegue en la Nube (Vercel)

Este proyecto está configurado para un despliegue **cero-configuración** en Vercel.

1. Conecta tu repositorio de GitHub a tu cuenta de Vercel.
2. Vercel leerá automáticamente el archivo `vercel.json` y compilará la aplicación.
3. El frontend de React será desplegado estáticamente, y la carpeta `api/` será transformada en funciones *Serverless* de Python de forma automática.

---

## 📐 Fundamento Teórico

El algoritmo central se basa en la multiplicación de matrices de transformación ortogonal para los dos ejes mecánicos del robot:

$$P_{final} = R_z(\alpha) \cdot R_y(\beta) \cdot \vec{v}_0$$

Donde $R_z(\alpha)$ gobierna el Azimut y $R_y(\beta)$ la Altitud. Experimentalmente, la reducción de la holgura mecánica permite un error angular promedio de $0.64^\circ$, superando la eficiencia de monturas económicas. *Los detalles matemáticos completos se encuentran en el apartado de fundamentación incluido dentro del propio simulador web.*

---

**Autores:** Carlos Renaldo Taracena Coronado y Andrés Hernández Maldonado.  
*Desarrollado para la Universidad Mesoamericana (UMES) - Guatemala.*  
**Licencia:** Creative Commons Atribución 4.0 Internacional (CC BY 4.0).
