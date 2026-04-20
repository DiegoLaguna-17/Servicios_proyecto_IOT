<template>
  <div class="icon-wrapper">
    <Icon
      to="listarDocentes"
      iconName="arrow_back"
      iconColor="black"
      message="Volver"
    />
  </div>

  <h2>Registrar Docentes</h2>
  <p class="subtitle">Completa el formulario para agregar un nuevo docente</p>

  <div class="form-card">
    <form @submit="manejarEnvio" autocomplete="off">
      <div class="grid">
        <div>
          <label>Carnet de Identidad</label>
          <input type="text" v-model="form.ci" @blur="validarCI" />
            <p v-if="errorCI" class="error">
              {{ errorCI }}
            </p>
        </div>

        <div>
          <label>Nombre Completo</label>
          <input type="text" v-model="form.nombre"@input="validarNombre"/>
            <p v-if="errorNombre" class="error">
              {{ errorNombre }}
            </p>
        </div>

        <div>
          <label>Dirección</label>
          <input type="text" v-model="form.direccion" @input="validarDireccion"/>
            <p v-if="errorDireccion" class="error">
              {{ errorDireccion }}
            </p>
        </div>

        <div>
          <label>Teléfono</label>
          <input type="text" v-model="form.telefono" @input="validarTelefono" inputmode="numeric"/>
            <p v-if="errorTelefono" class="error">
              {{ errorTelefono }}
            </p>
        </div>

        <div>
          <label>Fecha de Nacimiento</label>
          <input type="date" v-model="form.fechaNac" @change="validarFecha"/>
            <p v-if="errorFecha" class="error">
              {{ errorFecha }}
            </p>
        </div>

        <div>
          <label>Correo Electrónico</label>
          <input type="email" v-model="form.correo"  @input="validarCorreo" autocomplete="new-email" />
            <p v-if="errorCorreo" class="error">
              {{ errorCorreo }}
            </p>
        </div>

        <div>
          <label>Experiencia</label>
          <input type="text" v-model="form.experiencia" @input="validarExperiencia" />
          <p v-if="errorExperiencia" class error>
            {{ errorExperiencia }}
          </p>
        </div>
        <div>
          <label>Contraseña</label>
          <div class="password-wrapper">
              <input :type="mostrarContrasenia ? 'text' : 'password'" v-model="form.contrasenia" autocomplete="new-password" @input="validarContrasenia" />
              <button type="button" class="toggle-btn" @click="mostrarContrasenia=!mostrarContrasenia">
                <Icon
                  :iconName="mostrarContrasenia ? 'visibility_off' : 'visibility'"
                  iconColor="#555"
                  />
              </button>
            </div>
            <p v-if="errorContrasenia" class="error">
              {{ errorContrasenia }}
            </p>
        </div>

        <div>
          <label>Confirmación de Contraseña</label>
          <div class="password-wrapper">
              <input :type="mostrarConfirmacion?'text':'password'" v-model="form.confirmarContrasenia"autocomplete="new-password" @input="validarConfirmacion" />
              <button type="button" class="toggle-btn" @click="mostrarConfirmacion=!mostrarConfirmacion">
                <Icon
                  :iconName="mostrarConfirmacion ? 'visibility_off' : 'visibility'"
                  iconColor="#555"
                  />
              </button>
            </div>
            <p v-if="errorConfirmacion" class="error">
              {{ errorConfirmacion }}
            </p>
        </div>
      </div>

      <div class="buttons">
        <button type="reset" class="btn-clear">Limpiar</button>
        <button
          type="submit"
          class="btn-register"
          :disabled="!formularioValido"
        >
          Registrar
        </button>
      </div>
    </form>
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
import Icon from "../components/Icon.vue";
import { ref, computed } from "vue";
import { registrarDocente } from "../servicios/seguridadService";
import ModalExito from "../components/ModalExito.vue";
import ModalError from "../components/ModalError.vue";

const showModal = ref(false);
const successMessage = ref("");

const showErrorModal = ref(false);
const errorMessage = ref("");

const form = ref({
  ci: "",
  nombre: "",
  direccion: "",
  telefono: "",
  fechaNac: "",
  correo: "",
  experiencia: "",
  contrasenia: "",
  confirmarContrasenia: "",
});


const mostrarContrasenia=ref(false);
const mostrarConfirmacion=ref(false);
const registroExitoso=ref(false)
const errorCI=ref("");
const errorNombre=ref("");
const errorDireccion=ref("");
const errorTelefono=ref("");
const errorFecha=ref("");
const errorCorreo=ref(""); 
const errorContrasenia=ref("");
const errorConfirmacion=ref("");
const errorExperiencia=ref("");

const validarCI=()=>{
  const regex= /^[0-9]{6,8}$/;
  if(!regex.test(form.value.ci)){
    errorCI.value="El CI debe tener entre 6 y 8 dígitos";
  }else{
    errorCI.value="";
  }
};

