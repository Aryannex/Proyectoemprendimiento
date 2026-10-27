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

  // Enviar formulario y guardarlo en MongoDB vía API
  if (orderForm) {
    orderForm.addEventListener('submit', async (evento) => {
      evento.preventDefault();

      const nuevoPedido = {
        nombre: document.getElementById('nombre').value,
        correo: document.getElementById('correo').value,
        telefono: document.getElementById('telefono').value,
        direccion: document.getElementById('direccion').value,
        total: precioTotalElemento.textContent
      };

      try {
        const respuesta = await fetch('/api/pedidos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevoPedido)
        });

        const resultado = await respuesta.json();

        if (resultado.success) {
          alert(`¡Gracias ${nuevoPedido.nombre}! Tu solicitud ha sido agendada con éxito en el sistema.`);
          orderForm.reset();
          if (imgPreview) imgPreview.style.display = 'none';
          calcularTotal();
        } else {
          alert('Hubo un error al registrar el pedido.');
        }
      } catch (error) {
        console.error('Error de red:', error);
        alert('No se pudo conectar con el servidor.');
      }
    });
  }

  // Logica de login para admin y clientes

  if (btnLogin) {
    btnLogin.addEventListener('click', (e) => {
      e.preventDefault();
      if (modalLogin) modalLogin.showModal();
    });
  }

 if (btnCerrarModal) {
    btnCerrarModal.addEventListener('click', () => {
      if (modalLogin) modalLogin.close();
    });
  }

  // Campo de contraseña con el moño interactivo
  const btnToggleAdmin = document.getElementById('btnToggleAdmin');
  const seccionAdmin = document.getElementById('seccionAdmin');

  if (btnToggleAdmin && seccionAdmin) {
    btnToggleAdmin.addEventListener('click', () => {
      seccionAdmin.classList.toggle('activo');
      
      // Si se abre, automáticamente sale en el campo de contraseña
      if (seccionAdmin.classList.contains('activo')) {
        const inputClave = document.getElementById('inputClaveCorreo');
        if (inputClave) inputClave.focus();
      }
    });
  }


 // Validacion de roles al Iniciar Sesión
  if (btnEntrar) {
    btnEntrar.addEventListener('click', async () => {
      const inputVal = inputUsuario.value.trim().toLowerCase();
      const claveVal = inputClaveCorreo.value.trim();

      // 1. Validación de Administrador (si la clave tiene contenido o el usuario es admin)
      if (inputVal === 'admin' && claveVal === '954') {
        alert('Bienvenido Administrador.');
        window.location.href = 'admin.html';
        return;
      }

      // Si intentó entrar como admin pero la contraseña es incorrecta
      if (inputVal === 'admin' && claveVal !== '954') {
        alert('Contraseña de administrador incorrecta.');
        return;
      }

      // 2. Validación de Cliente (buscando el correo en la base de datos de MongoDB)
      try {
        const respuesta = await fetch(`/api/pedidos/cliente/${inputVal}`);
        const pedidosCliente = await respuesta.json();

        if (respuesta.ok && pedidosCliente.length > 0) {
          alert('¡Bienvenido! Encontramos tus pedidos.');
          sessionStorage.setItem('correoClienteActual', inputVal);
          window.location.href = 'cliente.html';
        } else {
          alert('No encontramos pedidos registrados con este correo o el usuario no existe.');
        }
      } catch (error) {
        console.error('Error al verificar cliente:', error);
        alert('Error de conexión con el servidor al verificar el usuario.');
      }
    });
  }
});