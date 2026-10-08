document.addEventListener('DOMContentLoaded', () => {

  // Elementos DOM
  const selectTamano = document.getElementById('tamano');
  const precioLienzoElemento = document.getElementById('precioLienzo');
  const precioTotalElemento = document.getElementById('precioTotal');
  const inputFoto = document.getElementById('foto');
  const imgPreview = document.getElementById('imgPreview');
  const orderForm = document.getElementById('orderForm');

  // Constante fija del precio de envío
  const PRECIO_ENVIO = 20000;

  // Función para formatear a pesos colombianos (COP)
  function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(valor);
  }

  // 1. Calcular precio total dinámicamente según la opción elegida
  function calcularTotal() {
    const precioLienzo = parseInt(selectTamano.value);
    const total = precioLienzo + PRECIO_ENVIO;

    // Actualizar los valores en el HTML
    precioLienzoElemento.textContent = formatearMoneda(precioLienzo);
    precioTotalElemento.textContent = formatearMoneda(total);
  }

  // usuario cambia el tamaño del lienzo
  selectTamano.addEventListener('change', calcularTotal);

  // 2. Previsualizar la foto cargada por el usuario
  inputFoto.addEventListener('change', (evento) => {
    const archivo = evento.target.files[0];

    if (archivo) {
      const lector = new FileReader();

      lector.onload = function(e) {
        imgPreview.src = e.target.result;
        imgPreview.style.display = 'inline-block';
      };

      lector.readAsDataURL(archivo);
    }
  });

  // 3. Manejo del envío del formulario
  orderForm.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const total = precioTotalElemento.textContent;

    alert(`¡Gracias ${nombre}! Tu solicitud ha sido agendada con éxito.\nTotal a pagar (con envío): ${total}.\nNos pondremos en contacto contigo pronto.`);

    // Opcional: limpiar el formulario tras agendar
    orderForm.reset();
    imgPreview.style.display = 'none';
    calcularTotal();
  });

});