<template>
  <div class="wrapper">
    <h1>Mis materias</h1>
    <div class="head"> 
        <div class="search">
        <SearchBar
        @update:search="searchTerm=$event"
        />
        </div>
        
    </div>
        
        
    <div class="container" >
        <CardMateria
        v-for="curso in filteredCursos"
        :key="curso.id_materia"
        :curso="curso"
        @view="abrirModal(curso)"
        />
    </div>
    <ModalMateria 
        v-if="modalAbierto"
      :curso="selectedCurso"
      @close="modalAbierto = false"
    />
    
    
    </div>
  </template>

<script setup>
import SearchBar from '../components/SearchBar.vue'
import { ref,computed,onMounted } from 'vue';

import { listarMisMaterias } from '../services/DocenteService';
import CardMateria from '../components/CardMateria.vue';
import ModalMateria from '../components/ModalMateria.vue';


const modalAbierto=ref(false)
const searchTerm = ref("");
const selectedCurso = ref(null);
const ofertaCarrera=ref(true)
const cumpleMateria=ref(Boolean)
const noCumplen=[]
const abrirModal = async(curso) => {
  
  selectedCurso.value = { ...curso };
  modalAbierto.value = true;
};

const filteredCursos = computed(() => {
  if (!searchTerm.value) return cursos.value;

  return cursos.value.filter(
    (curso) =>
      curso.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      curso.id_materia.toString().includes(searchTerm.value),
  );
});




onMounted(async () => {
  try {
    
    const response = await listarMisMaterias(localStorage.getItem("ci"));
    console.log(response)
 cursos.value = response.data.data;

// 🔥 Aplanamos las materias


  } catch (error) {
    console.log("Error al obtener los cursos: ", error);
  }
});

const cursos = ref([
    
]);

</script>



<style scoped>
.wrapper{
  padding: 40px;
}
.search{
  width: 100%;
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
  appearance: none; /* Quita estilo nativo */
}

/* Flecha personalizada */
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