function formatearPrecio(precio) {
  return `$${Number(precio).toLocaleString('es-CL')} CLP`
}

export default formatearPrecio