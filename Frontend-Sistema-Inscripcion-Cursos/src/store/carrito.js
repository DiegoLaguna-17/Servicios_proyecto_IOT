import { defineStore } from 'pinia'

export const usarCarrito = defineStore('cart', {
  state: () => ({
    cursos: []
  }),

  persist: true,

  getters: {
    total: (state) =>
      state.cursos.reduce((acc, curso) => acc + curso.monto, 0),

    cantidad: (state) => state.cursos.length
  },

  actions: {

    agregarCurso(curso) {

  const normalizarDia = (dia) =>
    dia.trim().toLowerCase()

  const aMinutos = (hora) => {
    const [h, m] = hora.split(":").map(Number)
    return h * 60 + m
  }

  // 🔹 1. Ya existe
  const existe = this.cursos.find(
    c => c.id_materia === curso.id_materia
  )

  if (existe) {
    return {
      exito: false,
      mensaje: "Este curso ya está en el carrito"
    }
  }

  // 🔹 2. Verificar cruce
  const cruce = this.cursos.find(c => {

    if (normalizarDia(c.dia) !== normalizarDia(curso.dia))
      return false

    const inicioNuevo = aMinutos(curso.hora_inicio)
    const finNuevo = aMinutos(curso.hora_fin)

    const inicioExistente = aMinutos(c.hora_inicio)
    const finExistente = aMinutos(c.hora_fin)

    return (
      inicioNuevo < finExistente &&
      finNuevo > inicioExistente
    )
  })

  if (cruce) {
    return {
      exito: false,
      mensaje: `Conflicto de horario con ${cruce.nombre}`
    }
  }

  // 🔹 3. Agregar
  this.cursos.push(curso)

  return {
    exito: true,
    mensaje: "Curso agregado correctamente"
  }
},

    eliminarCurso(id) {
      this.cursos = this.cursos.filter(
        c => c.id_materia !== id
      )
    },

    vaciarCarrito() {
      this.cursos = []
    }
  }
})