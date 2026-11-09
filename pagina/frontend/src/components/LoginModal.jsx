import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export default function LoginModal({ abierto, onCerrar }) {
  const dialogRef = useRef(null)
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [verAdmin, setVerAdmin] = useState(false)

  useEffect(() => {
    const d = dialogRef.current
    if (abierto && !d.open) d.showModal()
    if (!abierto && d.open) d.close()
  }, [abierto])

  async function entrarAdmin() {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ usuario: usuario.trim(), clave })
    })
    const data = await res.json()

    if (res.ok && data.success) {
      sessionStorage.setItem('tokenAdmin', data.token)
      navigate('/admin')
    } else {
      alert(data.error || 'Credenciales incorrectas.')
    }
  }

  async function entrarCliente() {
    const correo = usuario.trim().toLowerCase()

    const res = await fetch('/api/pedidos/mis-pedidos', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ correo })
    })
    const data = await res.json()

    if (res.ok && data.success) {
      sessionStorage.setItem('correoClienteActual', correo)
      navigate('/cliente')
    } else {
      alert(data.error || 'No encontramos pedidos con este correo.')
    }
  }

  async function entrar(e) {
    e.preventDefault()
    try {
      if (verAdmin) await entrarAdmin()
      else await entrarCliente()
    } catch (error) {
      console.error(error)
      alert('Error de conexión con el servidor.')
    }
  }

  return (
    <dialog ref={dialogRef} className="modal-login" onClose={onCerrar}>
      <form className="formulario-modal" onSubmit={entrar}>
        <button
          type="button"
          className="btn-mono"
          title="Modo Administrador"
          onClick={() => { setVerAdmin(!verAdmin); setClave('') }}
        >
          🎀
        </button>

        <header>
          <h3>Iniciar Sesión</h3>
          <p className="subtitulo-modal">Ingresa con tu correo electrónico</p>
        </header>

        <section>
          <label htmlFor="inputUsuario">Usuario / Correo Electrónico:</label>
          <input
            type="text"
            id="inputUsuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />

          {verAdmin && (
            <div className="admin-oculto activo">
              <label htmlFor="inputClave">Contraseña de Administrador:</label>
              <input
                type="password"
                id="inputClave"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                autoComplete="off"
                autoFocus
                required
              />
            </div>
          )}
        </section>

        <footer className="acciones-modal">
          <button type="submit" className="btn-hero">Entrar</button>
          <button type="button" className="btn-cancelar" onClick={onCerrar}>Cancelar</button>
        </footer>
      </form>
    </dialog>
  )
}