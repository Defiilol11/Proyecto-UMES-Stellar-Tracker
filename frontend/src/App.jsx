import { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Html, Stars } from '@react-three/drei'
import * as THREE from 'three'
import axios from 'axios'
import MathOverlay from './MathOverlay.jsx'

// Estilos estrictos para evitar ruptura de la interfaz
const uiStyles = {
  panel: {
    background: 'rgba(15, 18, 22, 0.75)',
    backdropFilter: 'blur(20px) saturate(120%)',
    WebkitBackdropFilter: 'blur(20px) saturate(120%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
    color: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    width: '360px',
    maxHeight: 'calc(100vh - 40px)',
    boxSizing: 'border-box',
  },
  header: {
    margin: '0 0 20px 0',
    color: '#fff',
    fontSize: '1.4rem',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    flexShrink: 0
  },
  sectionTitle: {
    margin: '0 0 10px 0',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '700'
  },
  inputGroup: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '10px'
  },
  inputWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  inputLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600'
  },
  input: {
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: '8px',
    outline: 'none',
    width: '100%',
    fontSize: '0.9rem',
    boxSizing: 'border-box',
  },
  button: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  },
  buttonPrimary: {
    background: '#ffffff',
    border: 'none',
    color: '#000',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    width: '100%',
    marginTop: '10px',
    boxSizing: 'border-box'
  },
  starList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  starCard: {
    background: 'rgba(0, 0, 0, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '12px 16px',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  },
  scrollableList: {
    flex: 1,
    overflowY: 'auto',
    minHeight: '150px',
    paddingRight: '6px',
    marginRight: '-6px'
  },
  badge: {
    fontSize: '0.65rem',
    padding: '4px 8px',
    borderRadius: '20px',
    fontWeight: '700',
    letterSpacing: '0.5px'
  }
}

