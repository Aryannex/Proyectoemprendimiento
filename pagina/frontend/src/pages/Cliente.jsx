import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import { TAMANOS, formatearMoneda } from '../utils'

export default function Cliente() {
  const correo = sessionStorage.getItem('correoClienteActual')
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(Boolean(correo))
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!correo) return

    fetch('/api/pedidos/mis-pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo })
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error()
        setPedidos(data.pedidos)
      })
      .catch(() => setError(true))
      .finally(() => setCargando(false))
  }, [correo])

  return (
    <>
      <header className="navbar">
        <div className="logo"><h1>Mis Pedidos</h1></div>
        <nav>
          <Link to="/" className="btn-hero btn-volver">Volver al Inicio</Link>
        </nav>
      </header>

      <main className="seccion-formulario contenedor-cliente">
        <section>
          <h2>Seguimiento de Estado</h2>
          <p className="subtitulo">Aquí puedes consultar el progreso actual de tus lienzos personalizados.</p>

          <section className="formulario caja-pedidos">
            {!correo && <p>No has iniciado sesión. Vuelve al inicio e ingresa tu correo.</p>}
            {cargando && <p>Cargando tus pedidos...</p>}
            {error && <p>No pudimos cargar tus pedidos.</p>}

            {pedidos.map(p => (
              <article key={p._id} className="tarjeta-pedido-cliente">
                <h3>Lienzo {TAMANOS[p.tamano]?.etiqueta || p.tamano}</h3>
                <p><strong>Fecha del pedido:</strong> {new Date(p.createdAt).toLocaleDateString('es-CO')}</p>
                <p><strong>Costo Total:</strong> {formatearMoneda(p.total)}</p>
                <p><strong>Estado del Lienzo:</strong> <span className="texto-estado-cliente">{p.estado}</span></p>
              </article>
            ))}
          </section>
        </section>
      </main>

      <Footer />
    </>
  )
}