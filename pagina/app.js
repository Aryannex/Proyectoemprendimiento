document.addEventListener('DOMContentLoaded', () => {

  // Elementos DOM existentes
  const selectTamano = document.getElementById('tamano');
  const precioLienzoElemento = document.getElementById('precioLienzo');
  const precioTotalElemento = document.getElementById('precioTotal');
  const inputFoto = document.getElementById('foto');
  const imgPreview = document.getElementById('imgPreview');
  const orderForm = document.getElementById('orderForm');

  // El modal de Login
  const btnLogin = document.getElementById('btnLogin');
  const modalLogin = document.getElementById('modalLogin');
  const btnCerrarModal = document.getElementById('btnCerrarModal');
  const btnEntrar = document.getElementById('btnEntrar');
  const userInput = document.getElementById('userInput');

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

  // Calcular precio total 
  function calcularTotal() {
    if (!selectTamano) return;
    const precioLienzo = parseInt(selectTamano.value);
    const total = precioLienzo + PRECIO_ENVIO;

    precioLienzoElemento.textContent = formatearMoneda(precioLienzo);
    precioTotalElemento.textContent = formatearMoneda(total);
  }

  if (selectTamano) {
    selectTamano.addEventListener('change', calcularTotal);
  }

  // Previsualizar la foto cargada por el usuario
  if (inputFoto) {
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
  }

  // Manejo del envío del formulario 
  if (orderForm) {
    orderForm.addEventListener('submit', (evento) => {
      evento.preventDefault();

      const nombre = document.getElementById('nombre').value;
      const correo = document.getElementById('correo').value;
      const telefono = document.getElementById('telefono').value;
      const direccion = document.getElementById('direccion').value;
      const total = precioTotalElemento.textContent;

      const nuevoPedido = {
        id: Date.now(),
        nombre,
        correo,
        telefono,
        direccion,
        total,
        estado: 'En espera'
      };

      let pedidos = JSON.parse(localStorage.getItem('pedidosLienzos')) || [];
      pedidos.push(nuevoPedido);
      localStorage.setItem('pedidosLienzos', JSON.stringify(pedidos));

      alert(`¡Gracias ${nombre}! Tu solicitud ha sido agendada con éxito.\nTotal a pagar (con envío): ${total}.\nNos pondremos en contacto contigo pronto.`);

      orderForm.reset();
      if (imgPreview) imgPreview.style.display = 'none';
      calcularTotal();
    });
  }

  // Apertura y acceso a login
  if (btnLogin) {
    btnLogin.addEventListener('click', (e) => {
      e.preventDefault();
      if (modalLogin) {
        modalLogin.showModal();
      }
    });
  }

  if (btnCerrarModal) {
    btnCerrarModal.addEventListener('click', () => {
      if (modalLogin) {
        modalLogin.close();
      }
    });
  }

  if (btnEntrar) {
    btnEntrar.addEventListener('click', () => {
      const rol = userInput.value.trim().toLowerCase();

      if (rol === 'admin') {
        alert('Bienvenido Administrador. Redirigiendo al panel...');
        window.location.href = 'admin.html';
      } else if (rol === 'cliente') {
        alert('Bienvenido Cliente. Redirigiendo a tus pedidos...');
        window.location.href = 'cliente.html';
      } else {
        alert('Usuario no válido. Escribe "admin" o "cliente".');
      }
    });
  }

});