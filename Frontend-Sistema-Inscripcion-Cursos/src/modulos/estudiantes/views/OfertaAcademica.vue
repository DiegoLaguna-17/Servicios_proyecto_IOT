<template>
  <div class="wrapper">
    <h1>Oferta academica</h1>
    <div class="head"> 
      <div class="search">
        <SearchBar
          @update:search="searchTerm = $event"
        />
      </div>

      <select v-model="ofertaCarrera">
        <option :value="true">Mi carrera</option>
        <option :value="false">Extracurricular</option>
      </select>
      
      <button class="cart-button" @click="toggleCarrito">
        <Icon iconName="shopping_cart" />
        <span 
          v-if="carrito.cursos.length > 0" 
          class="badge"
        >
          {{ carrito.cursos.length }}
        </span>
      </button>
    </div>
      
    <div class="container" v-if="ofertaCarrera">
      <OfertaCard
        v-for="curso in filteredCursos"
        :key="curso.id_materia"
        :curso="curso"
        @view="abrirModal(curso)"
      />
    </div>

    <div class="container" v-if="!ofertaCarrera">
      <OfertaCard
        v-for="curso in filteredCursosExtra"
        :key="curso.id_materia"
        :curso="curso"
        @view="abrirModal(curso)"
      />
    </div>

    <ModalOferta
      v-if="modalAbierto"
      :curso="selectedCurso"
      :noCumple="noCumplen"
      :motivosBloqueo="motivosBloqueo"
      :puedeInscribirse="puedeInscribirse"
      @close="modalAbierto = false"
    />

    <CarritoCursos 
      v-if="mostrarCarrito" 
      @cerrar="mostrarCarrito = false" 
    />
  </div>
</template>

<script setup>
import OfertaCard from '../components/OfertaCard.vue'
import SearchBar from '../components/SearchBar.vue'
import { ref, computed, onMounted } from 'vue'
import ModalOferta from '../components/ModalOferta.vue'
import { usarCarrito } from '../../../store/carrito'
import CarritoCursos from '../components/CarritoCursos.vue'
import Icon from '../../seguridad/components/Icon.vue'
import {
  listarOfertaCarrera,
  listarOfertaExtra,
  materiaOfertaDetalle,
  detalleExtracurricular
} from '../services/estudianteService'

const carrito = usarCarrito()
const mostrarCarrito = ref(false)

const toggleCarrito = () => {
  mostrarCarrito.value = !mostrarCarrito.value
}

const modalAbierto = ref(false)
const searchTerm = ref("")
const selectedCurso = ref(null)
const ofertaCarrera = ref(true)
const noCumplen = ref([])
const motivosBloqueo = ref([])
const puedeInscribirse = ref(true)

const cursos = ref([])
const cursosExtracurriculares = ref([])

const abrirModal = async (curso) => {
  noCumplen.value = []
  motivosBloqueo.value = []
  puedeInscribirse.value = true

  try {
    let response

    if (ofertaCarrera.value) {
      response = await materiaOfertaDetalle(curso.id_materia)
    } else {
      response = await detalleExtracurricular(curso.id_materia)
    }

    const data = response?.data?.data || {}

    if (Array.isArray(data.requisitos)) {
      data.requisitos.forEach((requisito) => {
        if (requisito.cumple === false) {
          noCumplen.value.push(requisito.id_materia)
        }
      })
    }

    motivosBloqueo.value = Array.isArray(data.motivos_bloqueo)
      ? data.motivos_bloqueo
      : []

    puedeInscribirse.value = data.puede_inscribirse !== false

    selectedCurso.value = {
      ...(data.materia || curso),
      requisitos: data.materia?.requisitos || curso.requisitos || [],
      puede_inscribirse: data.puede_inscribirse !== false,
      motivos_bloqueo: data.motivos_bloqueo || []
    }

    modalAbierto.value = true
  } catch (error) {
    console.log("Error al obtener detalle de materia:", error)

    selectedCurso.value = {
      ...curso,
      requisitos: curso.requisitos || [],
      puede_inscribirse: true,
      motivos_bloqueo: []
    }
    modalAbierto.value = true
  }
}

const filteredCursos = computed(() => {
  if (!searchTerm.value) return cursos.value

  return cursos.value.filter(
    (curso) =>
      curso.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      curso.id_materia.toString().includes(searchTerm.value)
  )
})

const filteredCursosExtra = computed(() => {
  if (!searchTerm.value) return cursosExtracurriculares.value

  return cursosExtracurriculares.value.filter(
    (curso) =>
      curso.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      curso.id_materia.toString().includes(searchTerm.value)
  )
})

onMounted(async () => {
  try {
    const response = await listarOfertaCarrera()
    cursos.value = response.data.data || []

    const response2 = await listarOfertaExtra()
    cursosExtracurriculares.value = response2.data.data || []
  } catch (error) {
    console.log("Error al obtener la oferta académica: ", error)
  }
  try {
    

    const response2 = await listarOfertaExtra()
    cursosExtracurriculares.value = response2.data.data || []
  } catch (error) {
    console.log("Error al obtener la oferta académica: ", error)
  }
})
</script>

<style scoped>
.wrapper{
  padding: 40px;
}
.search{
  width: 60%;
}
.head{
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
  width: 30%;
  padding: 10px 12px;
  border-radius: 8px;
  border:2px solid #f7ba00;
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
.cart-button {
  position: relative;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f7ba00;
  color: black;
  font-size: 12px;
  font-weight: bold;
  padding: 3px 7px;
  border-radius: 50%;
}
</style>