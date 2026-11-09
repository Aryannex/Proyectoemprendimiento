import { useState } from 'react'
import { TAMANOS, PRECIO_ENVIO, formatearMoneda } from '../utils'

const datosIniciales = {
  nombre: '', correo: '', telefono: '', direccion: '', descripcion: ''
}

export default function FormularioPedido() {
  const [datos, setDatos] = useState(datosIniciales)
  const [tamano, setTamano] = useState('mini')
  const [foto, setFoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [fotoKey, setFotoKey] = useState(0)
  const [enviando, setEnviando] = useState(false)

  const precioLienzo = TAMANOS[tamano].precio
  const total = precioLienzo + PRECIO_ENVIO

  function cambiar(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value })
  }

  function cambiarFoto(e) {
    const archivo = e.target.files[0]
    setFoto(archivo || null)
    setPreview(archivo ? URL.createObjectURL(archivo) : null)
  }

  async function enviar(e) {
    e.preventDefault()
    if (!foto) return alert('Sube una foto.')

    // Texto y archivo juntos
    const formData = new FormData()
    formData.append('nombre', datos.nombre)
    formData.append('correo', datos.correo)
    formData.append('telefono', datos.telefono)
    formData.append('direccion', datos.direccion)
    formData.append('descripcion', datos.descripcion)
    formData.append('tamano', tamano)
    formData.append('foto', foto)

    setEnviando(true)
    try {
      const res = await fetch('/api/pedidos', { method: 'POST', body: formData })
      const resultado = await res.json()

      if (resultado.success) {
        alert(
          `¡Gracias ${datos.nombre}! Tu pedido fue agendado.\n\n` +
          `Tu código de seguimiento es: ${resultado.codigo}\n\n` +
          `Guárdalo: lo necesitas junto con tu correo para ver el estado de tu pedido.`
        )
        setDatos(datosIniciales)
        setTamano('mini')
        setFoto(null)
        setPreview(null)
        setFotoKey(fotoKey + 1) // reinicia el campo de la foto
      } else {
        alert(resultado.error || 'Hubo un error al registrar el pedido.')
      }
    } catch (error) {
      console.error(error)
      alert('No se pudo conectar con el servidor.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main>
      <section id="formulario-solicitud" className="seccion-formulario">
        <h2>Haz tu Solicitud</h2>
        <p className="subtitulo">Diligencia tus datos para agendar tu lienzo personalizado</p>

        <form className="formulario" onSubmit={enviar}>
          <fieldset className="grupo-campo">
            <legend>1. Tus Datos Personales</legend>

            <label htmlFor="nombre">Nombre y Apellido:</label>
            <input type="text" id="nombre" name="nombre" placeholder="Ej: María Alejandra"
              value={datos.nombre} onChange={cambiar} required />

            <label htmlFor="correo">Correo Electrónico:</label>
            <input type="email" id="correo" name="correo" placeholder="mariaalejandra@email.com"
              value={datos.correo} onChange={cambiar} required />

            <label htmlFor="telefono">Número de Contacto:</label>
            <input type="tel" id="telefono" name="telefono" placeholder="Ej: +57 300 123 4567"
              value={datos.telefono} onChange={cambiar} required />

            <label htmlFor="direccion">Dirección de Envío:</label>
            <input type="text" id="direccion" name="direccion" placeholder="Calle, Carrera, Ciudad y Barrio"
              value={datos.direccion} onChange={cambiar} required />
          </fieldset>

          <fieldset className="grupo-campo">
            <legend>2. Detalles del Lienzo</legend>

            <label htmlFor="foto">Sube tu Foto (JPG, PNG o WEBP, máx. 5 MB):</label>
            <input key={fotoKey} type="file" id="foto" accept="image/jpeg,image/png,image/webp"
              onChange={cambiarFoto} required />

            <div className="preview-contenedor">
              {preview && <img src={preview} alt="Vista previa de la imagen cargada" />}
            </div>

            <label htmlFor="tamano">Selecciona el Tamaño Estándar:</label>
            <select id="tamano" value={tamano} onChange={(e) => setTamano(e.target.value)} required>
              {Object.entries(TAMANOS).map(([clave, t]) => (
                <option key={clave} value={clave}>
                  {t.etiqueta} - {formatearMoneda(t.precio)} COP
                </option>
              ))}
            </select>

            <label htmlFor="descripcion">Descripción de la Pintura (Opcional):</label>
            <textarea id="descripcion" name="descripcion" rows="4" maxLength={500}
              placeholder="Escribe aquí si quieres agregar o cambiar algún detalle en la imagen (colores de fondo, estilo, texto, etc.)"
              value={datos.descripcion} onChange={cambiar}></textarea>
          </fieldset>

          <div className="resumen-precio">
            <p>Precio del Lienzo: <span>{formatearMoneda(precioLienzo)}</span></p>
            <p>Envío Nacional: <span>{formatearMoneda(PRECIO_ENVIO)}</span></p>
            <hr />
            <h3>Total a Pagar: <output>{formatearMoneda(total)}</output></h3>
          </div>

          <button type="submit" className="btn-agendar" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Agendar Pedido'}
          </button>
        </form>
      </section>
    </main>
  )
}