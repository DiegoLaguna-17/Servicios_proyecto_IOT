<template>
  <div>
    <div class="icon-wrapper">
      <Icon
        to="listarExtra"
        iconName="arrow_back"
        iconColor="black"
        message="Volver"
      />
    </div>
       
    <h2>Registros de cursos extracurriculares</h2>
    <p>Completa el formulario para agregar una nueva carrera</p>

    <div class="form-card">
      <form @submit="manejarEnvio" autocomplete="off">
        <div class="grid">

          <div>
            <label>Código</label>
            <input type="text" v-model="form.codigo" @input="validarCodigo" placeholder="Ej: EXT-201" maxlength="20"/>
            <p v-if="errorCodigo" class="error">
              {{ errorCodigo }}
            </p>
          </div>
          
          <div>
            <label>Nombre</label>
            <input type="text" v-model="form.nombre" @input="validarNombre"/>
            <p v-if="errorNombre" class="error">
              {{ errorNombre }}
            </p>
          </div>

          <div>
            <label>Tipo</label>
            <select v-model="form.tipo" @change="validarTipo" class="custom-select">
              <option value="">Seleccione un tipo</option>
              <option value="Extracurricular">Extracurricular</option>
            </select>
            <p v-if="errorTipo" class="error">
              {{ errorTipo }}
            </p>
          </div>
          
          <div>
            <label>Cupo</label>
            <input type="number" v-model="form.cupo" @input="validarCupo" min="1" max="50" />
            <p v-if="errorCupo" class="error">
              {{ errorCupo }}
            </p>
          </div>

          <div>
            <label>Día</label>
            <select v-model="form.dia" @change="validarDia" class="custom-select">
              <option value="">Seleccione un día</option>
              <option value="Lunes">Lunes</option>
              <option value="Martes">Martes</option>
              <option value="Miércoles">Miércoles</option>
              <option value="Jueves">Jueves</option>
              <option value="Viernes">Viernes</option>
              <option value="Sábado">Sábado</option>
              
            </select>
            <p v-if="errorDia" class="error">
              {{ errorDia }}
            </p>
          </div>

          <div>
            <label>Hora de inicio</label>
            <input type="time" v-model="form.horaInicio" @change="validarHoraInicio" />
            <p v-if="errorHoraInicio" class="error">
              {{ errorHoraInicio }}
            </p>
          </div>

          <div>
            <label>Hora fin</label>
            <input type="time" v-model="form.horaFin" @change="validarHoraFin" />
            <p v-if="errorHoraFin" class="error">
              {{ errorHoraFin }}
            </p>
          </div>

          <div>
            <label>Fecha inicio</label>
            <input type="date" v-model="form.fechaInicio" @change="validarFechaInicio" />
            <p v-if="errorFechaInicio" class="error">
              {{ errorFechaInicio }}
            </p>
          </div>

          <div>
            <label>Fecha fin</label>
            <input type="date" v-model="form.fechaFin" @change="validarFechaFin" />
            <p v-if="errorFechaFin" class="error">
              {{ errorFechaFin }}
            </p>
          </div>

          <div>
            <label>Docente</label>
            <select v-model="form.docente" @change="validarDocente" class="custom-select">
              <option value="">Seleccione un docente</option>
              <option 
                v-for="docente in docentes" 
                :key="docente.ci"
                :value="docente.ci"
              >
                {{ docente.nombre }} ({{ docente.ci }})
              </option>
            </select>
            <p v-if="errorDocente" class="error">
              {{ errorDocente }}
            </p>
          </div>

          <div>
            <label>Aula</label>
            <select v-model="form.aula" @change="validarAula" class="custom-select">
              <option value="">Seleccione un aula</option>
              <option v-for="aula in aulas" :key="aula.id_aula" :value="aula.id_aula">
                {{ aula.nombre }}
              </option>
            </select>
            <p v-if="errorAula" class="error">
              {{ errorAula }}
            </p>
          </div>

          <div>
            <label>Monto</label>
            <input type="number" v-model="form.monto" @input="validarMonto" min="0" step="0.01" />
            <p v-if="errorMonto" class="error">
              {{ errorMonto }}
            </p>
          </div>
        </div>

        <div class="buttons">
          <button type="reset" class="btn-clear">Limpiar</button>
          <button type="submit" class="btn-register" :disabled="!formularioValido">Registrar</button>
        </div>
      </form>
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
import Icon from "../../seguridad/components/Icon.vue";
import { ref, computed, onMounted } from "vue";
import ModalExito from "../../seguridad/components/ModalExito.vue";
import ModalError from "../../seguridad/components/ModalError.vue";
import { registrarCursoExtracurricular, listarDocentes, listarAulas } from "../servicios/cursosService.js";

