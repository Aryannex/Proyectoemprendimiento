import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

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

  async function entrar(e) {
    e.preventDefault()
    const user = usuario.trim().toLowerCase()

    if (user === 'admin') {
      if (clave.trim() === '954') {
        sessionStorage.setItem('esAdmin', 'true')
        navigate('/admin')
      } else {
        alert('Contraseña de administrador incorrecta.')
      }
      return
    }

    try {
      const res = await fetch(`/api/pedidos/cliente/${encodeURIComponent(user)}`)
      const pedidos = await res.json()
      if (res.ok && pedidos.length > 0) {
        sessionStorage.setItem('correoClienteActual', user)
        navigate('/cliente')
      } else {
        alert('No encontramos pedidos registrados con este correo.')
      }
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
          onClick={() => setVerAdmin(!verAdmin)}
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
