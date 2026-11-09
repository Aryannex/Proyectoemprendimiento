export const PRECIO_ENVIO = 20000

export const TAMANOS = {
  mini:    { etiqueta: 'Mini (20 x 30 cm)',     precio: 35000 },
  pequeno: { etiqueta: 'Pequeño (30 x 40 cm)',  precio: 50000 },
  mediano: { etiqueta: 'Mediano (50 x 70 cm)',  precio: 130000 },
  grande:  { etiqueta: 'Grande (70 x 100 cm)',  precio: 180000 }
}

export function formatearMoneda(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(valor)
}