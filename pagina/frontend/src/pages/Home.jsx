import { useState } from 'react'
import LoginModal from '../components/LoginModal'
import FormularioPedido from '../components/FormularioPedido'
import Footer from '../components/Footer'
import ChatAsistente from '../components/ChatAsistente'

export default function Home() {
  const [loginAbierto, setLoginAbierto] = useState(false)
  const [idea, setIdea] = useState(null)


function usarIdea(texto) {
  setIdea({ texto }) 
  document.getElementById('formulario-solicitud')?.scrollIntoView({ behavior: 'smooth' })
}

  return (
    <>
      <header className="navbar">
        <div className="logo">
          <h1>Momentos Eternos</h1>
        </div>
        <button className="btn-hero" style={{ border: 'none', cursor: 'pointer', fontSize: '1rem' }}
          onClick={() => setLoginAbierto(true)}>
          Iniciar Sesión
        </button>
      </header>

      <LoginModal abierto={loginAbierto} onCerrar={() => setLoginAbierto(false)} />

      <section className="hero-section">
        <div className="hero-content">
          <h2>Transforma tus lindos momentos en arte</h2>
          <p>Convertimos tus fotos favoritas que transmiten sentimientos en impresionantes lienzos pintados y enmarcados.</p>

          <div className="hero-actions">
            <a href="#formulario-solicitud" className="btn-principal">Agenda el tuyo</a>

            <aside className="contacto-rapido">
              <h3>Contacto Directo</h3>
              <p><strong>Atención:</strong> Nahiomy Cafroni Pacheco</p>
              <p><strong>Correo:</strong> info@momentoseternos.com</p>
              <p><strong>Teléfono / WhatsApp:</strong> +57 300 123 4567</p>
              <p><strong>Instagram:</strong> @momentoseternos</p>
            </aside>
          </div>
        </div>
      </section>

      <section className="galeria-section">
        <h2>Muestras de Arte</h2>
        <p className="subtitulo">Conoce algunos de los trabajos realizados para nuestros clientes</p>

        <div className="galeria-grid">
          <article className="tarjeta-arte">
            <img src="/imagenes/still-life-painting-oil-painting-tropical-flowers-thumb900.jpg" alt="Muestra de cuadro de flores al óleo" />
            <h3>~ Lienzo Floral al Óleo ~</h3>
          </article>
          <article className="tarjeta-arte">
            <img src="/imagenes/Retrato-de-una-pareja-en-la-playa-1.jpg" alt="Muestra de retrato minimalista" />
            <h3>~ Retrato de Pareja ~</h3>
          </article>
          <article className="tarjeta-arte">
            <img src="/imagenes/venecia.jpg" alt="Muestra de arte de paisaje urbano" />
            <h3>~ Paisaje urbano ~</h3>
          </article>
        </div>
      </section>

      <FormularioPedido idea={idea} />
      <ChatAsistente onUsarIdea={usarIdea} />
      <Footer />
    </>
  )
}