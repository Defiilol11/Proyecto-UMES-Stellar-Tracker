import React from 'react';
import { Link } from 'react-router-dom';

const styles = {
  container: {
    background: '#050608',
    color: '#e2e8f0',
    minHeight: '100vh',
    padding: '40px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, sans-serif',
    lineHeight: 1.7
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
    background: 'rgba(20, 25, 30, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '50px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
  },
  backLink: {
    display: 'inline-block',
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: 'bold',
    marginBottom: '30px',
    padding: '10px 20px',
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '8px',
    transition: 'background 0.2s',
    border: '1px solid rgba(59, 130, 246, 0.3)'
  },
  title: {
    fontSize: '2.5rem',
    color: '#fff',
    marginTop: 0,
    marginBottom: '20px',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#94a3b8',
    marginBottom: '40px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: '20px'
  },
  h2: {
    color: '#fff',
    marginTop: '50px',
    fontSize: '1.6rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: '10px'
  },
  h3: {
    color: '#e2e8f0',
    fontSize: '1.3rem',
    marginTop: '30px'
  },
  formulaBox: {
    background: 'rgba(0, 0, 0, 0.4)',
    padding: '30px',
    borderRadius: '12px',
    borderLeft: '4px solid #3b82f6',
    fontFamily: '"Cambria Math", "Times New Roman", Times, serif',
    fontSize: '1.3rem',
    textAlign: 'center',
    margin: '30px 0',
    overflowX: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap'
  }
};

// Componente auxiliar para renderizar matrices matemáticas limpiamente
const Matrix = ({ rows }) => (
  <div style={{ 
    display: 'inline-flex', 
    alignItems: 'center',
    margin: '0 5px'
  }}>
    <div style={{
      borderLeft: '2px solid #fff',
      borderTop: '2px solid #fff',
      borderBottom: '2px solid #fff',
      width: '6px',
      alignSelf: 'stretch'
    }}></div>
    <table style={{ borderCollapse: 'collapse', textAlign: 'center' }}>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} style={{ padding: '6px 15px', whiteSpace: 'nowrap' }}>
                <span dangerouslySetInnerHTML={{ __html: cell }} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    <div style={{
      borderRight: '2px solid #fff',
      borderTop: '2px solid #fff',
      borderBottom: '2px solid #fff',
      width: '6px',
      alignSelf: 'stretch'
    }}></div>
  </div>
);

export default function MathDocs() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <Link to="/" style={styles.backLink}>← Volver a la Telemetría (Simulador)</Link>
        
        <h1 style={styles.title}>Stellar Tracker</h1>
        <div style={styles.subtitle}>
          Fundamentos Matemáticos, Cinemática Directa y Modelado Mecatrónico
        </div>

        <p>
          Este documento detalla el modelo matemático y la arquitectura algorítmica del proyecto <strong>Stellar Tracker</strong>. 
          El sistema integra disciplinas de física astronómica, álgebra lineal, ingeniería de software y mecatrónica para 
          resolver el desafío de la dinámica celeste impulsada por la rotación de la Tierra.
        </p>

        <h2 style={styles.h2}>1. Dinámica Celeste y Compensación Atmosférica</h2>
        <p>
          Los catálogos estelares universales almacenan la posición de los cuerpos celestes utilizando 
          <strong> Coordenadas Ecuatoriales (Ascensión Recta y Declinación)</strong>. Para un observador terrestre, 
          estas coordenadas deben recalcularse constantemente hacia un <strong>Sistema de Coordenadas Horizontales Locales 
          (Azimut y Altitud)</strong>.
        </p>
        <p>
          El <em>backend</em> (Python + Astropy) se encarga de esta pesada carga computacional en tiempo real, 
          inyectando parámetros ambientales (e.g. Temperatura de 20°C y presión de 1013.25 hPa) para compensar la 
          <strong> refracción de la luz en la atmósfera</strong>, asegurando una precisión absoluta antes de enviar 
          la telemetría al hardware.
        </p>

        <h2 style={styles.h2}>2. Modelo Matemático y Cinemática Directa</h2>
        <p>
          Para gobernar la estructura física de seguimiento, se modela el sistema tridimensionalmente utilizando 
          cinemática directa mediante álgebra lineal. Definimos la línea de visión del puntero como un vector 
          unitario en el espacio ℝ³.
        </p>
        <p>
          Asumimos un estado de reposo (Calibración Inicial) donde el vector apunta hacia el norte geográfico, 
          paralelo al horizonte:
        </p>
        
        <div style={styles.formulaBox}>
          v<sub>0</sub> = <Matrix rows={[['1'], ['0'], ['0']]} />
        </div>

        <p>
          El mecanismo de dos grados de libertad (Pan-Tilt) ejecuta dos rotaciones sucesivas modeladas 
          mediante matrices ortogonales de 3x3:
        </p>

        <h3 style={styles.h3}>Giro Azimutal (α)</h3>
        <p>
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
        <p>
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
        <p>
          La orientación espacial final del puntero (P<sub>final</sub>) se obtiene al aplicar las transformaciones lineales al vector inicial.
        </p>
        <div style={styles.formulaBox}>
          P<sub>final</sub> = R<sub>z</sub>(α) · R<sub>y</sub>(β) · v<sub>0</sub>
        </div>
        
        <p>
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
        <p>
          El sistema mecánico opera en el espacio euclidiano tridimensional. El conjunto de transformaciones lineales 
          utilizadas pertenece formalmente al grupo especial ortogonal <strong>SO(3)</strong>. 
        </p>
        <p>
          La pertinencia matemática de utilizar R<sub>z</sub>(α) y R<sub>y</sub>(β) radica en que satisfacen las condiciones 
          de ortogonalidad y determinante unitario. Esto garantiza matemáticamente que, al realizar el seguimiento, 
          la transformación lineal preserva el <strong>producto interno (distancias y ángulos)</strong> y la orientación 
          del espacio, demostrando que el software no realiza un "movimiento arbitrario", sino que efectúa una 
          transformación abstracta sobre un espacio estructurado invariante.
        </p>

        <h2 style={styles.h2}>4. Procedimiento Experimental y Error Angular</h2>
        <p>
          Para validar el modelo físico del hardware frente a la simulación matemática, el cálculo de desviación o 
          error angular entre el vector teórico (Astropy) y el vector físico real se obtiene mediante el producto punto:
        </p>
        
        <div style={styles.formulaBox}>
          θ<sub>e</sub> = cos<sup>−1</sup> ( v<sub>ideal</sub> · v<sub>real</sub> )
        </div>
        
        <p>
          Las pruebas experimentales (utilizando actuadores SG90 en estructura ultraligera) arrojaron una 
          desviación media de apenas <strong>0.64°</strong>, manteniéndose muy por debajo del límite teórico de holgura mecánica (<em>backlash</em>) 
          estimado para este hardware (1.5°), validando la estabilidad y consistencia de las matrices del modelo cinemático.
        </p>
      </div>
    </div>
  );
}