const validarNombre = () => {
  const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/
  
  if (!regex.test(form.value.nombre)) {
    errorNombre.value = "El nombre solo debe contener letras y mínimo 2 caracteres"
  } else {
    errorNombre.value = ""
  }
}

const validarDireccion=()=>{
  const regex= /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s#.,-]{5,}$/
  if (form.value.direccion.trim() === "") {
    errorDireccion.value = "La dirección es obligatoria"
    return
  }

  if (!regex.test(form.value.direccion)) {
    errorDireccion.value = "Dirección inválida (mínimo 5 caracteres)"
  } else {
    errorDireccion.value = ""
  }
}

const validarTelefono=()=>{
  const regex = /^[67][0-9]{7}$/
  if (form.value.telefono.trim() === "") {
    errorTelefono.value = "El número de celular es obligatorio"
    return
  }

  if (!regex.test(form.value.telefono)) {
    errorTelefono.value = "Debe tener 8 dígitos y comenzar con 6 o 7"
  } else {
    errorTelefono.value = ""
  }
}

const validarFecha=()=>{
  if (!form.value.fechaNac) {
    errorFecha.value = "La fecha de nacimiento es obligatoria"
    return
  }

  const hoy = new Date()
  const fechaNacimiento = new Date(form.value.fechaNac)

  // No permitir fechas futuras
  if (fechaNacimiento > hoy) {
    errorFecha.value = "La fecha no puede ser futura"
    return
  }

  // Calcular edad
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear()
  const mes = hoy.getMonth() - fechaNacimiento.getMonth()

  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
    edad--
  }

  if (edad < 18) {
    errorFecha.value = "Debe ser mayor de 18 años"
  } else {
    errorFecha.value = ""
  }
}

const validarCorreo=()=>{
  if (form.value.correo.trim() === "") {
    errorCorreo.value = "El correo es obligatorio"
    return
  }

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!regex.test(form.value.correo)) {
    errorCorreo.value = "Ingrese un correo electrónico válido"
  } else {
    errorCorreo.value = ""
  }
}

const validarContrasenia=()=>{
  const password = form.value.contrasenia

  if (!password) {
    errorContrasenia.value = "La contraseña es obligatoria"
    return
  }

  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/

  if (!regex.test(password)) {
    errorContrasenia.value =
      "Debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo"
  } else {
    errorContrasenia.value = ""
  }

  validarConfirmacion()
}
const validarConfirmacion = () => {
  if (!form.value.confirmarContrasenia) {
    errorConfirmacion.value = "Debe confirmar la contraseña"
    return
  }

  if (form.value.contrasenia !== form.value.confirmarContrasenia) {
    errorConfirmacion.value = "Las contraseñas no coinciden"
  } else {
    errorConfirmacion.value = ""
  }
}

const validarExperiencia=()=>{
    if(form.value.experiencia.trim()===""){
        errorExperiencia.value="La experiencia es obligatoria ";
        return;
    }
    if(form.value.experiencia.length<10){
        errorExperiencia.value="Debe tener mínimo 10 caracteres";
        return;
    }
    if(form.value.experiencia.length>50){
         errorExperiencia.value="Debe tener máximo 50 caracteres";
        return;
    }else{
        errorExperiencia.value="";
    }

}

const formularioValido = computed(() => {
  return (
    form.value.ci &&
    form.value.nombre &&
    form.value.direccion &&
    form.value.telefono &&
    form.value.fechaNac &&
    form.value.correo &&
    form.value.experiencia &&
    form.value.contrasenia &&
    form.value.confirmarContrasenia &&
    form.value.contrasenia === form.value.confirmarContrasenia &&
    !errorCI.value && !errorNombre.value && !errorDireccion.value && !errorTelefono.value &&
    !errorFecha.value && !errorCorreo.value && !errorContrasenia.value && !errorConfirmacion.value && !errorExperiencia.value
  );
});

const manejarEnvio = async(e) => {
    e.preventDefault();
  validarCI();
  validarNombre();
  validarDireccion();
  validarTelefono();
  validarFecha();
  validarCorreo();
  validarContrasenia();
  validarConfirmacion();
validarExperiencia();
  if(!formularioValido.value){
    return;
  }
  
   const datosEnviar={
    ci:form.value.ci,
    nombre:form.value.nombre,
    correo:form.value.correo,
    telefono:form.value.telefono,
    contrasenia:form.value.contrasenia,
    fecha_nac:form.value.fechaNac,
    direccion:form.value.direccion,
    experiencia:form.value.experiencia
  };
  const resultado=await registrarDocente(datosEnviar);
  if(resultado.status===201){
    // Éxito
    successMessage.value = "Docente registrado correctamente";
    showModal.value = true;

    // Limpiar formulario
    Object.keys(form.value).forEach(key => form.value[key] = "");
 }else{
     // Error
    errorMessage.value = resultado.data.message || "Error al registrar";
  showErrorModal.value = true;
 }
 

};
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
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
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
  justify-content: flex-end;
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

.btn-register {
  cursor: pointer;
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

</style>
