const contenedor = document.getElementById('listaPedidos');
    let pedidos = JSON.parse(localStorage.getItem('pedidosLienzos')) || [];

    function renderAdmin() {
      if (pedidos.length === 0) {
        contenedor.innerHTML = '<p>No hay solicitudes registradas todavía.</p>';
        return;
      }

      contenedor.innerHTML = '';
      pedidos.forEach((pedido, index) => {
        const articulo = document.createElement('article');
        articulo.style.cssText = "border: 1px solid var(--borde-color); padding: 20px; margin-bottom: 20px; border-radius: 8px; background: #fafafa;";
        articulo.innerHTML = `
          <h3>Pedido de: ${pedido.nombre}</h3>
          <p><strong>Correo:</strong> ${pedido.correo}</p>
          <p><strong>Teléfono:</strong> ${pedido.telefono}</p>
          <p><strong>Dirección de envío:</strong> ${pedido.direccion}</p>
          <p><strong>Total a pagar:</strong> ${pedido.total}</p>
          <p><strong>Estado Actual:</strong> <span style="color: var(--color-acento); font-weight: bold;">${pedido.estado}</span></p>
          
          <div style="margin-top: 15px;">
            <label for="estado-${index}">Cambiar Estado: </label>
            <select id="estado-${index}" onchange="cambiarEstado(${index}, this.value)">
              <option value="En espera" ${pedido.estado === 'En espera' ? 'selected' : ''}>En espera</option>
              <option value="En proceso" ${pedido.estado === 'En proceso' ? 'selected' : ''}>En proceso</option>
              <option value="Entregado" ${pedido.estado === 'Entregado' ? 'selected' : ''}>Entregado</option>
            </select>
          </div>
        `;
        contenedor.appendChild(articulo);
      });
    }

    window.cambiarEstado = function(index, nuevoEstado) {
      pedidos[index].estado = nuevoEstado;
      localStorage.setItem('pedidosLienzos', JSON.stringify(pedidos));
      renderAdmin();
      alert('Estado actualizado con éxito.');
    }

    renderAdmin();