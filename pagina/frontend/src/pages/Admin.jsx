import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import { TAMANOS, formatearMoneda } from '../utils'

function cabeceras() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${sessionStorage.getItem('tokenAdmin')}`
  }
}

function TarjetaPedido({ pedido, onCambiarEstado }) {
  const [abierto, setAbierto] = useState(false)

  return (
    <article className="tarjeta-pedido">
      <div className="cabecera-tarjeta-admin">
        <h3>Pedido de: {pedido.nombre}</h3>
        <button type="button" className={`btn-desplegar ${abierto ? 'girar' : ''}`}
          aria-label="Ver detalles" onClick={() => setAbierto(!abierto)}>
          ▼
        </button>
      </div>
      <p><strong>Correo:</strong> {pedido.correo}</p>
      <p><strong>Estado Actual:</strong> <span className="texto-estado">{pedido.estado}</span></p>

      <div className={`detalles-ocultos ${abierto ? 'activo' : ''}`}>
        <p><strong>Teléfono:</strong> {pedido.telefono}</p>
        <p><strong>Dirección:</strong> {pedido.direccion}</p>
        <p><strong>Tamaño:</strong> {TAMANOS[pedido.tamano]?.etiqueta || pedido.tamano}</p>
        <p><strong>Total:</strong> {formatearMoneda(pedido.total)}</p>
        <p><strong>Descripción:</strong> {pedido.descripcion || 'Sin descripción'}</p>
        <a href={`/uploads/${pedido.foto}`} target="_blank" rel="noreferrer">
          <img src={`/uploads/${pedido.foto}`} alt={`Foto de ${pedido.nombre}`}
            style={{ maxWidth: 200, borderRadius: 8, marginTop: 6 }} />
        </a>
      </div>

      <div style={{ marginTop: 15 }}>
        <label>Cambiar Estado: </label>
        <select value={pedido.estado} onChange={(e) => onCambiarEstado(pedido._id, e.target.value)}>
          <option value="En espera">En espera</option>
          <option value="En proceso">En proceso</option>
          <option value="Entregado">Entregado</option>
        </select>
      </div>
    </article>
  )
}

export default function Admin() {
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  function cerrarSesion() {
    sessionStorage.removeItem('tokenAdmin')
    navigate('/')
  }

  useEffect(() => {
    if (!sessionStorage.getItem('tokenAdmin')) {
      navigate('/')
      return
    }

    async function cargarPedidos() {
      try {
        const res = await fetch('/api/pedidos', { headers: cabeceras() })
        if (res.status === 401) {
          alert('Tu sesión expiró. Inicia sesión de nuevo.')
          sessionStorage.removeItem('tokenAdmin')
          navigate('/')
          return
        }
        if (!res.ok) throw new Error('Error del servidor')
        setPedidos(await res.json())
      } catch (e) {
        console.error('Error cargando panel admin:', e)
        setError(true)
      } finally {
        setCargando(false)
      }
    }

    cargarPedidos()
  }, [navigate])

  async function cambiarEstado(id, nuevoEstado) {
    try {
      const res = await fetch(`/api/pedidos/${id}/estado`, {
        method: 'PUT',
        headers: cabeceras(),
        body: JSON.stringify({ estado: nuevoEstado })
      })
      if (!res.ok) throw new Error()
      setPedidos(pedidos.map(p => p._id === id ? { ...p, estado: nuevoEstado } : p))
    } catch {
      alert('No se pudo actualizar el estado.')
    }
  }

  return (
    <>
      <header className="navbar">
        <div className="logo"><h1>Panel de Administración</h1></div>
        <nav>
          <button className="btn-hero" onClick={cerrarSesion}
            style={{ background: 'var(--color-secundario)', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
            Cerrar Sesión
          </button>
        </nav>
      </header>

      <main className="seccion-formulario" style={{ maxWidth: 900 }}>
        <section>
          <h2>Gestión de Solicitudes</h2>
          <p className="subtitulo">Administra los pedidos de cuadros personalizados y actualiza sus estados.</p>

          <section className="formulario" style={{ background: 'var(--bg-resumen)' }}>
            {cargando && <p>Cargando pedidos...</p>}
            {error && <p>Hubo un error al cargar los pedidos.</p>}
            {!cargando && !error && pedidos.length === 0 && <p>No hay solicitudes registradas todavía.</p>}
            {pedidos.map(p => (
              <TarjetaPedido key={p._id} pedido={p} onCambiarEstado={cambiarEstado} />
            ))}
          </section>
        </section>
      </main>

      <Footer />
    </>
  )
}