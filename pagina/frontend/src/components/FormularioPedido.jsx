import { useState } from 'react'

const PRECIO_ENVIO = 20000

function formatearMoneda(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(valor)
}

const datosIniciales = {
  nombre: '', correo: '', telefono: '', direccion: '', descripcion: ''
}

export default function FormularioPedido() {
  const [datos, setDatos] = useState(datosIniciales)
  const [tamano, setTamano] = useState('35000')
  const [preview, setPreview] = useState(null)
  const [fotoKey, setFotoKey] = useState(0)

  const precioLienzo = parseInt(tamano)
  const total = precioLienzo + PRECIO_ENVIO

  function cambiar(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value })
  }

  function cambiarFoto(e) {
    const archivo = e.target.files[0]
    setPreview(archivo ? URL.createObjectURL(archivo) : null)
  }

  async function enviar(e) {
    e.preventDefault()

    const nuevoPedido = {
      nombre: datos.nombre,
      correo: datos.correo,
      telefono: datos.telefono,
      direccion: datos.direccion,
      total: formatearMoneda(total)
    }

    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoPedido)
      })
      const resultado = await res.json()

      if (resultado.success) {
        alert(`¡Gracias ${datos.nombre}! Tu solicitud ha sido agendada con éxito.`)
        setDatos(datosIniciales)
        setTamano('35000')
        setPreview(null)
        setFotoKey(fotoKey + 1) // reinicia el campo de la foto
      } else {
        alert('Hubo un error al registrar el pedido.')
      }
    } catch (error) {
      console.error(error)
      alert('No se pudo conectar con el servidor.')
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

            <label htmlFor="foto">Sube tu Foto:</label>
            <input key={fotoKey} type="file" id="foto" accept="image/*"
              onChange={cambiarFoto} required />

            <div className="preview-contenedor">
              {preview && <img src={preview} alt="Vista previa de la imagen cargada" />}
            </div>

            <label htmlFor="tamano">Selecciona el Tamaño Estándar:</label>
            <select id="tamano" value={tamano} onChange={(e) => setTamano(e.target.value)} required>
              <option value="35000">Mini (20 x 30 cm) - $35.000 COP</option>
              <option value="50000">Pequeño (30 x 40 cm) - $50.000 COP</option>
              <option value="130000">Mediano (50 x 70 cm) - $130.000 COP</option>
              <option value="180000">Grande (70 x 100 cm) - $180.000 COP</option>
            </select>

            <label htmlFor="descripcion">Descripción de la Pintura (Opcional):</label>
            <textarea id="descripcion" name="descripcion" rows="4"
              placeholder="Escribe aquí si quieres agregar o cambiar algún detalle en la imagen (colores de fondo, estilo, texto, etc.)"
              value={datos.descripcion} onChange={cambiar}></textarea>
          </fieldset>

          <div className="resumen-precio">
            <p>Precio del Lienzo: <span>{formatearMoneda(precioLienzo)}</span></p>
            <p>Envío Nacional: <span>{formatearMoneda(PRECIO_ENVIO)}</span></p>
            <hr />
            <h3>Total a Pagar: <output>{formatearMoneda(total)}</output></h3>
          </div>

          <button type="submit" className="btn-agendar">Agendar Pedido</button>
        </form>
      </section>
    </main>
  )
}