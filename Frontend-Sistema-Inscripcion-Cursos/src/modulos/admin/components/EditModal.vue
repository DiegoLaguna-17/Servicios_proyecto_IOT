<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="helper-container">
        <div class="user-data">
          
          <h2>Editar información del curso</h2>
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
            <input type="text" v-model="form.cupo"  />
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
            <label>Carrera</label>
            <input type="text" :value="curso.carrera_codigo || 'N/A'" disabled />
          </div>

          <div>
            <label>Aula</label>
            <input type="text" :value="curso.aula.nombre || curso.id_aula || 'N/A'" disabled />
          </div>

          <div>
            <label>Monto</label>
            <input type="text" v-model="form.monto"  />
          </div>

          <div>
  <label>Agregar requisito</label>

  <div class="requisito-row">
    <select v-model="requisitoSeleccionado">
      <option disabled value="">Seleccione materia</option>
      <option 
        v-for="mat in materiasDisponibles"
        :key="mat.id_materia"
        :value="mat.id_materia"
      >
        {{ mat.nombre }}
      </option>
    </select>

    <button 
      type="button" 
      class="btn-add"
      @click="agregarRequisito"
    >
      Agregar
    </button>
  </div>

  <!-- BURBUJAS -->
  <div class="requisitos-burbujas">
    <span 
      v-for="codigo in requisitosAgregados"
      :key="codigo"
      class="burbuja"
    >
      {{
        materiasDisponibles.find(m => m.id_materia === codigo)?.nombre
      }}
      <button @click="eliminarRequisito(codigo)">×</button>
    </span>
  </div>
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
import { computed, ref, watch } from "vue";
import { listarCursos } from "../servicios/adminsService";
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

const requisitoSeleccionado = ref("")
const requisitosAgregados = ref([]) 

const agregarRequisito = () => {
  if (!requisitoSeleccionado.value) return

  const yaExiste = requisitosAgregados.value.includes(requisitoSeleccionado.value)

  if (!yaExiste) {
    requisitosAgregados.value.push(requisitoSeleccionado.value)
  }

  requisitoSeleccionado.value = ""
}

const eliminarRequisito = (codigo) => {
  requisitosAgregados.value = requisitosAgregados.value.filter(
    r => r !== codigo
  )
}
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

const errorNombre = ref("");
const listaMaterias = async (curso) => {
  try {
    const response = await listarCursos()
    const todas = response.data.data

    materiasDisponibles.value = todas.filter(m =>
      m.carrera_codigo === curso.carrera_codigo &&
      m.id_materia !== curso.id_materia
    )

  } catch (error) {
    console.error("Error cargando materias", error)
  }
}
// Watch para actualizar el form cuando cambie el curso seleccionado
watch(
  () => props.user,
  async(newCurso) => {
    if (newCurso) {
      await listaMaterias(newCurso)
      form.value.nombre = newCurso.nombre || "";
      form.value.monto=newCurso.monto||"";
      form.value.cupo=newCurso.cupo||"";
      form.value.dia=newCurso.dia||"";
      requisitosAgregados.value = newCurso.requisitos
        ? [...newCurso.requisitos]
        : []
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
const materiasDisponibles = ref([])


// El formulario es válido si el nombre cambió y es válido
const formularioValido = computed(() => {
  if (errorNombre.value) return false;

  const cambioNombre = form.value.nombre !== curso.value.nombre
  const cambioDia = form.value.dia !== curso.value.dia
  const cambioCupo = form.value.cupo !== curso.value.cupo
  const cambioMonto = form.value.monto !== curso.value.monto

  // 👇 Comparar requisitos
  const requisitosOriginales = curso.value.requisitos || []
  const requisitosActuales = requisitosAgregados.value

  const cambioRequisitos =
    requisitosOriginales.length !== requisitosActuales.length ||
    !requisitosOriginales.every(r => requisitosActuales.includes(r))

  const hayCambios =
    cambioNombre ||
    cambioDia ||
    cambioCupo ||
    cambioMonto ||
    cambioRequisitos

  return form.value.nombre.trim() !== "" && hayCambios
})

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
  if (requisitosAgregados.value.length > 0) {
  cambios.requisitos = [...requisitosAgregados.value]
  }
  
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
  width: 80%;
  max-height: 90vh;   /* mejor que height fijo */
  display: flex;
  flex-direction: column;
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
  overflow-y: auto;
  padding-right: 10px;
  flex: 1;
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
form {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}
.requisito-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.btn-add {
  background: #1a1a7c;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-add:hover {
  opacity: 0.9;
}

.requisitos-burbujas {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.burbuja {
  background: #0b7285;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.burbuja button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-weight: bold;
}
</style>
