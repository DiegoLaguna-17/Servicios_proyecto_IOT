<template>
  <div>
    <div class="icon-wrapper">
      <Icon
      to="listarCarreras"
      iconName="arrow_back"
      iconColor="black"
      message="Volver"
    />
    </div>
       

    <h2>Registros de nuevas Carreras</h2>
    <p>Completa el formulario para agregar una nueva Carrera</p>

    <div class="form-card">
      <form @submit="manejarEnvio" autocomplete="off">
        <div class="grid">

          <div>
            <label>Codigo</label>
            <input type="text" v-model="form.codigo" @input="validarCodigo" maxlength="4"/>
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
            <label>Descripción</label>
            <input type="text" v-model="form.descripcion" @blur="validarDescripcion" />
            <p v-if="errorDescripcion" class="error">
              {{ errorDescripcion }}
            </p>
          </div>
          
          <div>
            <label>Duración</label>
            <input type="text" v-model="form.duracion" @input="validarDuracion"  />
            <p v-if="errorDuracion" class="error">
              {{ errorDuracion }}
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

</style>

<script setup>
import Icon from "../../seguridad/components/Icon.vue";
import { ref, computed} from "vue";
import { registrarCarrera } from "../servicios/adminsService";
import ModalExito from "../../seguridad/components/ModalExito.vue";
import ModalError from "../../seguridad/components/ModalError.vue";

const showModal = ref(false);
const successMessage = ref("");

const showErrorModal = ref(false);
const errorMessage = ref("");

const form=ref({
  codigo:"",
  nombre:"",
  descripcion:"",
  duracion:""
});

const mostrarContrasenia=ref(false);
const mostrarConfirmacion=ref(false);

const errorCodigo=ref("");
const errorNombre=ref("");
const errorDescripcion=ref("");
const errorDuracion=ref("");


const validarCodigo=()=>{
  const regex= /^[a-z]{2,4}$/;
  if(!regex.test(form.value.codigo)){
    errorCodigo.value="El codigo debe tener entre 3 y 4 caracteres";
  }else{
    errorCodigo.value="";
  }
};

const validarNombre = () => {
  const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{7,}$/
  
  if (!regex.test(form.value.nombre)) {
    errorNombre.value = "El nombre solo debe contener letras y mínimo 7 caracteres"
  } else {
    errorNombre.value = ""
  }
}

const validarDescripcion=()=>{
  const regex= /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s#.,-]{30,}$/
  if (form.value.descripcion.trim() === "") {
    errorDescripcion.value = "La descripción es obligatoria"
    return
  }

  if (!regex.test(form.value.descripcion)) {
    errorDescripcion.value = "Descripción inválida (mínimo 30 caracteres)"
  } else {
    errorDescripcion  .value = ""
  }
}

const validarDuracion = () => {
  const regex = /^[0-9]+ (año|años)$/i

  if (form.value.duracion.trim() === "") {
    errorDuracion.value = "La duración es obligatoria"
    return
  }

  if (!regex.test(form.value.duracion.trim())) {
    errorDuracion.value = "Debe tener el formato: 5 años o 1 año"
  } else {
    errorDuracion.value = ""
  }
}


const formularioValido=computed(()=>{
  return(
    form.value.codigo &&
    form.value.nombre &&
    form.value.descripcion &&
    form.value.duracion &&
    !errorCodigo.value && !errorNombre.value && !errorDuracion.value && !errorDescripcion.value 
  )
})
const manejarEnvio=async(e)=>{
  e.preventDefault();
  validarCodigo();
  validarNombre();
  validarDescripcion();
  validarDuracion();

  if(!formularioValido.value){
    alert("Porfavor corrige los errores antes de enviar");
    return;
  }
  const datosEnviar={
    codigo:form.value.codigo,
    nombre:form.value.nombre,
    descripcion:form.value.descripcion,
    duracion:form.value.duracion,
  };

  
  const resultado=await registrarCarrera(datosEnviar);
  if(resultado.success){
    successMessage.value="Carrera registrada correctamente";
    
    showModal.value = true;
  }else{
    errorMessage.value = resultado.errores || "Error desconocido";
    showErrorModal.value = true;
    if(resultado.errores){
      console.log("Errores backend: ", resultado.errores)
    }
  }
 Object.keys(form.value).forEach(campo=>{form.value[campo]=""});
}
</script>