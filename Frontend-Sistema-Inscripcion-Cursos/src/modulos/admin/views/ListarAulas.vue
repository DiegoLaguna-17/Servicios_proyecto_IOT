<template>
  <div class="titles">
    <h1>Registro de Nuevas Aulas</h1>
    <p class="subtitle">Completa el formulario para agregar una nueva aula</p>
  </div>
  <div class="main-card">
    <p>Nombre o Código del Aula:</p>
    <div class="register-container">
      <input
        v-model="nombreAula"
        type="text"
        class="new-aula"
        placeholder="Nombre o código"
        @keyup.enter="handleRegister"
        :disabled="isSubmitting"
      />
      <button
        class="registrar"
        @click="handleRegister"
        :disabled="isSubmitting"
      >
        <span v-if="!isSubmitting">Registrar</span>
        <span v-else class="loading-content">
          <i class="spinner"></i> Registrando...
        </span>
      </button>
    </div>

    <h2>Aulas Registradas:</h2>
    <div class="aulas-cards">
      <div class="single-aula" v-for="aula in aulas" :key="aula.id_aula">
        <Icon iconName="classroom" iconColor="#0095ff" />
        <p>{{ aula.nombre }}</p>
      </div>
    </div>
  </div>

  <Transition name="fade">
    <div
      v-if="modal.show"
      class="modal-overlay"
      @click.self="modal.show = false"
    >
      <div class="modal-content" :class="modal.type">
        <div class="modal-icon-circle">
          <span v-if="modal.type === 'success'">✓</span>
          <span v-else>✕</span>
        </div>
        <h3>{{ modal.title }}</h3>
        <p>{{ modal.message }}</p>
        <button class="modal-close-btn" @click="modal.show = false">
          Entendido
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { listAllAulas, registrarAula } from "../servicios/aulasService";
import Icon from "../../seguridad/components/Icon.vue";

const nombreAula = ref("");
const aulas = ref([]);
const isSubmitting = ref(false);

const modal = ref({
  show: false,
  title: "",
  message: "",
  type: "",
});

const showModal = (title, message, type) => {
  modal.value = { show: true, title, message, type };
};

const handleRegister = async () => {
  if (!nombreAula.value.trim()) {
    showModal(
      "Campo vacío",
      "Por favor, ingresa un nombre para el aula.",
      "error",
    );
    return;
  }

  isSubmitting.value = true;

  try {
    const payload = { nombre: nombreAula.value.trim() };
    const response = await registrarAula(payload);

    if (response && response.exito !== false) {
      showModal(
        "¡Registro Exitoso!",
        `El aula ${nombreAula.value} ha sido guardada.`,
        "success",
      );
      nombreAula.value = "";
      await fetchAulas();
    } else {
      showModal(
        "No se pudo registrar",
        response.mensaje || "Error inesperado",
        "error",
      );
    }
  } catch (error) {
    showModal("Error de conexión", "Servidor no disponible", "error");
  } finally {
    isSubmitting.value = false;
  }
};

const fetchAulas = async () => {
  try {
    const response = await listAllAulas();
    if (response && response.exito) {
      aulas.value = response.data;
    }
  } catch (error) {
    console.error("Error al listar aulas:", error);
  }
};

onMounted(() => fetchAulas());
</script>

<style scoped>
.titles {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.subtitle {
  color: #707070;
}

.main-card {
  padding: 2rem;
  background: white;
  border-radius: 12px;
}

.register-container {
  margin: 0.5rem 0rem;
  display: flex;
  gap: 2rem;
  align-items: center;
  margin-bottom: 1rem;
}

.new-aula {
  flex: 6;
  padding: 0.8rem;
  border: 2px solid #b1b1b1;
  border-radius: 6px;
  outline: none;
  transition: 0.2s;
}

.new-aula:focus {
  border-color: #0095ff;
}

.aulas-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.single-aula {
  height: 10rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #f6f6f6;
  box-shadow: 4px 4px 0px #cfcece;
}

.registrar {
  cursor: pointer;
  flex: 2;
  padding: 0.8rem;
  background: #0095ff;
  color: white;
  border: 1px solid #0076ca;
  border-radius: 6px;
  font-weight: bold;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.registrar:hover:not(:disabled) {
  background: #0076ca;
}

.registrar:disabled {
  background: #a5d8ff;
  border-color: #a5d8ff;
  cursor: not-allowed;
  opacity: 0.8;
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: popIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.modal-icon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 1.8rem;
  font-weight: bold;
}

.success .modal-icon-circle {
  background: #e8f8f0;
  color: #27ae60;
  border: 2px solid #27ae60;
}

.success h3 {
  color: #27ae60;
}

.error .modal-icon-circle {
  background: #fdf2f2;
  color: #e74c3c;
  border: 2px solid #e74c3c;
}

.error h3 {
  color: #e74c3c;
}

.modal-content p {
  color: #636e72;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.modal-close-btn {
  width: 100%;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  background: #2d3436;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.modal-close-btn:hover {
  background: #000;
}

@keyframes popIn {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
