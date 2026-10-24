document.addEventListener('DOMContentLoaded', () => {
  const contenedor = document.getElementById('listaPedidos');

  async function cargarPedidosAdmin() {
    try {
      const respuesta = await fetch('/api/pedidos');
      const pedidos = await respuesta.json();

      if (pedidos.length === 0) {
        contenedor.innerHTML = '<p>No hay solicitudes registradas todavía.</p>';
        return;
      }

      contenedor.innerHTML = '';
      pedidos.forEach((pedido) => {
        const articulo = document.createElement('article');
        articulo.classList.add('tarjeta-pedido'); 
        
        articulo.innerHTML = `
          <h3>Pedido de: ${pedido.nombre}</h3>
          <p><strong>Correo:</strong> ${pedido.correo}</p>
          <p><strong>Teléfono:</strong> ${pedido.telefono}</p>
          <p><strong>Dirección:</strong> ${pedido.direccion}</p>
          <p><strong>Total:</strong> ${pedido.total}</p>
          <p><strong>Estado Actual:</strong> <span class="texto-estado">${pedido.estado}</span></p>
          
          <div style="margin-top: 15px;">
            <label>Cambiar Estado: </label>
            <select class="select-estado" data-id="${pedido._id}">
              <option value="En espera" ${pedido.estado === 'En espera' ? 'selected' : ''}>En espera</option>
              <option value="En proceso" ${pedido.estado === 'En proceso' ? 'selected' : ''}>En proceso</option>
              <option value="Entregado" ${pedido.estado === 'Entregado' ? 'selected' : ''}>Entregado</option>
            </select>
          </div>
        `;
        contenedor.appendChild(articulo);
      });

      // Actualizacion de estado en tiempo real en MongoDB
      document.querySelectorAll('.select-estado').forEach(select => {
        select.addEventListener('change', async (e) => {
          const id = e.target.getAttribute('data-id');
          const nuevoEstado = e.target.value;

          await fetch(`/api/pedidos/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
          });

          alert('Estado actualizado en la base de datos.');
          cargarPedidosAdmin();
        });
      });

    } catch (error) {
      console.error('Error cargando panel admin:', error);
    }
  }

  cargarPedidosAdmin();
});