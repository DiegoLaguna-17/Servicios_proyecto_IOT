<template>
  <h2>Carreras</h2>
  <p class="subtitle">
    Aquí puedes ver la lista de Carreras registradas y agregar una nueva
  </p>
  <div class="container">
    <div class="search-container">
      <SearchBar @update:search="searchTerm = $event" />
      <router-link class="registrar" to="registrarCarrera">
        Registrar Nueva Carrera
      </router-link>
    </div>
    <div>
      <ActionCard
        v-for="carrera in filteredCarreras"
        :key="carrera.codigo"
        :user="carrera"
        @edit="verCarrera(carrera)"
        @delete="openDeletionModal(carrera)"
      />
    </div>
  </div>
  
  <ModalExito
    :message="successMessage"
    :visible="showModal"
    @close="showModal = false"
  />
  <ModalError
    :message="errorMessage"
    :visible="showErrorModal"
    @close="showErrorModal = false"
  />
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import router from "../../../router";
import VerCarrera from "./VerCarrera.vue";
import EditModal from "../../seguridad/components/EditModal.vue"; //modal de edicion de usuarios
import ActionCard from "../components/ActionCard.vue";
import SearchBar from "../../seguridad/components/SearchBar.vue"; //barra de busqueda
import ModalError from "../../seguridad/components/ModalError.vue"; //Modal de error en operacion
import ModalExito from "../../seguridad/components/ModalExito.vue"; //Modal de exito en operacion
import DeletionModal from "../../seguridad/components/DeletionModal.vue";
import { listarCarreras } from "../servicios/adminsService";

const showModal = ref(false);
const successMessage = ref("");

const showErrorModal = ref(false);
const errorMessage = ref("");

const carreras = ref([]);
const selectedUser = ref(null);
const isOpen = ref(false);
const isDeletion = ref(false);
const searchTerm = ref("");

//esto envia a la vista de ver carrera con el codigo de la carrera para ejecutar el query de obtener cursos de esa carrera
 const verCarrera=(carrera)=>{
    router.push({
        name:"verCarrera",
        params:{codigo:carrera.codigo}   
    })

};
const openEditModal = (carrera) => {
  selectedUser.value = { ...carrera };
  isOpen.value = true;
};

const openDeletionModal = (carrera) => {
  selectedUser.value = { ...carrera };
  isDeletion.value = true;
};
//filtrado de carreras con la barra de busqueda
const filteredCarreras = computed(() => {
  if (!searchTerm.value) return carreras.value;

  return carreras.value.filter(
    (carrera) =>
      carrera.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      carrera.codigo.toString().includes(searchTerm.value),
  );
});


onMounted(async () => {
    //simulacion del cargado de carreras con la lista de prueba
    //carreras.value=listaCarreras

  try {
    
    const response = await listarCarreras();
    const data = response.data;
    carreras.value = data.data;

  } catch (err) {
    console.error("Error al obtener los datos: ", err);
  }
});


//lista de prueba
const listaCarreras=[
    {
        codigo:"ins",
        nombre:"Ingenieria de Sistemas",
        descripcion:"Se enfoca en el diseño, desarrollo, implementación y mantenimiento de software y sistemas informáticos. Los estudiantes aprenden programación, bases de datos, redes y gestión de proyectos tecnológicos.",
        duracion:"5 años"
    },
    {
        codigo:"der",
        nombre:"Derecho",
        descripcion:"Forma profesionales capaces de interpretar y aplicar las leyes, representando a personas o instituciones en asuntos legales, así como asesorando en contratos y derechos.",
        duracion:"5 años"
    },
    {
        codigo:"psi",
        nombre:"Psicología",
        descripcion:"Estudia el comportamiento y los procesos mentales de las personas, capacitando a los profesionales para ofrecer apoyo psicológico, terapias y asesoramiento en distintos contextos.",
        duracion:"5 años"
    }

]
    

</script>

<style scoped>
.subtitle {
  color: #666;
}

.container {
  display: flex;
  flex-direction: column;
  margin: 1rem 0rem;
  background-color: white;
  border-radius: 5px;
}

.search-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
  padding: 10px;
}

.registrar {
  cursor: pointer;
  background-color: #f7ba00;
  color: white;
  display: flex;
  flex: 3;
  justify-content: center;
  align-items: center;
  border: none;
  border-radius: 5px;
  font-size: small;
  text-decoration: none;
}

.registrar:hover {
  background-color: #daa300;
}
</style>
