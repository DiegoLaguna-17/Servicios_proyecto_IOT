<template>
  <div class="wrapper">
    <div class="title-row">
      <h1>Mis materias</h1>

      <button class="estado-academico-btn" @click="irEstadoAcademico">
        Estado Académico
      </button>
    </div>

    <div class="head">
      <div class="search">
        <SearchBar @update:search="searchTerm = $event" />
      </div>

      <div class="filter-container">
        <select v-model="estadoFiltro">
          <option value="">Filtrar por estado</option>
          <option value="INSCRITO">Inscrito</option>
          <option value="PENDIENTE_PAGO">Pago pendiente</option>
          <option value="RETIRADO">Retirado</option>
        </select>
      </div>
    </div>

    <div class="container" v-if="ofertaCarrera">
      <CursoCard
        v-for="curso in filteredCursos"
        :key="curso.id_materia + '-' + curso.id_inscripcion"
        :curso="curso"
        @view="abrirModal(curso)"
      />
    </div>

    <ModalCurso
      v-if="modalAbierto"
      :curso="selectedCurso"
      :noCumple="noCumplen"
      @close="modalAbierto = false"
      @retirar="confirmarRetiro"
    />
  </div>
</template>

<script setup>
import SearchBar from '../components/SearchBar.vue'
import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import { listarMisMaterias, retirarMateria } from '../services/estudianteService'
import CursoCard from '../components/CursoCard.vue'
import ModalCurso from '../components/ModalCurso.vue'

const router = useRouter()

const modalAbierto = ref(false)
const searchTerm = ref("")
const selectedCurso = ref(null)
const ofertaCarrera = ref(true)
const cumpleMateria = ref(Boolean)
const noCumplen = []
const estadoFiltro = ref("")

const cursos = ref([])
const cursosExtracurriculares = ref([])

const normalizarEstado = (estado) => {
  if (!estado) return ""
  return estado.toUpperCase().trim()
}

const abrirModal = async (curso) => {
  selectedCurso.value = { ...curso }
  modalAbierto.value = true
}

const irEstadoAcademico = () => {
  router.push('/estudiante/estadoAcademico')
}

const filteredCursos = computed(() => {
  let resultado = cursos.value

  if (searchTerm.value) {
    resultado = resultado.filter(
      (curso) =>
        curso.nombre?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        curso.id_materia?.toString().includes(searchTerm.value)
    )
  }

  if (estadoFiltro.value) {
    resultado = resultado.filter(
      (curso) => normalizarEstado(curso.estado) === normalizarEstado(estadoFiltro.value)
    )
  }

  return resultado
})

const filteredCursosExtra = computed(() => {
  if (!searchTerm.value) return cursosExtracurriculares.value

  return cursosExtracurriculares.value.filter(
    (curso) =>
      curso.nombre?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      curso.id_materia?.toString().includes(searchTerm.value),
  )
})

const confirmarRetiro = async (curso) => {
  if (!curso) return

  if (normalizarEstado(curso.estado) === 'RETIRADO') return

  const result = await Swal.fire({
    title: 'Confirmar retiro',
    html: `
      <p>¿Seguro que deseas retirar esta materia?</p>
      <p>Esta acción no permitirá reinscribirte en el mismo ciclo además de que no hay devoluciones del mismo.</p>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  })

  if (!result.isConfirmed) return

  try {
    await retirarMateria(curso.id_inscripcion, curso.id_materia)

    await cargarMisMaterias()

    const materiaActualizada = cursos.value.find(
      (item) =>
        item.id_materia === curso.id_materia &&
        item.id_inscripcion === curso.id_inscripcion
    )

    if (materiaActualizada) {
      selectedCurso.value = { ...materiaActualizada }
    }

    await Swal.fire({
      icon: 'success',
      title: 'Materia retirada',
      text: 'La materia fue retirada correctamente.'
    })
  } catch (error) {
    console.log("Error al retirar la materia:", error)

    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error?.mensaje || 'No se pudo retirar la materia.'
    })
  }
}

const cargarMisMaterias = async () => {
  try {
    const response = await listarMisMaterias()
    const inscripciones = response.data.data

    cursos.value = inscripciones.flatMap(inscripcion =>
      inscripcion.materias.map(m => ({
        ...m.materia,
        estado: m.estado,
        id_inscripcion: inscripcion.id_inscripcion,
        fecha_inscripcion: inscripcion.fecha_inscripcion,
        fecha_retiro: m.fecha_retiro ?? m.materia?.fecha_retiro ?? null
      }))
    )
  } catch (error) {
    console.log("Error al obtener los cursos: ", error)
  }
}

onMounted(async () => {
  await cargarMisMaterias()
})

</script>

<style scoped>
.wrapper {
  padding: 40px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.estado-academico-btn {
  border: none;
  background: #4f9ec3;
  color: #fff;
  border-radius: 999px;
  padding: 10px 20px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.estado-academico-btn:hover {
  opacity: 0.9;
}

.search {
  width: 60%;
}

.filter-container {
  width: 30%;
}

.head {
  display: flex;
  flex-direction: row;
  gap: 5%;
  background-color: #fff;
  height: 10%;
  align-items: center;
  padding: 2%;
  border-radius: 10px;
}

.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  margin-top: 30px;
}

select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 2px solid #f7ba00;
  background-color: #fff;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
}

select {
  background-image: url("data:image/svg+xml;utf8,<svg fill='%235fa8a8' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 18px;
}

select:hover {
  border-color: #5fa8a8;
}

select:focus {
  border-color: #5fa8a8;
  box-shadow: 0 0 0 2px rgba(95, 168, 168, 0.2);
  outline: none;
}

option {
  font-size: 14px;
  background-color: #fff;
  color: #333;
}
</style>