// Entorno Mate
function EnvironmentScene() {
  const cardinalRadius = 35;

  return (
    <group>
      {/* Base del horizonte como una red de líneas translúcidas */}
      <gridHelper args={[200, 100, 0x555555, 0x222222]} position={[0, 0, 0]} />

      {/* Base circular debajo del telescopio */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[9.8, 10, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>

      <Text position={[0, 0.5, -cardinalRadius]} fontSize={1.2} color="rgba(255,255,255,0.3)" rotation={[0, 0, 0]}>N</Text>
      <Text position={[0, 0.5, cardinalRadius]} fontSize={1.2} color="rgba(255,255,255,0.3)" rotation={[0, Math.PI, 0]}>S</Text>
      <Text position={[cardinalRadius, 0.5, 0]} fontSize={1.2} color="rgba(255,255,255,0.3)" rotation={[0, -Math.PI / 2, 0]}>E</Text>
      <Text position={[-cardinalRadius, 0.5, 0]} fontSize={1.2} color="rgba(255,255,255,0.3)" rotation={[0, Math.PI / 2, 0]}>W</Text>
    </group>
  )
}

function getCartesian(azDeg, elDeg, radius = 50) {
  const azRad = azDeg * (Math.PI / 180);
  const elRad = elDeg * (Math.PI / 180);
  const y = radius * Math.sin(elRad);
  const x = radius * Math.cos(elRad) * Math.sin(azRad);
  const z = -radius * Math.cos(elRad) * Math.cos(azRad);
  return [x, y, z];
}

function StarMarker({ data, isTarget }) {
  const [x, y, z] = getCartesian(data.azimuth, data.elevation, 50);
  const color = isTarget ? "#ffffff" : "rgba(255,255,255,0.6)";
  const size = isTarget ? 0.5 : 0.25;

  return (
    <mesh position={[x, y, z]}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshBasicMaterial color={color} />
      <Html zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
        <div style={{
          color: color,
          fontSize: '13px',
          fontWeight: isTarget ? '700' : '500',
          whiteSpace: 'nowrap',
          transform: 'translate(15px, -15px)',
          pointerEvents: 'none',
          textShadow: '0 2px 4px rgba(0,0,0,0.8)',
          background: isTarget ? 'rgba(0,0,0,0.6)' : 'transparent',
          padding: isTarget ? '2px 6px' : '0',
          borderRadius: '4px'
        }}>
          {data.name}
        </div>
      </Html>
    </mesh>
  )
}

function MinimalistTelescope({ targetAz, targetEl }) {
  const mountRef = useRef();
  const tubeRef = useRef();

  useFrame(() => {
    if (!mountRef.current || !tubeRef.current) return;

    const tAzRad = targetAz * THREE.MathUtils.DEG2RAD;
    const mountTargetQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -tAzRad);
    mountRef.current.quaternion.slerp(mountTargetQuat, 0.06);

    const tElRad = targetEl * THREE.MathUtils.DEG2RAD;
    const tubeTargetQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), tElRad);
    tubeRef.current.quaternion.slerp(tubeTargetQuat, 0.06);

    // Live Matrix Update
    if (tubeRef.current) {
      tubeRef.current.updateMatrixWorld(true);

      const rotationMatrix = new THREE.Matrix4().extractRotation(tubeRef.current.matrixWorld);
      const elements = rotationMatrix.elements;

      const m11 = elements[0].toFixed(2);
      const m21 = elements[1].toFixed(2);
      const m31 = elements[2].toFixed(2);
      const m41 = elements[3].toFixed(2);

      const m12 = elements[4].toFixed(2);
      const m22 = elements[5].toFixed(2);
      const m32 = elements[6].toFixed(2);
      const m42 = elements[7].toFixed(2);

      const m13 = elements[8].toFixed(2);
      const m23 = elements[9].toFixed(2);
      const m33 = elements[10].toFixed(2);
      const m43 = elements[11].toFixed(2);

      const m14 = elements[12].toFixed(2);
      const m24 = elements[13].toFixed(2);
      const m34 = elements[14].toFixed(2);
      const m44 = elements[15].toFixed(2);

      // M13 = sin(az), M33 = cos(az) -> az = atan2(M13, M33)
      // M23 = -sin(el) -> el = asin(-M23)
      const calculatedAz = (Math.atan2(elements[8], elements[10]) * (180 / Math.PI)).toFixed(1);
      const calculatedEl = (Math.asin(-elements[9]) * (180 / Math.PI)).toFixed(1);

      const matrixEl = document.getElementById('live-matrix-content');
      if (matrixEl) {
        matrixEl.innerHTML = `
<div style="background: rgba(0,0,0,0.5); padding: 8px; border-radius: 6px; font-family: monospace; font-size: 13px; margin-bottom: 8px; text-align: right; color: rgba(255,255,255,0.9);">
    ${m11} &nbsp; ${m12} &nbsp; ${m13} &nbsp; ${m14}<br/>
    ${m21} &nbsp; ${m22} &nbsp; ${m23} &nbsp; ${m24}<br/>
    ${m31} &nbsp; ${m32} &nbsp; ${m33} &nbsp; ${m34}<br/>
    ${m41} &nbsp; ${m42} &nbsp; ${m43} &nbsp; ${m44}
</div>
<div style="font-size: 13px; display: flex; flex-direction: column; gap: 4px;">
    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px;">
        <span style="color: #6ee7b7; font-weight: bold;">Azimut</span>
        <span style="color: rgba(255,255,255,0.6); font-family: monospace;">atan2(M13, M33)</span>
        <span style="font-family: monospace; font-weight: bold;">${calculatedAz}°</span>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px;">
        <span style="color: #93c5fd; font-weight: bold;">Elevación</span>
        <span style="color: rgba(255,255,255,0.6); font-family: monospace;">asin(-M23)</span>
        <span style="font-family: monospace; font-weight: bold;">${calculatedEl}°</span>
    </div>
</div>`;
      }
    }
  });

  const darkMatte = <meshStandardMaterial color="#1a1a1a" roughness={0.9} metalness={0} />;
  const greyMatte = <meshStandardMaterial color="#555555" roughness={0.9} metalness={0} />;
  const whiteMatte = <meshStandardMaterial color="#f0f0f0" roughness={0.9} metalness={0} />;

  return (
    <group scale={1.8}>
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} />
          {darkMatte}
        </mesh>

        {[0, 1, 2].map((i) => {
          const angle = i * (Math.PI * 2 / 3);
          return (
            <mesh key={i} position={[Math.cos(angle) * 0.18, 0.45, Math.sin(angle) * 0.18]} rotation={[0, -angle, 0]}>
              <mesh rotation={[0, 0, 0.25]}>
                <cylinderGeometry args={[0.03, 0.015, 1, 16]} />
                {greyMatte}
              </mesh>
            </mesh>
          );
        })}
      </group>

      <group ref={mountRef} position={[0, 1, 0]}>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.12, 0.15, 0.2, 32]} />
          {darkMatte}
        </mesh>

        <mesh position={[0.2, 0.35, 0]}>
          <boxGeometry args={[0.08, 0.6, 0.2]} />
          {greyMatte}
        </mesh>

        <group ref={tubeRef} position={[0, 0.5, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0.1, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.2, 16]} />
            {darkMatte}
          </mesh>

          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.4]}>
            <cylinderGeometry args={[0.15, 0.15, 2, 64]} />
            {whiteMatte}
          </mesh>

          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -1.45]}>
            <cylinderGeometry args={[0.16, 0.16, 0.15, 64]} />
            {darkMatte}
          </mesh>

          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.65]}>
            <cylinderGeometry args={[0.05, 0.05, 0.2, 32]} />
            {darkMatte}
          </mesh>

          {/* Láser apuntador tenue */}
          <mesh position={[0, 0, -15]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 30]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.25} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

