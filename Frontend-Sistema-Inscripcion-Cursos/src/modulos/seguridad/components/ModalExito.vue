<template>
  <div v-if="visible" class="modal-backdrop">
    <div class="modal-container">
      <h2>✅ Operación Exitosa</h2>
      <p>{{ message }}</p>
      <button @click="closeModal">Aceptar</button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  message: { type: String, default: "¡Todo salió bien!" },
  visible: { type: Boolean, default: false }
});

const emit = defineEmits(["close"]);

function closeModal() {
  emit("close");
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 400px;
  text-align: center;
}

.modal-container h2 {
  color: green;
  margin-bottom: 1rem;
}

.modal-container button {
  margin-top: 1rem;
  padding: 0.5rem 1.2rem;
  background-color: green;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.modal-container button:hover {
  background-color: darkgreen;
}
</style>
