<template>
  <div class="search-bar">
    <Icon iconName="search" iconColor="#666" />
    <input type="text" class="search-box" placeholder="Buscar..."  v-model="search" @input="emitSearch" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import Icon from "../../seguridad/components/Icon.vue";
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
  align-items: center;
  gap: 10px;
  background-color: #eee;
  border: 2px solid transparent; /* Para un efecto de foco suave */
  border-radius: 50px;
  padding: 8px 16px;
  transition: all 0.3s ease;
  
  /* Responsive: Ocupa todo el ancho en móvil, pero no se estira infinito en PC */
  width: 100%; 
  max-width: 100%; /* Por defecto en móvil */
}

/* Efecto visual cuando el usuario hace clic para escribir */
.search-bar:focus-within {
  background-color: #fff;
  border-color: #5fa8a8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-box {
  flex: 1;
  background: transparent;
  border: none;
  /* Evita que el zoom automático de iOS se active (mínimo 16px recomendado) */
  font-size: 16px; 
  outline: none;
  color: #333;
  width: 100%;
}

/* Placeholder un poco más claro */
.search-box::placeholder {
  color: #999;
}

/* Ajustes para Tablets y Desktop */
@media (min-width: 768px) {
  .search-bar {
    max-width: 400px; /* Evita que la barra sea gigante en monitores */
    padding: 6px 14px;
  }
  
  .search-box {
    font-size: 14px; /* Un poco más pequeño en desktop se ve más refinado */
  }
}
</style>