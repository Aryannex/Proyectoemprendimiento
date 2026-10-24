document.addEventListener('DOMContentLoaded', async () => {
  const contenedorCliente = document.getElementById('misPedidos');
  const correoActual = sessionStorage.getItem('correoClienteActual');

  if (!correoActual) {
    contenedorCliente.innerHTML = '<p>No has iniciado sesión con ningún correo.</p>';
    return;
  }

  try {
    const respuesta = await fetch(`/api/pedidos/cliente/${correoActual}`);
    const misPedidos = await respuesta.json();

    if (misPedidos.length === 0) {
      contenedorCliente.innerHTML = '<p>No tienes ningún pedido registrado con este correo.</p>';
    } else {
      contenedorCliente.innerHTML = '';
      misPedidos.forEach(pedido => {
        const articulo = document.createElement('article');
        articulo.classList.add('tarjeta-pedido-cliente');
        articulo.innerHTML = `
          <h3>Destinatario: ${pedido.nombre}</h3>
          <p><strong>Correo:</strong> ${pedido.correo}</p>
          <p><strong>Dirección:</strong> ${pedido.direccion}</p>
          <p><strong>Costo Total:</strong> ${pedido.total}</p>
          <p><strong>Estado del Lienzo:</strong> <span class="texto-estado-cliente">${pedido.estado}</span></p>
        `;
        contenedorCliente.appendChild(articulo);
      });
    }
  } catch (error) {
    console.error('Error al cargar pedidos del cliente:', error);
    contenedorCliente.innerHTML = '<p>Hubo un error al cargar tus pedidos.</p>';
  }
});