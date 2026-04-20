<template>
  <div class="login-container">
    <div class="login-card">
      
      <div class="login-right">
        <div class="title-container">
          <h2>SixSeven Academy</h2>
        </div>

        <form @submit.prevent="login">
          <div class="form-container">
            <div class="form-group">
              <label>Usuario</label>
              <input v-model="correo" type="email"  />
            </div>

            <div class="form-group password-group">
  <label>Contraseña</label>
  <div class="password-wrapper">
    <input v-model="password" :type="mostrarContrasenia ? 'text' : 'password'" />
    <span class="toggle-password" @click="mostrarContrasenia = !mostrarContrasenia">
      <Icon :iconName="mostrarContrasenia ? 'visibility_off' : 'visibility'" iconColor="#fff  " />
    </span>
  </div>
</div>

          </div>

          <div class="form-actions">
            <button type="submit" :disabled="cargando">
              {{ cargando ? 'Ingresando...' : 'Ingresar' }}
            </button>
          </div>

          <p v-if="error" class="error">{{ error }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>

.login-container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #dee7ef;
  padding: 2rem;
}

.login-card {
  display: flex;
  border-radius: 50px;
  overflow: hidden;
  width: 90%; /* Un poco más ancho en general */
  max-width: 1000px; /* Evita que crezca demasiado en monitores gigantes */
  min-height: 500px; /* Altura mínima en lugar de fija */
  box-shadow: 0 10px 25px rgba(2, 82, 113, 0.3);
  background: white; /* Asegura un fondo si el gradiente falla */
}

.login-left {
  flex: 1.2;
  background: #dee7ef;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-logo {
  max-width: 70%;
  max-height: 75%;
  object-fit: contain;
}

.login-right {
  flex: 0.8;
  background: linear-gradient(#00597B,#5AB2C6);
  padding: 5rem 2rem 3rem 2rem; /* Aumenté el padding superior */
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;
  position: relative; /* Crucial para el posicionamiento del título */
}

.title-container {
  background-color: #5ab2c6;
  padding: 1rem 2rem;
  border-radius: 0 50px 50px 0;
  margin-bottom: 2rem;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  position: absolute;
  top: 30px;
  left: 0;
  right: 20px; /* Reducido un poco */
  z-index: 10;
}

.title-container h2 {
  margin: 0;
  color: white;
  font-size: clamp(1.5rem, 4vw, 2.5rem); /* Tamaño fluido según pantalla */
  text-align: left;
}

.form-group {
  
  margin-bottom: 1.5rem;
}

.form-container {
  padding: 30px 10%; /* Reducido el 20% para ganar espacio */
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 1.3rem;

}

input {
  width: 80%;
  padding: 0.5rem 0;
  border: none;
  border-bottom: 3px solid white;
  background: transparent;
  color: white;
  font-size: 1rem;
}

input::placeholder {
  color: rgba(255,255,255,0.7);
}

input:focus {
  outline: none;
  border-bottom: 2px solid #f7ba00;
}

.form-actions {

  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

button {
  background: radial-gradient(circle, #f7ba00 0%, #d48806 100%);
  color: white;
  border:1px solid#000;
  border-radius: 50px;
  padding: 0.8rem 3rem;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 5px 10px rgba(0,0,0,0.2);
  transition: background 0.3s ease;
  width: 60%;
}

button:hover {
  background: #d4a000;
}

.error {
  margin-top: 1rem;
  color: #ff8080;
  text-align: center;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 80%;
}

.toggle-password {
  position:absolute;
  right: 0;
  cursor: pointer;
  font-size: 1.2rem;
  user-select: none;
  color: white;
}
@media (max-width: 768px) {
  .login-container {
    padding: 1rem;
    height: auto;
    min-height: 100vh;
  }

  .login-card {
    flex-direction: column; /* Apila los elementos verticalmente */
    height: auto;
    border-radius: 30px;
  }

  .login-left {
    padding: 2rem;
    flex: none; /* Evita que crezca demasiado */
  }

  .login-logo {
    max-width: 150px; /* Logo más pequeño en móvil */
  }

  .login-right {
    padding: 6rem 1.5rem 3rem 1.5rem; /* Más espacio arriba para el título absoluto */
    flex: none;
  }

  .title-container {
    top: 15px;
    padding: 0.8rem 1.5rem;
  }

  .form-container {
    padding-left: 5%;
    padding-right: 5%;
  }

  input, .password-wrapper {
    width: 100%; /* Inputs a ancho completo */
  }

  button {
    width: 100%; /* Botón grande para facilitar el toque */
  }
}
</style>


<script setup>
import { ref ,onMounted} from 'vue';
import AuthService from '../services/AuthService';
import { useRouter } from 'vue-router';
import Icon from '../componentes/Icon.vue';


const router = useRouter();

const correo = ref('');
const password = ref('');
const error = ref('');
const cargando = ref(false);


const mostrarContrasenia=ref(false)
const login = async () => {
  error.value = '';
  cargando.value = true;

  try {
    const response = await AuthService.login(correo.value, password.value);

    const { success, data } = response.data;

    if (success) {
      // Guardamos token y datos del usuario
      //localStorage.setItem('token', data.token);
      localStorage.setItem('nombre', data.nombre);
      localStorage.setItem('id', data.id); // Guardar CI para uso en otros módulos

      // Redirigir al home/dashboard
      setTimeout(() => {
    // Redirigir al dashboard según rol
    
      router.push('/usuario');
   
  }, 2000);
      
    } else {
      error.value = mensaje;
    }
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al iniciar sesión';
  } finally {
    cargando.value = false;
  }
};
</script>
