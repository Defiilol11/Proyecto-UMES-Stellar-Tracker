# Proyecto Profesional - Observatorio Gate 1
# Backend en Python (FastAPI + Astropy + PySerial)

import os
# Redirigir TODAS las carpetas de caché para que no use C:\Users\carli\.cache
local_cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.astropy_cache')
os.environ['ASTROPY_CACHE_DIR'] = local_cache
os.environ['XDG_CACHE_HOME'] = local_cache

import asyncio
import serial
import serial.tools.list_ports
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

# Ahora importamos astropy, para que evalúe las variables de entorno correctamente
from astropy.coordinates import SkyCoord, EarthLocation, AltAz, get_body
from astropy.time import Time
import astropy.units as u
from typing import List, Optional

app = FastAPI(title="Observatorio Gate 1 - Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Estado Global del Serial
class SerialManager:
    def __init__(self):
        self.ser = None
        self.connected_port = None

    def connect(self, port: str, baudrate: int = 115200) -> bool:
        if self.ser and self.ser.is_open:
            self.ser.close()
        try:
            self.ser = serial.Serial(port, baudrate, timeout=2)
            self.connected_port = port
            return True
        except Exception as e:
            print(f"Error conectando a {port}: {e}")
            self.connected_port = None
            return False

    def disconnect(self):
        if self.ser and self.ser.is_open:
            self.ser.close()
            self.connected_port = None

    def send_command(self, cmd: str):
        if self.ser and self.ser.is_open:
            self.ser.write((cmd + '\n').encode('utf-8'))
            return True
        return False

    def read_line(self) -> str:
        if self.ser and self.ser.is_open and self.ser.in_waiting > 0:
            return self.ser.readline().decode('utf-8').strip()
        return ""

sm = SerialManager()

# ================================
# LÓGICA DE DETECCIÓN DE PUERTOS
# ================================

@app.get("/api/ports")
def get_ports():
    """Lista todos los puertos COM disponibles en el equipo."""
    ports = serial.tools.list_ports.comports()
    port_list = [{"device": p.device, "description": p.description} for p in ports]
    return {"ports": port_list, "connected": sm.connected_port}

class ConnectRequest(BaseModel):
    port: str

@app.post("/api/connect")
def connect_port(req: ConnectRequest):
    """Conecta manualmente a un puerto COM."""
    success = sm.connect(req.port)
    if success:
        return {"status": "success", "message": f"Conectado a {req.port}"}
    raise HTTPException(status_code=400, detail="No se pudo conectar al puerto")

@app.post("/api/autodetect")
def autodetect_port():
    """Escanea puertos buscando el handshake del Arduino ('GATE1_TRACKER_READY')"""
    ports = serial.tools.list_ports.comports()
    for p in ports:
        try:
            temp_ser = serial.Serial(p.device, 115200, timeout=2)
            # Esperamos a leer alguna línea
            line = temp_ser.readline().decode('utf-8', errors='ignore').strip()
            if "GATE1_TRACKER_READY" in line:
                temp_ser.close()
                sm.connect(p.device)
                return {"status": "success", "port": p.device, "message": "Arduino detectado y conectado"}
            temp_ser.close()
        except:
            pass
    raise HTTPException(status_code=404, detail="No se detectó ningún Arduino enviando el handshake")

# ================================
# LÓGICA ASTRONÓMICA Y CINEMÁTICA
# ================================

celestial_cache = {}
SOLAR_SYSTEM_BODIES = {"sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune"}

def get_deep_sky_body(name: str) -> SkyCoord:
    if name not in celestial_cache:
        celestial_cache[name] = SkyCoord.from_name(name, cache=False)
    return celestial_cache[name]

@app.get("/api/objects")
def get_objects(
    lat: float = Query(14.6349, description="Latitud (Guatemala por defecto)"),
    lon: float = Query(-90.5069, description="Longitud"),
    elevation: float = Query(1500.0, description="Altitud (m)"),
    targets: List[str] = Query(["Sun", "Moon", "Mars", "Sirius"], description="Objetos")
):
    observer = EarthLocation(lat=lat*u.deg, lon=lon*u.deg, height=elevation*u.m)
    t = Time.now()
    results = []
    
    for target in targets:
        target_lower = target.lower()
        try:
            if target_lower in SOLAR_SYSTEM_BODIES:
                coord = get_body(target_lower, t, observer, ephemeris='builtin')
            else:
                coord = get_deep_sky_body(target)
                
            altaz = coord.transform_to(AltAz(obstime=t, location=observer))
            
            # Formato estandar
            ra_hour = float(coord.ra.hour) if hasattr(coord.ra, 'hour') else float(coord.ra.degree / 15.0)
            
            results.append({
                "name": target.capitalize(),
                "azimuth": float(altaz.az.degree),
                "elevation": float(altaz.alt.degree),
                "ra": ra_hour,
                "dec": float(coord.dec.degree)
            })
        except Exception as e:
            print(f"Error con {target}: {e}")
            
    return {"timestamp": t.isot, "objects": results}

class TrackRequest(BaseModel):
    azimuth: float
    elevation: float

@app.post("/api/track")
def send_tracking_command(req: TrackRequest):
    """
    Convierte Az/Alt en pasos para el Arduino y envía el comando por Serial.
    La reducción es de 4096 * (113/12) = 38570.66 pasos por 360 grados.
    """
    if not sm.connected_port:
        raise HTTPException(status_code=400, detail="No hay puerto conectado")

    # Enviamos los grados puros (float) al Arduino.
    # La logica de los motores y el truco de 180 grados SG90 ahora vive en el Arduino.
    cmd = f"G0 A{req.azimuth:.2f} E{req.elevation:.2f}"
    sm.send_command(cmd)
    
    return {"status": "success", "command": cmd}
