<template>
  <h2>Administradores</h2>
  <p class="subtitle">
    Aquí puedes ver la lista de Administradores registrados y agregar uno nuevo
  </p>
  <div class="container">
    <div class="search-container">
      <SearchBar @update:search="searchTerm = $event" />
      <router-link class="registrar" to="registrarAdmin">
        Registrar Nuevo Administrador
      </router-link>
    </div>
    <div>
      <ActionCard
        v-for="admin in filteredAdmins"
        :key="admin.ci"
        :user="admin"
        @edit="openEditModal(admin)"
        @delete="openDeletionModal(admin)"
      />
    </div>
  </div>
  <EditModal
    v-if="isOpen"
    :user="selectedUser"
    @close="isOpen = false"
    @save="actualizarAdministrador"
  />
  <DeletionModal
    v-if="isDeletion"
    :user="selectedUser"
    @cancelar="isDeletion = false"
    @aceptar="deleteAdmin"
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
  listarAdministradores,
  editarAdministrador,
  eliminarAdministrador,
} from "../servicios/seguridadService";
import EditModal from "../components/EditModal.vue"; //modal de edicion de usuarios
import ActionCard from "../components/ActionCard.vue"; //card de los usuarios
import SearchBar from "../components/SearchBar.vue"; //barra de busqueda
import ModalError from "../components/ModalError.vue"; //Modal de error en operacion
import ModalExito from "../components/ModalExito.vue"; //Modal de exito en operacion
import DeletionModal from "../components/DeletionModal.vue";

const showModal = ref(false);
const successMessage = ref("");

const showErrorModal = ref(false);
const errorMessage = ref("");

const admins = ref([]);
const selectedUser = ref(null);
const isOpen = ref(false);
const isDeletion = ref(false);
const searchTerm = ref("");

const openEditModal = (admin) => {
  selectedUser.value = { ...admin };
  isOpen.value = true;
};

const openDeletionModal = (admin) => {
  selectedUser.value = { ...admin };
  isDeletion.value = true;
};

const filteredAdmins = computed(() => {
  if (!searchTerm.value) return admins.value;

  return admins.value.filter(
    (admin) =>
      admin.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      admin.ci.toString().includes(searchTerm.value),
  );
});

const actualizarAdministrador = async (usuarioActualizado) => {
  console.log("Datos recibidos del modal:", usuarioActualizado);

  try {
    const resultado = await editarAdministrador(
      usuarioActualizado.ci,
      usuarioActualizado,
    );

    if (resultado?.exito) {
      console.log("Administrador actualizado correctamente:", resultado);

      // Actualizar lista local usando ref de Vue 3
      admins.value = admins.value.map((admin) =>
        admin.ci === usuarioActualizado.ci
          ? { ...admin, ...usuarioActualizado }
          : admin,
      );

      successMessage.value = resultado.mensaje;
      showModal.value = true;
    } else {
      console.error("Error al actualizar:", resultado?.errores);
      errorMessage.value =
        resultado?.errores?.join(", ") || "Error desconocido";
      showErrorModal.value = true;
    }
  } catch (error) {
    console.error("Error de conexión con el backend:", error);
    errorMessage.value = "No se pudo conectar con el servidor";
    showErrorModal.value = true;
  }
};

const deleteAdmin = async () => {
  if (!selectedUser.value) return;

  try {
    const response = await eliminarAdministrador(selectedUser.value.ci);
    if (response.success === false) {
      console.error("Error al eliminar: ", response.message);
      return;
    }

    admins.value = admins.value.filter(
      (admin) => admin.ci !== selectedUser.value.ci,
    );

    isDeletion.value = false;
    selectedUser.value = null;

    successMessage.value = "Administrador eliminado";
    showModal.value = true;
  } catch (error) {
    console.error("Error eliminando administrador: ", error);
    errorMessage.value = "Error al eliminar el administrador";
    showErrorModal.value = true;
  }
};

onMounted(async () => {
  try {
    const response = await listarAdministradores();
    const data = response.data;
    admins.value = data.data;
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
</style>