function App() {
  const [location, setLocation] = useState({ lat: 19.4326, lon: -99.1332 });
  const [latInput, setLatInput] = useState(location.lat.toString());
  const [lonInput, setLonInput] = useState(location.lon.toString());

  const [stars, setStars] = useState([]);
  const [targetList, setTargetList] = useState(["Polaris", "Sirius", "Betelgeuse", "Vega", "Altair", "M42"]);
  const [newTarget, setNewTarget] = useState("");

  const [crosshairAz, setCrosshairAz] = useState(0);
  const [crosshairEl, setCrosshairEl] = useState(45);
  const [activeTargetName, setActiveTargetName] = useState("");
  const [showMath, setShowMath] = useState(false);

  const [ports, setPorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState("");
  const [connStatus, setConnStatus] = useState("No conectado");

  const fetchPorts = async () => {
    try {
      const res = await axios.get('/api/ports');
      setPorts(res.data.ports || []);
      if (res.data.connected) {
        setConnStatus(`Conectado a ${res.data.connected}`);
        setSelectedPort(res.data.connected);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPorts();
    const portInterval = setInterval(fetchPorts, 5000);
    return () => clearInterval(portInterval);
  }, []);

  const handleConnectPort = async () => {
    if (!selectedPort) return;
    try {
      await axios.post('/api/connect', { port: selectedPort });
      setConnStatus(`Conectado a ${selectedPort}`);
    } catch (e) {
      setConnStatus("Error conectando");
    }
  };

  const handleAutoDetect = async () => {
    setConnStatus("Buscando dispositivo...");
    try {
      const res = await axios.post('/api/autodetect');
      setConnStatus(`Autoconectado a ${res.data.port}`);
      fetchPorts();
    } catch (e) {
      setConnStatus("Autodetección fallida");
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setLatInput(pos.coords.latitude.toFixed(4));
          setLonInput(pos.coords.longitude.toFixed(4));
        },
        () => console.log("Geolocalización denegada.")
      );
    }
  }, []);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const queryParams = new URLSearchParams({ lat: location.lat, lon: location.lon });
        targetList.forEach(t => queryParams.append('targets', t));

        const res = await axios.get(`/api/objects?${queryParams.toString()}`);
        setStars(res.data.objects);

        if (activeTargetName) {
          const activeStar = res.data.objects.find(s => s.name.toLowerCase() === activeTargetName.toLowerCase());
          if (activeStar) {
            setCrosshairAz(activeStar.azimuth);
            setCrosshairEl(activeStar.elevation);
          }
        }
      } catch (err) {
        console.error("Error fetching stars:", err);
      }
    };

    fetchStars();
    const interval = setInterval(fetchStars, 2000);
    return () => clearInterval(interval);
  }, [location.lat, location.lon, targetList, activeTargetName]);

  const handleApplyLocation = () => {
    const parsedLat = parseFloat(latInput);
    const parsedLon = parseFloat(lonInput);
    if (!isNaN(parsedLat) && !isNaN(parsedLon)) {
      setLocation({ lat: parsedLat, lon: parsedLon });
      setActiveTargetName("");
    }
  };

  const handleTrackStar = async (star) => {
    setActiveTargetName(star.name);
    setCrosshairAz(star.azimuth);
    setCrosshairEl(star.elevation);
    
    if (star.elevation < 0) {
      setConnStatus(`Hardware omitido: ${star.name} está bajo el horizonte`);
      return; // No mandamos el comando físico al Arduino
    }
    
    try {
      await axios.post('/api/track', { azimuth: star.azimuth, elevation: star.elevation });
      setConnStatus(`Trackeando: ${star.name}`);
    } catch(e) {
      console.error("Error sending track command", e);
    }
  };

  const handleReset = async () => {
    setActiveTargetName("Calibración Central");
    setCrosshairAz(0);
    setCrosshairEl(90);
    try {
      await axios.post('/api/track', { azimuth: 0, elevation: 90 });
      setConnStatus("Modo Calibración: Ceros Mecánicos al 50%");
    } catch(e) {
      console.error("Error sending reset", e);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000', display: 'flex', overflow: 'hidden' }}>

      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, bottom: '20px', display: 'flex' }}>
        <div style={uiStyles.panel} className="glass-panel">

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexShrink: 0, marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>
              ✦
            </div>
            <h2 style={{ ...uiStyles.header, marginBottom: 0 }}>Stellar Tracker</h2>
          </div>

          <div style={{ flexShrink: 0, marginBottom: '15px' }}>
            <h3 style={uiStyles.sectionTitle}>Conexión Hardware (Gate 1)</h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <select 
                style={{ ...uiStyles.input, flex: 1, padding: '6px 10px' }}
                value={selectedPort}
                onChange={e => setSelectedPort(e.target.value)}
              >
                <option value="">Seleccionar puerto...</option>
                {ports.map(p => <option key={p.device} value={p.device}>{p.device}</option>)}
              </select>
              <button style={{ ...uiStyles.button, padding: '6px 12px' }} onClick={handleConnectPort}>Conectar</button>
            </div>
            <button 
              style={{ ...uiStyles.buttonPrimary, background: '#8b5cf6', color: '#fff', marginTop: '0', padding: '8px 16px' }} 
              onClick={handleAutoDetect}
            >
              Auto-Detectar Gate 1
            </button>
            <div style={{ fontSize: '0.75rem', color: connStatus.includes('ectad') ? '#10b981' : 'rgba(255,255,255,0.5)', marginTop: '8px', fontWeight: 'bold' }}>
              Estado: {connStatus}
            </div>
          </div>

          <div style={{ flexShrink: 0, marginBottom: '15px' }}>
            <h3 style={uiStyles.sectionTitle}>Calibración GPS</h3>
            <div style={uiStyles.inputGroup}>
              <div style={uiStyles.inputWrapper}>
                <label style={uiStyles.inputLabel}>LATITUD</label>
                <input type="number" value={latInput} onChange={e => setLatInput(e.target.value)} style={uiStyles.input} />
              </div>
              <div style={uiStyles.inputWrapper}>
                <label style={uiStyles.inputLabel}>LONGITUD</label>
                <input type="number" value={lonInput} onChange={e => setLonInput(e.target.value)} style={uiStyles.input} />
              </div>
            </div>
            <button style={uiStyles.buttonPrimary} onClick={handleApplyLocation}>
              Sincronizar
            </button>
          </div>

          <div style={{ flexShrink: 0, marginBottom: '20px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={uiStyles.sectionTitle}>SISTEMA DE CALIBRACIÓN</h3>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.4', marginBottom: '12px', marginTop: '0' }}>
              Retorna la montura a la posición origen (Norte absoluto y 45° de elevación).
            </p>
            <button 
              style={{ ...uiStyles.button, width: '100%', padding: '10px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: 'bold' }} 
              onClick={handleReset}
            >
              INICIAR RESET AL NORTE
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '150px' }}>
            <h3 style={uiStyles.sectionTitle}>Objetivos SIMBAD</h3>

            <div style={{ ...uiStyles.inputGroup, marginBottom: '15px', flexShrink: 0 }}>
              <input
                type="text"
                value={newTarget}
                onChange={e => setNewTarget(e.target.value)}
                placeholder="Nombre (ej. Luna, M31)"
                style={uiStyles.input}
              />
              <button
                onClick={() => {
                  if (newTarget && !targetList.includes(newTarget)) {
                    setTargetList([newTarget, ...targetList]);
                    setNewTarget("");
                  }
                }}
                style={uiStyles.button}
              >
                Añadir
              </button>
            </div>

            <div style={uiStyles.scrollableList} className="custom-scroll">
              <ul style={uiStyles.starList}>
                {stars.map(s => {
                  const isActive = activeTargetName.toLowerCase() === s.name.toLowerCase();

                  return (
                    <li
                      key={s.name}
                      style={{
                        ...uiStyles.starCard,
                        background: isActive ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0,0,0,0.2)',
                        borderColor: isActive ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                        opacity: 1
                      }}
                      onClick={() => handleTrackStar(s)}
                    >
                      <div>
                        <strong style={{ color: '#fff', fontSize: '1rem', fontWeight: isActive ? '700' : '500' }}>{s.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px', letterSpacing: '0.5px' }}>
                          Az: {s.azimuth.toFixed(2)}&deg; &nbsp; El: {s.elevation.toFixed(2)}&deg;
                          <span style={{ marginLeft: '8px', fontStyle: 'italic', color: s.elevation >= 0 ? 'rgba(110, 231, 183, 0.7)' : 'rgba(248, 113, 113, 0.7)' }}>
                            {s.elevation >= 0 ? '(Sobre el horizonte)' : '(Bajo el horizonte)'}
                          </span>
                        </div>
                      </div>

                      {isActive ? (
                        <div style={{ ...uiStyles.badge, color: '#000', background: '#fff' }}>
                          Tracking
                        </div>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* Botón de GitHub en la parte inferior izquierda del panel */}
          <div style={{ marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center' }}>
            <a
              href="https://github.com/Defiilol11/stellar-tracker"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'color 0.2s'
              }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              Ver en GitHub
            </a>
          </div>

        </div>
      </div>

      {/* Viewport 3D con libertad de movimiento total */}
      <div style={{ flex: 1, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <Canvas camera={{ position: [20, 10, 20], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 30, 10]} intensity={1.5} color="#ffffff" />

          <EnvironmentScene />

          {/* Agrupamos las estrellas y el fondo en el centro de rotación exacto del telescopio (Y = 2.7) 
              Esto elimina el error de paralaje (el láser apuntaba más arriba). */}
          <group position={[0, 2.7, 0]}>
            <Stars radius={100} depth={50} count={5000} factor={6} saturation={0} fade speed={1} />

            {stars.map(star => (
              <StarMarker key={star.name} data={star} isTarget={activeTargetName.toLowerCase() === star.name.toLowerCase()} />
            ))}
          </group>

          <MinimalistTelescope targetAz={crosshairAz} targetEl={crosshairEl} />

          {/* OrbitControls completamente libres: 
              - Sin restricción de ángulo polar (puedes ir bajo tierra)
              - Paneos habilitados (click derecho para arrastrar)
              - MaxDistance aumentado a 120 
          */}
          <OrbitControls
            makeDefault
            target={[0, 2, 0]}
            minDistance={4}
            maxDistance={120}
          />
        </Canvas>
      </div>

      {/* Botón flotante superior derecho */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
        <button
          onClick={() => setShowMath(true)}
          style={{
            ...uiStyles.button,
            background: 'rgba(15, 18, 22, 0.75)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '12px 24px',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
          }}
        >
          <span>ƒ(x)</span> Fundamentos Matemáticos
        </button>
      </div>

      {/* Modal / Overlay Matemático */}
      {showMath && <MathOverlay onClose={() => setShowMath(false)} />}

      {/* Panel de Cinemática Inversa (Esquina Inferior Derecha) */}
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 10 }}>
        <div style={{
          ...uiStyles.panel,
          width: '280px',
          maxHeight: '40vh',
          padding: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexShrink: 0 }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
            <h3 style={{ ...uiStyles.sectionTitle, margin: 0, color: '#fff' }}>Cinemática Inversa</h3>
          </div>
          <div className="custom-scroll" style={{ overflowY: 'auto', paddingRight: '4px' }}>
            <div id="live-matrix-content"></div>
          </div>
        </div>
      </div>

      <style>
        {`
          input:focus {
            background: rgba(0, 0, 0, 0.5) !important;
            border-color: rgba(255, 255, 255, 0.4) !important;
          }
          
          button:hover {
            transform: translateY(-1px);
          }
          button:active {
            transform: translateY(1px);
          }

          .custom-scroll::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scroll::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
          }
          .custom-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.4);
          }
        `}
      </style>
    </div>
  )
}

export default App