const showModal = ref(false);
const successMessage = ref("");

const showErrorModal = ref(false);
const errorMessage = ref("");

// Lista de docentes disponibles
const docentes = ref([]);

// Lista de aulas disponibles
const aulas = ref([]);

const form = ref({
  codigo: "",
  nombre: "",
  tipo: "Extracurricular", // Por defecto extracurricular
  cupo: "",
  dia: "",
  horaInicio: "",
  horaFin: "",
  fechaInicio: "",
  fechaFin: "",
  docente: "",
  aula: "",
  monto: ""
});

// Referencias para errores
const errorCodigo = ref("");
const errorNombre = ref("");
const errorTipo = ref("");
const errorCupo = ref("");
const errorDia = ref("");
const errorHoraInicio = ref("");
const errorHoraFin = ref("");
const errorFechaInicio = ref("");
const errorFechaFin = ref("");
const errorDocente = ref("");
const errorAula = ref("");
const errorMonto = ref("");

// Validaciones
const validarCodigo = () => {
  const regex = /^[A-Za-z0-9-_]{1,20}$/;
  
  if (!form.value.codigo || form.value.codigo.trim() === "") {
    errorCodigo.value = "El código es obligatorio";
  } else if (!regex.test(form.value.codigo)) {
    errorCodigo.value = "El código solo puede contener letras, números, guiones y guiones bajos (máx. 20 caracteres)";
  } else {
    errorCodigo.value = "";
  }
};

const validarNombre = () => {
  const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,50}$/;
  
  if (!regex.test(form.value.nombre)) {
    errorNombre.value = "El nombre debe contener solo letras y tener entre 3 y 50 caracteres";
  } else {
    errorNombre.value = "";
  }
};

const validarTipo = () => {
  if (!form.value.tipo) {
    errorTipo.value = "Debe seleccionar un tipo de curso";
  } else {
    errorTipo.value = "";
  }
};

const validarCupo = () => {
  if (!form.value.cupo || form.value.cupo <= 0 || form.value.cupo > 50) {
    errorCupo.value = "El cupo debe ser un número entre 1 y 50";
  } else {
    errorCupo.value = "";
  }
};

const validarDia = () => {
  if (!form.value.dia) {
    errorDia.value = "Debe seleccionar un día";
  } else {
    errorDia.value = "";
  }
};

const validarHoraInicio = () => {
  if (!form.value.horaInicio) {
    errorHoraInicio.value = "La hora de inicio es obligatoria";
  } else {
    errorHoraInicio.value = "";
    validarHoraFin(); // Re-validar hora fin al cambiar inicio
  }
};

const validarHoraFin = () => {
  if (!form.value.horaFin) {
    errorHoraFin.value = "La hora fin es obligatoria";
  } else if (form.value.horaInicio && form.value.horaFin <= form.value.horaInicio) {
    errorHoraFin.value = "La hora fin debe ser mayor a la hora de inicio";
  } else {
    errorHoraFin.value = "";
  }
};

const validarFechaInicio = () => {
  if (!form.value.fechaInicio) {
    errorFechaInicio.value = "La fecha de inicio es obligatoria";
  } else {
    const fechaInicio = new Date(form.value.fechaInicio);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaInicio < hoy) {
      errorFechaInicio.value = "La fecha de inicio no puede ser anterior a hoy";
    } else {
      errorFechaInicio.value = "";
      validarFechaFin(); // Re-validar fecha fin al cambiar inicio
    }
  }
};

const validarFechaFin = () => {
  if (!form.value.fechaFin) {
    errorFechaFin.value = "La fecha fin es obligatoria";
  } else if (form.value.fechaInicio && form.value.fechaFin <= form.value.fechaInicio) {
    errorFechaFin.value = "La fecha fin debe ser posterior a la fecha de inicio";
  } else {
    errorFechaFin.value = "";
  }
};

const validarDocente = () => {
  if (!form.value.docente) {
    errorDocente.value = "Debe seleccionar un docente";
  } else {
    errorDocente.value = "";
  }
};

const validarAula = () => {
  if (!form.value.aula) {
    errorAula.value = "Debe seleccionar un aula";
  } else {
    errorAula.value = "";
  }
};

