<template>
  <div class="admin-container">
    <Sidebar />

    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Sidebar from '../modulos/seguridad/components/Sidebar.vue';
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
  height: 100%;
}

.content {
  height: 100%;
  flex: 1;
  padding: 40px;
  background: #f5f6f7;
  overflow-y: auto;
}
@media (max-width: 768px) {
  .content {
    padding: 20px;
    padding-top: 70px; /* Espacio para el botón hamburguesa */
  }
}
</style>
