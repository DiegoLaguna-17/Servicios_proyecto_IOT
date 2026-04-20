<template>
  <div class="admin-container">
    <Sidebar />

    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Sidebar from '../modulos/usuario/componentes/Sidebar.vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();


onMounted(() => {
 
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
</style>
