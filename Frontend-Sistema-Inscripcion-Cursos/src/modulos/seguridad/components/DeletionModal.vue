<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h2>Eliminar a: {{ user.nombre }}</h2>
      <div class="button-group">
        <button class="btn-cancelar" @click="$emit('cancelar')">
          Cancelar
        </button>
        <button class="btn-eliminar" @click="$emit('aceptar')">Eliminar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ user: { type: Object, required: true } });
defineEmits(["cancelar", "aceptar"]);
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

.button-group {
  margin: 1rem 0rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.btn-cancelar {
  cursor: pointer;
  background-color: transparent;
  padding: 1rem;
  color: black;
  border: none;
  border-radius: 12px;
  font-size: large;
}

.btn-cancelar:hover {
  background-color: #eee;
}

.btn-eliminar {
  cursor: pointer;
  padding: 1rem;
  background-color: red;
  color: #eee;
  border: none;
  border-radius: 12px;
  font-size: large;
}

.btn-eliminar:hover {
  background-color: crimson;
}
</style>
