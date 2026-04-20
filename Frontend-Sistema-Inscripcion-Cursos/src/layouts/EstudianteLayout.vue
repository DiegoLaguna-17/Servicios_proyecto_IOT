<template>
  <div class="admin-container">
    <Sidebar />

    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Sidebar from '../modulos/estudiantes/components/Sidebar.vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();


onMounted(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.replace('/login'); // redirige si no hay token
  }
});

</script>

<style scoped>
.admin-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden; /* Evita scrolls raros */
}

.content {
  flex: 1;
  
  background: #f5f6f7;
  overflow-y: auto;
  width: 100%;
}

@media (max-width: 768px) {
  .content {
    padding: 20px;
    padding-top: 70px; /* Espacio para el botón hamburguesa */
  }
}
</style>
