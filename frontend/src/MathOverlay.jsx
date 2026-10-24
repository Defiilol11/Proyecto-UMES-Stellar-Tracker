import React from 'react';

const styles = {
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  },
  modal: {
    width: '100%',
    maxWidth: '900px',
    maxHeight: '100%',
    // Glassmorfismo real, idéntico al panel maestro
    background: 'rgba(15, 18, 22, 0.75)',
    backdropFilter: 'blur(20px) saturate(120%)',
    WebkitBackdropFilter: 'blur(20px) saturate(120%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    color: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    lineHeight: 1.6,
    overflow: 'hidden',
    boxSizing: 'border-box'
  },
  header: {
    padding: '24px 30px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0
  },
  title: {
    fontSize: '1.4rem',
    color: '#fff',
    margin: 0,
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },
  closeBtn: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#fff',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '1.2rem',
    lineHeight: '1',
    paddingBottom: '2px'
  },
  scrollContent: {
    padding: '30px',
    overflowY: 'auto',
    flex: 1
  },
  p: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: '0.95rem',
    marginBottom: '20px'
  },
  h2: {
    color: '#fff',
    marginTop: '40px',
    marginBottom: '20px',
    fontSize: '1.2rem',
    fontWeight: '700',
    letterSpacing: '-0.3px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '10px'
  },
  h3: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.85rem',
    marginTop: '30px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '700'
  },
  formulaBox: {
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    padding: '25px',
    borderRadius: '8px',
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: '1.2rem',
    textAlign: 'center',
    margin: '25px 0',
    overflowX: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap'
  }
};

const Matrix = ({ rows }) => (
  <div style={{ 
    display: 'inline-flex', 
    alignItems: 'center',
    margin: '0 5px'
  }}>
    <div style={{
      borderLeft: '1px solid rgba(255,255,255,0.6)',
      borderTop: '1px solid rgba(255,255,255,0.6)',
      borderBottom: '1px solid rgba(255,255,255,0.6)',
      width: '6px',
      alignSelf: 'stretch'
    }}></div>
    <table style={{ borderCollapse: 'collapse', textAlign: 'center' }}>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} style={{ padding: '4px 12px', whiteSpace: 'nowrap', color: '#fff' }}>
                <span dangerouslySetInnerHTML={{ __html: cell }} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    <div style={{
      borderRight: '1px solid rgba(255,255,255,0.6)',
      borderTop: '1px solid rgba(255,255,255,0.6)',
      borderBottom: '1px solid rgba(255,255,255,0.6)',
      width: '6px',
      alignSelf: 'stretch'
    }}></div>
  </div>
);

