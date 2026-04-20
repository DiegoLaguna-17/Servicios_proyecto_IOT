<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="helper-container">
        <div class="user-data">
          
          <h2>Editar información del curso extracurricular</h2>
          <p class="subtitle">Modifica y guarda los cambios</p>
        </div>

        <div class="close-button" @click="$emit('close')">
          ×
        </div>
      </div>

      <form @submit.prevent="guardarCambios">
        <div class="grid">
          
          <div>
            <label>Código</label>
            <input type="text" :value="curso.id_materia || curso.codigo" disabled />
          </div>

          <div>
            <label>Nombre</label>
            <input 
              type="text" 
              v-model="form.nombre" 
              @input="validarNombre"
              placeholder="Nombre del curso"
            />
            <p v-if="errorNombre" class="error">{{ errorNombre }}</p>
          </div>

          <div>
            <label>Tipo</label>
            <input type="text" :value="curso.tipo" disabled />
          </div>

          <div>
            <label>Cupo</label>
            <input type="text" v-model="form.cupo" />
          </div>

          <div>
            <label>Día</label>
            <select v-model="form.dia">
              <option disabled value="">Seleccione un día</option>
              <option v-for="dia in dias" :key="dia" :value="dia">
                {{ dia }}
              </option>
            </select>          
          </div>

          <div>
            <label>Hora de inicio</label>
            <input type="text" :value="curso.hora_inicio" disabled />
          </div>

          <div>
            <label>Hora fin</label>
            <input type="text" :value="curso.hora_fin" disabled />
          </div>

          <div>
            <label>Fecha de Inicio</label>
            <input type="text" :value="formatearFecha(curso.fecha_inicio)" disabled />
          </div>

          <div>
            <label>Fecha fin</label>
            <input type="text" :value="formatearFecha(curso.fecha_fin)" disabled />
          </div>

          <div>
            <label>Aula</label>
            <input type="text" :value="aulaSeleccionada|| curso.id_aula || 'N/A'" disabled />
          </div>

          <div>
            <label>Monto</label>
            <input type="text" v-model="form.monto" />
          </div>

        </div>
          
        <div class="buttons">
          <button type="button" class="btn-clear" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="btn-submit" :disabled="!formularioValido">
            Guardar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { listarAulas } from "../servicios/cursosService";
const dias = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes"
];
const props = defineProps({ 
  user: { type: Object, required: true } 
});
const emit = defineEmits(["close", "save"]);

// Renombramos user a curso para claridad
const curso = computed(() => props.user);

// Estado del formulario - solo nombre es editable
const form = ref({
  nombre: "",
  cupo:"",
  dia:"",
  monto:""
});
const aulas = ref([]);
const aulaSeleccionada = ref(null);

onMounted(async () => {
  const respuestasAulas = await listarAulas();
  console.log(respuestasAulas.data)
  aulas.value = respuestasAulas.data;
  
  aulaSeleccionada.value = aulas.value.find(
    a => Number(a.id_aula) === Number(curso.aula_id_aula)
  );

  console.log(aulaSeleccionada);
});

const errorNombre = ref("");

// Watch para actualizar el form cuando cambie el curso seleccionado
watch(
  () => props.user,
  (newCurso) => {
    if (newCurso) {
      form.value.nombre = newCurso.nombre || "";
      form.value.monto=newCurso.monto||"";
      form.value.cupo=newCurso.cupo||"";
      form.value.dia=newCurso.dia||"";
    }
  },
  { immediate: true }
);

// Validación del nombre
const validarNombre = () => {
  const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,50}$/;
  
  if (!form.value.nombre.trim()) {
    errorNombre.value = "El nombre no puede estar vacío";
  } else if (!regex.test(form.value.nombre)) {
    errorNombre.value = "El nombre debe contener solo letras y tener entre 3 y 50 caracteres";
  } else {
    errorNombre.value = "";
  }
};

// El formulario es válido si el nombre cambió y es válido
const formularioValido = computed(() => {
  if (errorNombre.value) return false;

  const cambioNombre = form.value.nombre !== curso.value.nombre;
  const cambioDia = form.value.dia !== curso.value.dia;
  const cambioCupo = form.value.cupo !== curso.value.cupo;
  const cambioMonto = form.value.monto !== curso.value.monto;

  const hayCambios = cambioNombre || cambioDia || cambioCupo || cambioMonto;

  return form.value.nombre.trim() !== "" && hayCambios;
});

// Formatear fecha para mostrar
const formatearFecha = (fecha) => {
  if (!fecha) return "N/A";
  return fecha; // Las fechas ya vienen en formato YYYY-MM-DD
};

// Guardar solo el nombre modificado
const guardarCambios = () => {
  validarNombre();
  
  if (!formularioValido.value) {
    return;
  }

  const cambios = {
    id_materia: curso.value.id_materia || curso.value.codigo,
    
  };
  
  if (form.value.nombre !== curso.value.nombre) cambios.nombre = form.value.nombre;
  if (form.value.dia !== curso.value.dia) cambios.dia = form.value.dia;
  if(form.value.cupo!==curso.value.cupo)cambios.cupo=form.value.cupo;
  if(form.value.monto!==curso.value.monto)cambios.monto=form.value.monto;

  console.log("Datos a guardar:", cambios);
  emit("save", cambios);
  emit("close");
};
</script>


<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 60%;
  position: relative;
}

.helper-container {
  display: flex;
  flex-direction: row;
  margin: 0px 0px 20px 0px;
}

.user-data {
  flex: 9;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.icon-data {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  cursor: pointer;
  color: #000;
  font-weight: 300;
  line-height: 1;
  transition: color 0.2s;
}

.close-button:hover {
  color: #666;
}

.subtitle {
  color: #666;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
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
  justify-content: center;
  gap: 15px;
}

.btn-clear {
  cursor: pointer;
  background: #ccc;
  border: none;
  padding: 10px 22px;
  border-radius: 8px;
}

.btn-clear:hover {
  background-color: #aaa;
}

.btn-submit {
  cursor: pointer;
  background: #5fa8a8;
  border: none;
  padding: 10px 22px;
  border-radius: 8px;
  color: white;
}

.btn-submit:disabled {
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

select {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  transition: 0.2s;
}

select:focus {
  border-color: #5fa8a8;
  outline: none;
}
</style>
