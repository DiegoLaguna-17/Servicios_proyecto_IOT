<template>
  <h2>Cursos</h2>
  <p class="subtitle">
    Aquí puedes ver la lista de cursos por carrera y registrar un nuevo curso
  </p>

  <div class="container">
    <div class="search-container">
      <SearchBarCurso @update:search="searchTerm = $event" />
      <select v-model="carreraSeleccionada" class="custom-select">
        <option value="">Filtrar por carrera</option>
        <option 
            v-for="carrera in listaCarreras" 
            :key="carrera.codigo"
            :value="carrera.codigo"
        >
            {{ carrera.nombre }}
        </option>
    </select>

      <router-link class="registrar" to="registrarCursos">
        Registrar Nuevo Curso
      </router-link>
    </div>
    <div>
      <ActionCard
        v-for="curso in filteredCursos"
        :key="curso.id_materia"
        :user="curso"
        @edit="openEditModal(curso)"
        @delete="openDeletionModal(curso)"
        @info-pagos="verInfoPagos(curso)"
      />
    </div>
  </div>

  <router-view></router-view>

  <EditModal
    v-if="isOpen"
    :user="selectedUser"
    @close="isOpen = false"
    @save="actualizarCurso"
  />

  <DeletionModal
    v-if="isDeletion"
    :user="selectedUser"
    @cancelar="isDeletion = false"
    @aceptar="deleteTeacher"
  />

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
import { useRouter } from "vue-router";
import EditModal from "../components/EditModal.vue"; //modal de edicion de usuarios
import ActionCard from "../components/ActionCard.vue";
import SearchBarCurso from "../components/SearchBarCurso.vue";//barra de busqueda
import ModalError from "../../seguridad/components/ModalError.vue"; //Modal de error en operacion
import ModalExito from "../../seguridad/components/ModalExito.vue"; //Modal de exito en operacion
import DeletionModal from "../../seguridad/components/DeletionModal.vue";
import { listarCursos,listarCarreras } from "../servicios/adminsService";
import { editarCurso,eliminarCurso } from "../servicios/cursosService";
const router = useRouter();
const showModal = ref(false);
const successMessage = ref("");
const showErrorModal = ref(false);
const errorMessage = ref("");

const searchTerm = ref("");
const cursos = ref([]);
const selectedUser = ref(null);
const isOpen = ref(false);
const isDeletion = ref(false);
//variable que almacena el codigo de la carrera para el filtrado por carrera
const carreraSeleccionada = ref("");

const listaCarreras=ref([])

const verInfoPagos = (curso) => {
  router.push(`/administrador/info-curso/${curso.id_materia}`);
};

const openEditModal = (curso) => {
  selectedUser.value = { ...curso };
  isOpen.value = true;
};

const openDeletionModal = (curso) => {
  selectedUser.value = { ...curso };
  isDeletion.value = true;
};
//filtrado de cursos mediante la barra de bisqueda y el valor del filtrado por carrera
const filteredCursos = computed(() => {
  return cursos.value.filter((curso) => {

    // 🔍 Filtro por búsqueda
    const coincideBusqueda =
      !searchTerm.value ||
      curso.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      curso.id_materia.toString().includes(searchTerm.value);

    // 🎓 Filtro por carrera
    const coincideCarrera =
      !carreraSeleccionada.value ||
      curso.carrera_codigo === carreraSeleccionada.value;

    // ✅ Debe cumplir ambos
    return coincideBusqueda && coincideCarrera;
  });
});


const actualizarCurso = async (usuarioActualizado) => {
  // 🔹 Mostramos en consola lo recibido
  console.log("Datos recibidos del modal:", usuarioActualizado);

  try {
    const { id_materia, ...cursoActualizado } = usuarioActualizado;
    console.log("Datos recibidos del modal:", cursoActualizado);
    const resultado = await editarCurso(
      usuarioActualizado.id_materia,
      cursoActualizado,
    );

    if (resultado?.exito) {
      console.log("curso actualizado correctamente:", resultado);

      // Actualizar lista local usando ref de Vue 3
      cursos.value = cursos.value.map((doc) =>
        doc.id_materia === id_materia
          ? { ...doc, ...cursoActualizado }
          : doc,
      );

      successMessage.value = resultado.message;
      showModal.value = true;
    } else {
      console.error("Error al actualizar:", resultado?.message);
      errorMessage.value = resultado?.message || "Error desconocido";
      showErrorModal.value = true;
    }
  } catch (error) {
    console.error("Error de conexión con el backend:", error);
    errorMessage.value = "No se pudo conectar con el servidor";
    showErrorModal.value = true;
  }
};

const deleteTeacher = async () => {
  if (!selectedUser.value) return;

  try {
    const response = await eliminarCurso(selectedUser.value.id_materia);
    if (response.success === false) {
      console.error("Error al eliminar: ", response.message);
      return;
    }

    cursos.value = cursos.value.filter(
      (curso) => curso.id_materia !== selectedUser.value.id_materia,
    );

    isDeletion.value = false;
    selectedUser.value = null;

    successMessage.value = "cursoeliminado";
    showModal.value = true;
  } catch (error) {
    console.error("Error eliminando curso: ", error);
    errorMessage.value = "Error al eliminar el curso";
    showErrorModal.value = true;
  }
};

onMounted(async () => {
    //simulacion del cargado de cursos con la lista de prueba
    //cursos.value=listaCursos;
    
  try {
    const response = await listarCursos();
    const response2=await listarCarreras();
    const data = response.data;
    cursos.value = data.data;
    listaCarreras.value=response2.data.data;
  } catch (err) {
    console.error("Error al obtener los datos: ", err);
  }
});



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

.custom-select {
  flex: 2;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;

  /* Quitar estilo nativo */
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  /* Flecha personalizada */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
}

.custom-select:focus {
  outline: none;
  border-color: #f7ba00;
  box-shadow: 0 0 0 2px rgba(247, 186, 0, 0.2);
  background-color: #fff;
}

.custom-select:hover {
  border-color: #f7ba00;
}

</style>
