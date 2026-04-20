<template>
  <h2>Estudiantes</h2>
  <p class="subtitle">
    Aquí puedes ver la lista de Estudiantes registrados y agregar uno nuevo
  </p>

  <div class="container">
    <div class="search-container">
      <SearchBar @update:search="searchTerm = $event" />
      <router-link class="registrar" to="registrarEstudiantes">
        Registrar Nuevo Estudiante
      </router-link>
    </div>
    <div>
      <ActionCard
        v-for="student in filteredStudents"
        :key="student.ci"
        :user="student"
        @edit="openEditModal(student)"
        @delete="openDeletionModal(student)"
      />
    </div>
  </div>

  <EditModal
    v-if="isOpen"
    :user="selectedUser"
    @close="isOpen = false"
    @save="actualizarEstudiante"
  />

  <DeletionModal
    v-if="isDeletion"
    :user="selectedUser"
    @cancelar="isDeletion = false"
    @aceptar="deleteStudent"
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
import {
  listarEstudiantes,
  eliminarEstudiante,
  editarEstudiante
} from "../servicios/seguridadService";
import ActionCard from "../components/ActionCard.vue";
import SearchBar from "../components/SearchBar.vue";
import EditModal from "../components/EditModal.vue";
import DeletionModal from "../components/DeletionModal.vue";
import ModalExito from "../components/ModalExito.vue";
import ModalError from "../components/ModalError.vue";

const searchTerm = ref("");
const students = ref([]);
const selectedUser = ref(null);
const isOpen = ref(false);
const isDeletion = ref(false);
const showModal = ref(false);
const successMessage = ref("");
const showErrorModal = ref(false);
const errorMessage = ref("");

const openEditModal = (student) => {
  selectedUser.value = { ...student };
  isOpen.value = true;
};

const openDeletionModal = (student) => {
  selectedUser.value = { ...student };
  isDeletion.value = true;
};

const filteredStudents = computed(() => {
  if (!searchTerm.value) return students.value;

  return students.value.filter(
    (student) =>
      student.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      student.ci.toString().includes(searchTerm.value),
  );
});

const actualizarEstudiante =async (usuarioActualizado) => {
  console.log("Datos recibidos del modal:", usuarioActualizado);
  try{
    const { ci, ...estudianteActualizado } = usuarioActualizado;
      const resultado= await editarEstudiante(usuarioActualizado.ci,estudianteActualizado);
      
        students.value = students.value.map((doc) =>
            doc.ci === ci
              ? { ...doc, ...estudianteActualizado }
              : doc,
          );
        successMessage.value = "Estudiante actualizado";
        showModal.value=true;
      
        
    
  }catch(error){
    console.error("Error de conexión con el backend:", error);
    errorMessage.value = error?.message ||"Error al actualizar";
    showErrorModal.value = true;
  }
 
};

const deleteStudent = async () => {
  if (!selectedUser.value) return;

  try {
    const response = await eliminarEstudiante(selectedUser.value.ci);
    if (response.success === false) {
      console.error("Error al eliminar: ", response.message);
      return;
    }

    students.value = students.value.filter(
      (student) => student.ci !== selectedUser.value.ci,
    );

    isDeletion.value = false;
    selectedUser.value = null;

    successMessage.value = "Estudiante eliminado";
    showModal.value = true;
  } catch (error) {
    console.error("Error eliminando estudiante: ", error);
    errorMessage.value = "Error al eliminar el estudiante";
    showErrorModal.value = true;
  }
};

onMounted(async () => {
  try {
    const response = await listarEstudiantes();
    const data = response.data.data;
    students.value = response.data.data;
    console.log(response.data.data)
  } catch (error) {
    console.log("Error al obtener los estudiantes: ", error);
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
</style>
