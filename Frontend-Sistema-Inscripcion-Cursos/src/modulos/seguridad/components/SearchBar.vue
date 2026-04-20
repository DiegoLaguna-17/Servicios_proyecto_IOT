<template>
  <div class="search-bar">
    <Icon iconName="search" iconColor="#666" />
    <input type="text" class="search-box" placeholder="Buscar..."  v-model="search" @input="emitSearch" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import Icon from "./Icon.vue";

const emit = defineEmits(["update:search"]);

const search = ref("");

const emitSearch = () => {
  emit("update:search", search.value);
};
</script>

<style scoped>
.search-bar {
  display: flex;
  flex-direction: row;
  flex: 7;
  align-items: center;
  gap: 6px;
  background-color: #eee;
  border: none;
  border-radius: 50px;
  padding: 0.2rem 1rem;
}

.search-box {
  flex: 1;
  background: transparent;
  border: none;
  font-size: small;
  outline: none;
}
</style>
