const contenedorCliente = document.getElementById('misPedidos');
    let pedidos = JSON.parse(localStorage.getItem('pedidosLienzos')) || [];

    if (pedidos.length === 0) {
      contenedorCliente.innerHTML = '<p>No tienes ningún pedido registrado en este navegador.</p>';
    } else {
      pedidos.forEach(pedido => {
        const articulo = document.createElement('article');
        articulo.style.cssText = "border: 1px solid var(--color-primario); padding: 20px; margin-bottom: 20px; border-radius: 8px; background: #FFF7F5;";
        articulo.innerHTML = `
          <h3>Destinatario: ${pedido.nombre}</h3>
          <p><strong>Costo Total:</strong> ${pedido.total}</p>
          <p><strong>Estado del Lienzo:</strong> <span style="color: var(--color-primario); font-weight: bold;">${pedido.estado}</span></p>
        `;
        contenedorCliente.appendChild(articulo);
      });
    }