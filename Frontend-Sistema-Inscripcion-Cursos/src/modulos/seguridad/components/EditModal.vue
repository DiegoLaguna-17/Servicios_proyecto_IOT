<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="helper-container">
        <div class="user-data">
          <h2>Editar información del {{ rol}}</h2>
          <p class="subtitle">Modifica y guarda los cambios</p>
        </div>

        <div class="icon-data" @click="$emit('close')">
          <Icon iconName="cancel" iconColor="red" />
        </div>
      </div>

      <form @submit.prevent="guardarCambios">
        <div class="grid">
          <div>
            <label>
              Nombre Completo
            </label>
            <input type="text" v-model="user.nombre" disabled="">
          </div>
          <div>
            <label >Direccion</label>
            <input type="text" v-model="form.direccion">
            <p v-if="errorDireccion" class="error">{{ errorDireccion }}</p>
          </div>
          <div>
            <label >Teléfono</label>
            <input type="text" v-model="form.telefono">
            <p v-if="errorTelefono" class="error">{{ errorTelefono }}</p>
          </div>
          <div>
            <label>Correo</label>
            <input type="text" v-model="user.correo" disabled="">
          </div>
          <div>
            <label>Fecha de Nacimiento</label>
            <input type="date" v-model="user.fecha_nac" disabled="">
          </div>
          <div>
            <label>Contraseña de acceso</label>
            <div class="password-wrapper">
              <input :type="mostrarContrasenia ? 'text' : 'password'"  v-model="form.contrasenia" />
              <button type="button" class="toggle-btn" @click="mostrarContrasenia=!mostrarContrasenia">
                <Icon
                  :iconName="mostrarContrasenia ? 'visibility_off' : 'visibility'"
                  iconColor="#555"
                  />
              </button>
            </div>
            <p v-if="errorContrasenia" class="error">{{ errorContrasenia }}</p>
          </div>
          <div>
            <label>Carnet de identidad</label>
            <input type="text" v-model="user.ci" disabled="">
          </div>
          
          <div>
            <label>Confirmar contraseña</label>
            <div class="password-wrapper">
            
            <input :type="mostrarConfirmacion ? 'text' : 'password'"  v-model="form.confirmarContrasenia">
            <button type="button" class="toggle-btn" @click="mostrarConfirmacion=!mostrarConfirmacion">
                <SimpleIcon
                  :iconName="mostrarConfirmacion ? 'visibility_off' : 'visibility'"
                  iconColor="#555"
                  />
              </button>
            </div>
          </div>
          <div v-if="rol==='Estudiante'">
            <label>Carrera</label>
            <input type="text" disabled="" :value="user.carrera?.nombre ?? 'ninguna'"><!-- aca poner la carrera-->
          </div>
          <div v-if="esDocente">
            <label>Experiencia</label>
            <input type="text" v-model="user.experiencia" disabled="">
          </div>
        </div>
          
        <div class="buttons">
          <button type="reset" class="btn-clear">Limpiar</button>
          <button type="submit" class="btn-submit" :disabled="!formularioValido" >
            Guardar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch, ref } from "vue";
import Icon from "./Icon.vue";
import SimpleIcon from "./SimpleIcon.vue";

const props = defineProps({ user: { type: Object, required: true } });
const emit = defineEmits(["close", "save"]);

const mostrarContrasenia=ref(false);
const mostrarConfirmacion=ref(false);

// Estado interno para trackear cambios
const form = reactive({
  direccion: "",
  telefono: "",
  contrasenia: "",
  confirmarContrasenia: ""
});


watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      form.direccion = newUser.direccion || "";
      form.telefono = newUser.telefono || "";
      form.contrasenia = "";
      form.confirmarContrasenia = "";
    }
  },
  { immediate: true }
);
const esDocente = computed(() => props.user?.rol?.rol === "docente");

const rol = computed(() => {
  if (props.user?.rol?.rol) return "Docente";
  if (props.user?.rol_id_rol === 1) return "Administrador";
  if (props.user?.rol_id_rol === 3) return "Estudiante";
  return "desconocido";
});


// Validación de teléfono boliviano: 8 dígitos, opcional +591
const telefonoValido = computed(() => {
  if (!form.telefono) return false;
  const regex = /^(?:\+591)?[67]\d{7}$/; 
  return regex.test(form.telefono);
});

// Validación de contraseña fuerte
const contraseniaValida = computed(() => {
  if (!form.contrasenia) return true; // si no cambia, no es obligatorio
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

  return regex.test(form.contrasenia) && form.contrasenia === form.confirmarContrasenia;
});

// Errores de dirección
const errorDireccion = computed(() => {
  if (!form.direccion.trim()) return "La dirección no puede estar vacía";
  return "";
});

// Errores de teléfono
const errorTelefono = computed(() => {
  if (!form.telefono.trim()) return "El teléfono no puede estar vacío";
  const regex = /^(?:\+591)?[67]\d{7}$/;
  if (!regex.test(form.telefono)) return "Ingrese un teléfono válido de Bolivia (+591 opcional, 8 dígitos, empieza en 6 o 7)";
  return "";
});

// Errores de contraseña
const errorContrasenia = computed(() => {
  if (!form.contrasenia) return "";
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
  if (!regex.test(form.contrasenia))
    return "La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial";
  if (form.contrasenia !== form.confirmarContrasenia)
    return "Las contraseñas no coinciden";
  return "";
});


const formularioValido = computed(() => {
   // Dirección no vacía
  if (!form.direccion.trim()) return false;
  // Teléfono válido
  if (!telefonoValido.value) return false;
  // Contraseña válida si cambió
  if (!contraseniaValida.value) return false;
  const cambioTelefonoDireccion = (form.telefono !== props.user.telefono) || (form.direccion !== props.user.direccion);

  const cambioContraseniaValida = form.contrasenia && (form.contrasenia === form.confirmarContrasenia);

  return cambioTelefonoDireccion || cambioContraseniaValida;
});

// Función que arma los datos a enviar
const guardarCambios = () => {
  const cambios = { 
    ci: props.user.ci ,

  }; 

  if (form.telefono !== props.user.telefono) cambios.telefono = form.telefono;
  if (form.direccion !== props.user.direccion) cambios.direccion = form.direccion;
  if (form.contrasenia && form.contrasenia === form.confirmarContrasenia) {
    cambios.contrasenia = form.contrasenia;
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
</style>
