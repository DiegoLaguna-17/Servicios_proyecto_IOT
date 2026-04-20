<template>
  <div class="card">
    <div class="teacher-data">
      <h3>{{ user.nombre }}</h3>
      <p class="teacher-details">{{ user.correo }}</p>
    </div>
    <div class="action-group">
      <button class="action" @click="$emit('edit')">
        <Icon iconName="edit" />
      </button>
      <button class="action" @click="$emit('delete')">
        <Icon iconName="trash" />
      </button>
    </div>
  </div>
</template>

<script setup>
import Icon from "./Icon.vue";

defineProps({ user: { type: Object, required: true } });
defineEmits(["edit", "delete"]);
</script>

<style scoped>
.card {
  display: flex;
  flex-direction: row;
  margin: 10px 0px;
  padding: 1rem;
  border-radius: 5px;
  background-color: white;
  box-shadow: 10px 10px 12px 10px rgba(0, 0, 0, 0.05);
}

.teacher-data {
  display: flex;
  flex-direction: column;
  flex: 8;
}

.teacher-details {
  color: #666;
}

.action-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex: 2;
}

.action {
  cursor: pointer;
  min-width: 35%;
  height: 80%;
  border: none;
  border-radius: 5px;
  background-color: transparent;
  color: black;
}

.action:hover {
  background-color: #eee;
}
</style>
