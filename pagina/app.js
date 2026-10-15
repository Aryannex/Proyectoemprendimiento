document.addEventListener('DOMContentLoaded', () => {

  // DOM - Formulario y Tienda - 
  const selectTamano = document.getElementById('tamano');
  const precioLienzoElemento = document.getElementById('precioLienzo');
  const precioTotalElemento = document.getElementById('precioTotal');
  const inputFoto = document.getElementById('foto');
  const imgPreview = document.getElementById('imgPreview');
  const orderForm = document.getElementById('orderForm');

  // DOM - Modal de Login - 
  const btnLogin = document.getElementById('btnLogin');
  const modalLogin = document.getElementById('modalLogin');
  const btnCerrarModal = document.getElementById('btnCerrarModal');
  const btnEntrar = document.getElementById('btnEntrar');
  const inputUsuario = document.getElementById('inputUsuario');
  const inputClaveCorreo = document.getElementById('inputClaveCorreo');

  // precio de envío
  const PRECIO_ENVIO = 20000;

  // formatear a pesos colombianos (COP)
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

  // Previsualizacion la foto cargada por el usuario
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

  // Manejo del envío del formulario (Guarda en localStorage) CAMBIAR A BASE DE DATOS MONGODB
  if (orderForm) {
    orderForm.addEventListener('submit', (evento) => {
      evento.preventDefault();

      const nombre = document.getElementById('nombre').value;
      const correo = document.getElementById('correo').value;
      const telefono = document.getElementById('telefono').value;
      const direccion = document.getElementById('direccion').value;
      const total = precioTotalElemento.textContent;

      // creacion de un objeto 
      const nuevoPedido = {
        id: Date.now(),
        nombre,
        correo,
        telefono,
        direccion,
        total,
        estado: 'En espera' // Estado inicial 
      };

      // Obtener pedidos anteriores o inicializar array vacío
      let pedidos = JSON.parse(localStorage.getItem('pedidosLienzos')) || [];
      pedidos.push(nuevoPedido);
      localStorage.setItem('pedidosLienzos', JSON.stringify(pedidos));

      alert(`¡Gracias ${nombre}! Tu solicitud ha sido agendada con éxito.\nTotal a pagar (con envío): ${total}.\nNos pondremos en contacto contigo pronto.`);

      orderForm.reset();
      if (imgPreview) imgPreview.style.display = 'none';
      calcularTotal();
    });
  }

  // Logica de login para admin y clientes

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
      const usuarioIngresado = inputUsuario.value.trim();
      const claveOcorreo = inputClaveCorreo.value.trim();
      const correoIngresado = claveOcorreo.toLowerCase();

      // Administrador (usuario "admin" y contraseña fija "Shadday1234")
      if (usuarioIngresado.toLowerCase() === 'admin' && claveOcorreo === 'Shadday1234') {
        alert('Bienvenido Administrador. Redirigiendo al panel de control...');
        window.location.href = 'admin.html';
        return;
      }

      // Cliente - nombre y correo exacto del pedido
      let pedidos = JSON.parse(localStorage.getItem('pedidosLienzos')) || [];
      
      const clienteEncontrado = pedidos.find(p => 
        p.correo.toLowerCase() === correoIngresado && 
        p.nombre.toLowerCase().includes(usuarioIngresado.toLowerCase())
      );

      if (clienteEncontrado) {
        alert(`¡Bienvenido ${clienteEncontrado.nombre}! Redirigiendo a tus pedidos...`);
        sessionStorage.setItem('correoClienteActual', clienteEncontrado.correo);
        window.location.href = 'cliente.html';
      } else {
        alert('Datos incorrectos. Por favor, ingresa tu nombre y correo exacto del pedido.');
      }
    });
  }

});