const validarMonto = () => {
  if (!form.value.monto || form.value.monto <= 0) {
    errorMonto.value = "El monto debe ser mayor a 0";
  } else {
    errorMonto.value = "";
  }
};

const formularioValido = computed(() => {
  return (
    form.value.codigo &&
    form.value.nombre &&
    form.value.tipo &&
    form.value.cupo &&
    form.value.dia &&
    form.value.horaInicio &&
    form.value.horaFin &&
    form.value.fechaInicio &&
    form.value.fechaFin &&
    form.value.docente &&
    form.value.aula &&
    form.value.monto &&
    !errorCodigo.value &&
    !errorNombre.value &&
    !errorTipo.value &&
    !errorCupo.value &&
    !errorDia.value &&
    !errorHoraInicio.value &&
    !errorHoraFin.value &&
    !errorFechaInicio.value &&
    !errorFechaFin.value &&
    !errorDocente.value &&
    !errorAula.value &&
    !errorMonto.value
  );
});

const manejarEnvio = async (e) => {
  e.preventDefault();
  
  // Ejecutar todas las validaciones
  validarCodigo();
  validarNombre();
  validarTipo();
  validarCupo();
  validarDia();
  validarHoraInicio();
  validarHoraFin();
  validarFechaInicio();
  validarFechaFin();
  validarDocente();
  validarAula();
  validarMonto();

  if (!formularioValido.value) {
    alert("Por favor corrige los errores antes de enviar");
    return;
  }

  const datosEnviar = {
    id_materia: form.value.codigo.toString(), // Código de la materia (ahora manual)
    usuario_ci: form.value.docente, // CI del docente seleccionado
    nombre: form.value.nombre,
    cupo: parseInt(form.value.cupo),
    dia: form.value.dia,
    hora_inicio: form.value.horaInicio,
    hora_fin: form.value.horaFin,
    fecha_inicio: form.value.fechaInicio,
    fecha_fin: form.value.fechaFin,
    aula_id_aula: parseInt(form.value.aula),
    monto: parseFloat(form.value.monto)
  };

  // Llamada real al API
  const resultado = await registrarCursoExtracurricular(datosEnviar);
  if(resultado.exito){
    successMessage.value = resultado.mensaje || "Curso extracurricular registrado correctamente";
    showModal.value = true;
    
    // Limpiar formulario
    Object.keys(form.value).forEach(campo => {
      form.value[campo] = "";
    });
    form.value.tipo = "Extracurricular";
  } else {
    errorMessage.value = resultado.mensaje || "Error desconocido";
    if (resultado.errores && resultado.errores.length > 0) {
      errorMessage.value += ": " + resultado.errores.join(", ");
    }
    showErrorModal.value = true;
  }

};

// Cargar lista de docentes al montar el componente
onMounted(async () => {
  try {
    const resultado = await listarDocentes();
    if (resultado.exito) {
      docentes.value = resultado.data;
      console.log(`✅ ${docentes.value.length} docentes cargados`);
    } else {
      console.warn("⚠️ No se pudo cargar la lista de docentes:", resultado.mensaje);
      // No mostrar modal, permitir continuar sin docentes
    }
  } catch (error) {
    console.error("❌ Error al cargar docentes:", error);
    // No mostrar modal, permitir continuar sin docentes
  }

  // Cargar lista de aulas
  try {
    const resultado = await listarAulas();
    if (resultado.exito) {
      aulas.value = resultado.data;
      console.log(`✅ ${aulas.value.length} aulas cargadas`);
    } else {
      console.warn("⚠️ No se pudo cargar la lista de aulas:", resultado.mensaje);
      // No mostrar modal, permitir continuar sin aulas
    }
  } catch (error) {
    console.error("❌ Error al cargar aulas:", error);
    // No mostrar modal, permitir continuar sin aulas
  }
});
</script>

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

.custom-select {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
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
  border-color: #5fa8a8;
  box-shadow: 0 0 0 2px rgba(95, 168, 168, 0.2);
  background-color: #fff;
}

.custom-select:hover {
  border-color: #5fa8a8;
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
  cursor: pointer;
}

.btn-clear:hover {
  background-color: #aaa;
}

.btn-register {
  background: #5fa8a8;
  border: none;
  padding: 10px 22px;
  border-radius: 8px;
  color: white;
  cursor: pointer;
}

.btn-register:disabled {
  background: #405656;
  cursor: not-allowed;
}

.btn-register:hover:not(:disabled) {
  background: #4a9999;
}

.error {
  color: red;
  font-size: 13px;
  margin-top: 4px;
}
</style>