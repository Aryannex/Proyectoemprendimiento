import { useState, useRef, useEffect } from 'react'

const MODOS = {
  recomendador: {
    titulo: 'Recomiéndame un tamaño!',
    saludo: '¡Hola! Te ayudo a elegir el tamaño ideal. ¿Para qué es el cuadro: un regalo, decoración o un recuerdo?'
  },
  creativo: {
    titulo: 'Ideas para mi lienzo ⭐',
    saludo: '¡Hola! Cuéntame qué foto o momento quieres plasmar en el lienzo y te propongo ideas de colores, estilo o tal vez una dedicatoria.'
  }
}

function extraerDescripcion(texto) {
  const m = texto.match(/DESCRIPCI[ÓO]N:\s*(.+)/i)
  return m ? m[1].replace(/[*"“”]/g, '').trim().slice(0, 500) : null
}

export default function ChatAsistente({ onUsarIdea }) {
  const [abierto, setAbierto] = useState(false)
  const [modo, setModo] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [texto, setTexto] = useState('')
  const [cargando, setCargando] = useState(false)
  const [aviso, setAviso] = useState('')
  const finRef = useRef(null)

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, cargando])

  function elegirModo(clave) {
    setModo(clave)
    setMensajes([])
    setAviso('')
  }

  function volverAlMenu() {
    setModo(null)
    setMensajes([])
    setAviso('')
  }

  async function enviar(e) {
    e.preventDefault()
    const t = texto.trim()
    if (!t || cargando) return

    const nuevos = [...mensajes, { rol: 'user', texto: t }]
    setMensajes(nuevos)
    setTexto('')
    setAviso('')
    setCargando(true)

    // acepta máximo 11 mensajes de 500 caracteres, y el primero debe ser del usuario
    let historial = nuevos.slice(-11).map(m => ({ rol: m.rol, texto: m.texto.slice(0, 500) }))
    while (historial.length > 0 && historial[0].rol !== 'user') historial = historial.slice(1)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modo, mensajes: historial })
      })
      const data = await res.json()

      if (data.success) {
        setMensajes([...nuevos, { rol: 'assistant', texto: data.respuesta }])
      } else {
        setAviso(data.error || 'No pude responder. Intenta de nuevo.')
      }
    } catch (error) {
      console.error(error)
      setAviso('No se pudo conectar con el servidor.')
    } finally {
      setCargando(false)
    }
  }

  function usarIdea(descripcion) {
    onUsarIdea(descripcion)
    setAbierto(false)
  }

  if (!abierto) {
    return (
      <button className="chat-flotante" onClick={() => setAbierto(true)}>
        💬 Asistente, para ayudarte👌
      </button>
    )
  }

  return (
    <section className="chat-panel" aria-label="Asistente virtual">
      <header className="chat-cabecera">
        <strong>Asistente de Momentos Eternos</strong>
        <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar chat">✕</button>
      </header>

      {!modo ? (
        <div className="chat-menu">
          <p>¿En qué te ayudo?</p>
          {Object.entries(MODOS).map(([clave, m]) => (
            <button key={clave} type="button" className="chat-opcion" onClick={() => elegirModo(clave)}>
              {m.titulo}
            </button>
          ))}
          <p className="chat-nota">Por tu privacidad, no escribas nadota de tus datos personales (nombre, teléfono, dirección o correo).</p>
        </div>
      ) : (
        <>
          <div className="chat-mensajes">
            <div className="burbuja assistant">{MODOS[modo].saludo}</div>

            {mensajes.map((m, i) => {
              const idea = m.rol === 'assistant' ? extraerDescripcion(m.texto) : null
              return (
                <div key={i} className={`burbuja ${m.rol}`}>
                  {m.texto}
                  {idea && (
                    <button type="button" className="btn-usar-idea" onClick={() => usarIdea(idea)}>
                      Usar esta idea
                    </button>
                  )}
                </div>
              )
            })}

            {cargando && <div className="burbuja assistant">Escribiendo...</div>}
            {aviso && <p className="chat-aviso">{aviso}</p>}
            <div ref={finRef} />
          </div>

          <form className="chat-form" onSubmit={enviar}>
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribe tu mensaje..."
              maxLength={500}
              aria-label="Mensaje"
            />
            <button type="submit" disabled={cargando}>Enviar</button>
          </form>

          <button type="button" className="chat-volver" onClick={volverAlMenu}>
            ← Cambiar de opción
          </button>
        </>
      )}
    </section>
  )
}