export default function MathOverlay({ onClose }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>
              ƒ
            </div>
            <h1 style={styles.title}>Fundamentos Matemáticos</h1>
          </div>
          <button 
            style={styles.closeBtn} 
            onClick={onClose} 
            onMouseEnter={e => { e.target.style.background = '#fff'; e.target.style.color = '#000'; }} 
            onMouseLeave={e => { e.target.style.background = 'rgba(255, 255, 255, 0.1)'; e.target.style.color = '#fff'; }}
          >
            &times;
          </button>
        </div>
        
        <div style={styles.scrollContent} className="custom-scroll">
          <p style={styles.p}>
            Este documento detalla el modelo matemático y la arquitectura algorítmica del sistema. 
            El software integra disciplinas de física astronómica, álgebra lineal, ingeniería de software y mecatrónica para 
            resolver el desafío de la dinámica celeste impulsada por la rotación de la Tierra.
          </p>

          <h2 style={styles.h2}>1. Dinámica Celeste y Compensación Atmosférica</h2>
          <p style={styles.p}>
            Los catálogos estelares universales almacenan la posición de los cuerpos celestes utilizando 
            <strong> Coordenadas Ecuatoriales (Ascensión Recta y Declinación)</strong>. Para un observador terrestre, 
            estas coordenadas deben recalcularse constantemente hacia un <strong>Sistema de Coordenadas Horizontales Locales 
            (Azimut y Altitud)</strong>.
          </p>
          <p style={styles.p}>
            El backend (Python + Astropy) se encarga de esta pesada carga computacional en tiempo real, 
            inyectando parámetros ambientales (e.g. Temperatura de 20°C y presión de 1013.25 hPa) para compensar la 
            refracción de la luz en la atmósfera, asegurando una precisión absoluta antes de enviar 
            la telemetría al hardware.
          </p>

          <h2 style={styles.h2}>2. Modelo Matemático y Cinemática Directa</h2>
          <p style={styles.p}>
            Para gobernar la estructura física de seguimiento, se modela el sistema tridimensionalmente utilizando 
            cinemática directa mediante álgebra lineal. Definimos la línea de visión del puntero como un vector 
            unitario en el espacio ℝ³. Asumimos un estado de reposo (Calibración Inicial) donde el vector apunta hacia el norte geográfico, 
            paralelo al horizonte:
          </p>
          
          <div style={styles.formulaBox}>
            v<sub>0</sub> = <Matrix rows={[['1'], ['0'], ['0']]} />
          </div>

          <p style={styles.p}>
            El mecanismo de dos grados de libertad (Pan-Tilt) ejecuta dos rotaciones sucesivas modeladas 
            mediante matrices ortogonales de 3x3:
          </p>

          <h3 style={styles.h3}>Giro Azimutal (α)</h3>
          <p style={styles.p}>
            Rotación alrededor del eje Z (eje vertical perpendicular al suelo). Determina la dirección cardinal.
          </p>
          <div style={styles.formulaBox}>
            R<sub>z</sub>(α) = <Matrix rows={[
              ['cos α', '−sin α', '0'],
              ['sin α', 'cos α', '0'],
              ['0', '0', '1']
            ]} />
          </div>

          <h3 style={styles.h3}>Elevación de Altitud (β)</h3>
          <p style={styles.p}>
            Rotación alrededor del nuevo eje Y (eje lateral). Determina la altura del objeto sobre el horizonte.
          </p>
          <div style={styles.formulaBox}>
            R<sub>y</sub>(β) = <Matrix rows={[
              ['cos β', '0', 'sin β'],
              ['0', '1', '0'],
              ['−sin β', '0', 'cos β']
            ]} />
          </div>

          <h3 style={styles.h3}>Ecuación Cinemática del Sistema</h3>
          <p style={styles.p}>
            La orientación espacial final del puntero (P<sub>final</sub>) se obtiene al aplicar las transformaciones lineales al vector inicial.
          </p>
          <div style={styles.formulaBox}>
            P<sub>final</sub> = R<sub>z</sub>(α) · R<sub>y</sub>(β) · v<sub>0</sub>
          </div>
          
          <p style={styles.p}>
            Al multiplicar las matrices, obtenemos la representación matricial coherente de los vectores espaciales:
          </p>
          
          <div style={styles.formulaBox}>
            P<sub>final</sub> = <Matrix rows={[
              ['cos β · cos α'],
              ['cos β · sin α'],
              ['sin β']
            ]} />
          </div>

          <h2 style={styles.h2}>3. Dimensión Epistemológica (Grupo Ortogonal SO(3))</h2>
          <p style={styles.p}>
            El sistema mecánico opera en el espacio euclidiano tridimensional. El conjunto de transformaciones lineales 
            utilizadas pertenece formalmente al grupo especial ortogonal <strong>SO(3)</strong>. 
          </p>
          <p style={styles.p}>
            La pertinencia matemática de utilizar R<sub>z</sub>(α) y R<sub>y</sub>(β) radica en que satisfacen las condiciones 
            de ortogonalidad y determinante unitario. Esto garantiza matemáticamente que, al realizar el seguimiento, 
            la transformación lineal preserva el <strong>producto interno (distancias y ángulos)</strong> y la orientación 
            del espacio, demostrando que el software no realiza un "movimiento arbitrario", sino que efectúa una 
            transformación abstracta sobre un espacio estructurado invariante.
          </p>

          <h2 style={styles.h2}>4. Procedimiento Experimental y Error Angular</h2>
          <p style={styles.p}>
            Para validar el modelo físico del hardware frente a la simulación matemática, el cálculo de desviación o 
            error angular entre el vector teórico (Astropy) y el vector físico real se obtiene mediante el producto punto:
          </p>
          
          <div style={styles.formulaBox}>
            θ<sub>e</sub> = cos<sup>−1</sup> ( v<sub>ideal</sub> · v<sub>real</sub> )
          </div>
          
          <p style={styles.p}>
            Las pruebas experimentales arrojaron una 
            desviación media de apenas <strong>0.64°</strong>, manteniéndose muy por debajo del límite teórico de holgura mecánica (<em>backlash</em>) 
            estimado para este hardware (1.5°), validando la estabilidad y consistencia de las matrices del modelo cinemático.
          </p>
        </div>
      </div>
    </div>
  );
}
