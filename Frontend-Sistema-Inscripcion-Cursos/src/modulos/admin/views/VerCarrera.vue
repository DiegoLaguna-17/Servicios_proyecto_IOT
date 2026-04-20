<template>
  <div>
    <div class="icon-wrapper">
      <Icon
      to="../listarCarreras"
      iconName="arrow_back"
      iconColor="black"
      message="Volver"
    />
    </div>
       

    <h2>{{user.nombre}}</h2>

    <div class="form-card">
      <form @submit="manejarEnvio" autocomplete="off">
        <div class="grid">
            
            <!-- Columna izquierda -->
            <div class="left-column">
                <div>
                <label>Código</label>
                <input type="text" :value="user?.codigo" disabled />
                </div>

                <div>
                <label>Duración</label>
                <input type="text" :value="user?.duracion" disabled />
                </div>
            </div>

            <!-- Columna derecha -->
            <div class="right-column">
                <label>Descripción</label>
                <textarea
                :value="user?.descripcion"
                disabled
                ></textarea>
            </div>

        </div>

      </form>
    </div>
    <br>
     <div class="container">
    <div class="search-container">
      <SearchBarCurso @update:search="searchTerm = $event" />
      

      <router-link class="registrar" to="../registrarCursos">
        Registrar Curso 
      </router-link>
    </div>
    <div>
      <ActionCard
        v-for="curso in filteredCursos"
        :key="curso.id_materia"
        :user="curso"
        @delete="openDeletionModal(curso)"
        @edit="openEditModal(curso)"
      />
    </div>
  </div>
  </div>
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

<style scoped>
.icon-wrapper {
  cursor: pointer;
  display: inline-flex;
  padding: 0.5rem 0.6rem;
  border-radius: 50px;
}

.icon-wrapper:hover {
  background-color: #eee;
}
h2 {
  margin-bottom: 10px;
}

p {
  margin-bottom: 30px;
  color: #666;
}

.form-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.grid {
  display: grid;
  grid-template-columns: 1fr 2fr; /* izquierda pequeña, derecha grande */
  gap: 30px;
  align-items: start;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.right-column {
  display: flex;
  flex-direction: column;
}

textarea {
  width: 100%;
  min-height: 160px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  resize: none;          /* no redimensionable */
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
}




label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  transition: 0.2s;
}

input:focus {
  border-color: #5fa8a8;
  outline: none;
}

.buttons {
  margin-top: 40px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.btn-clear {
  background: #ccc;
  border: none;
  padding: 10px 22px;
  border-radius: 8px;
}

.btn-register {
  background: #5fa8a8;
  border: none;
  padding: 10px 22px;
  border-radius: 8px;
  color: white;
}
.btn-register:disabled {
  background: #405656;
  border: none;
  padding: 10px 22px;
  border-radius: 8px;
  color: white;
}
.error {
  color: red;
  font-size: 13px;
  margin-top: 4px;
}
.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper input {
  width: 100%;
  padding-right: 40px;
}

.toggle-btn {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
}

.toggle-btn:hover {
  color: #5fa8a8;
}
.full-width {
  grid-column: span 1;
}


textarea:focus {
  outline: none;
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
</style>

<script setup>
import Icon from "../../seguridad/components/Icon.vue";
import { ref, computed, onMounted} from "vue";
import { useRoute } from "vue-router";
import ModalExito from "../../seguridad/components/ModalExito.vue";
import ModalError from "../../seguridad/components/ModalError.vue";
import ActionCard from "../components/ActionCard.vue";
import SearchBarCurso from "../components/SearchBarCurso.vue";
import { verCarrera } from "../servicios/adminsService";
import EditModal from "../components/EditModal.vue";
import DeletionModal from "../../seguridad/components/DeletionModal.vue";
const route = useRoute()



//simulacion de cargado de la carrera por medio de su codigo
//Esto sera reemplazado con el resultado del endpoint de obtener datos por carrera

//simulacion de cargado de las materias de la carrera
//Esto sera reemplazado con el resultado del endpoint de obtener datos por carrera


const showModal = ref(false);
const successMessage = ref("");

const showErrorModal = ref(false);
const errorMessage = ref("");
const searchTerm = ref("");

const form=ref({
  codigo:"",
  nombre:"",
  descripcion:"",
  duracion:""
});

const user=ref({});
const listaCursos=ref([])
onMounted(async()=>{
    try{
        const codigo = route.params.codigo
        console.log(codigo)
        const response=await verCarrera(codigo)
        user.value={
            codigo: response.data.data.codigo,
            nombre:response.data.data.nombre,
            descripcion: response.data.data.descripcion,
            duracion:response.data.data.duracion
        }
        listaCursos.value=response.data.data.materias;
    }catch(err){
        alert("Error")
    }

})
const filteredCursos = computed(() => {
  if (!searchTerm.value) return listaCursos.value;

  return listaCursos.value.filter(
    (curso) =>
      curso.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      curso.id_materia.toString().includes(searchTerm.value),
  );
});

//lista de prueba de carreras

    
//lista de prueba de cursos
const selectedUser = ref(null);
const isOpen = ref(false);
const isDeletion = ref(false);

const openEditModal = (curso) => {
  selectedUser.value = { ...curso };
  isOpen.value = true;
};
const openDeletionModal = (curso) => {
  selectedUser.value = { ...curso };
  isDeletion.value = true;
};

</script>