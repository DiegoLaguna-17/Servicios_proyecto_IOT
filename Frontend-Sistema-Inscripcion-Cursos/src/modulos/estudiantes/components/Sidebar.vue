<template>
<button class="menu-toggle" @click="toggleMenu">
    ☰
  </button>

  <aside class="sidebar-container" :class="{ 'is-open': isMenuOpen }">
    <div class="sidebar-accent"></div>

    <div class="sidebar-content">
      <div class="profile-section">
        <div class="profile-img">
          <img src="/src/assets/logo.png" alt="Logo" />
        </div>
        <div class="profile-info">
          <div class="titulo">SixSeven</div>
          <div class="titulo">Academy</div>
        </div>
      </div>

      <div class="user-section">
        <div class="user-icon">
          <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="Usuario" />
        </div>
        <div class="user-data">
          <div class="user-name">{{ nombreUsuario }}</div>
          <div class="user-role">Estudiante</div>
        </div>
      </div>

      <nav class="menu">
        <router-link to="/estudiante/miPerfil" class="menu-item" @click="isMenuOpen = false">Mi Perfil</router-link>
        <router-link to="/estudiante/miCarrera" class="menu-item" @click="isMenuOpen = false">Mi Carrera</router-link>
        <router-link to="/estudiante/ofertaAcademica" class="menu-item" @click="isMenuOpen = false">Oferta Academica</router-link>
        <router-link to="/estudiante/misMaterias" class="menu-item" @click="isMenuOpen = false">Mis materias</router-link>
      </nav>

      <button class="logout-btn" @click="logoutUsuario">
        Cerrar Sesión
      </button>
    </div>
  </aside>

  <div v-if="isMenuOpen" class="overlay" @click="isMenuOpen = false"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { logout } from '../../seguridad/servicios/seguridadService'
const router = useRouter()
const nombreUsuario = ref('')
const isMenuOpen = ref(false) // Estado del menú

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

onMounted(() => {
  nombreUsuario.value = localStorage.getItem('nombre') || "Usuario"; 
})
const logoutUsuario = async () => {
  await logout()
  localStorage.clear()
  router.push('/login')
}
</script>

<style scoped>

/* Contenedor principal */
.sidebar-container {
  display: flex;
  width: 280px;
  height: 100vh;
  background-color: #A0DDE0;
  transition: transform 0.3s ease; /* Transición suave */
  z-index: 1000;
}

/* Franja lateral */
.sidebar-accent {
  width: 45px;
  background-color: #004D66;
  height: 100%;
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 40px 20px;
  align-items: center;
}

/* Logo */
.profile-section {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
  margin-bottom: 25px;
}

.profile-img {
  width: 80px;
  height: 80px;
  background-color: #D9D9D9;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.profile-img img {
  width: 90%;
  object-fit: contain;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.titulo {
  font-size: 3.5vh;
  font-weight: bold;
  color: #004D66;
}

/* SECCIÓN USUARIO */
.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin-bottom: 40px;
}

.user-icon {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: #004D66;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
}

.user-data {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: bold;
  color: #002B3D;
}

.user-role {
  font-size: 0.85rem;
  color: #004D66;
  opacity: 0.8;
}

/* Menú */
.menu {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  flex-grow: 1;
}

.menu-item {
  text-decoration: none;
  padding: 15px;
  border-radius: 30px;
  background: #7FB6BD;
  color: #002B3D;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s ease;
}

.menu-item.router-link-active {
  background-color: #000066;
  color: white;
}

.menu-item-disabled {
  background: #999 !important;
  color: #666 !important;
  cursor: not-allowed !important;
}

/* Logout */
.logout-btn {
  width: 90%;
  padding: 15px;
  border-radius: 30px;
  border: none;
  background-color: #003355;
  color: white;
  font-weight: bolder;
  cursor: pointer;
  margin-top: auto;
}

.logout-btn:hover {
  background-color: #002233;
}

.user-icon {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: #004D66;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.user-icon img {
  width: 70%;
  height: 70%;
  object-fit: contain;
}

.menu-toggle {
  display: none; /* Escondido en escritorio */
  position: fixed;
  top: 20px;
  left: 20px; /* Botón a la derecha */
  z-index: 1100;
  background: #004D66;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .menu-toggle {
    display: block; /* Aparece en móviles */
  }

  .sidebar-container {
    position: fixed;
    top: 0;
    left: 0; /* Lo posicionamos a la derecha */
    transform: translateX(-100%); /* Lo sacamos de la pantalla por la derecha */
  }

  /* Cuando tiene la clase 'is-open', vuelve a su posición */
  .sidebar-container.is-open {
    transform: translateX(0);
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.5);
    z-index: 999;
  }
}
</style>
2. Layout (AdminContainer.vue)
Para que el contenido no se rompa cuando el sidebar "desaparece", asegúrate de que el contenedor principal use relative o maneje bien el flujo:

Fragmento de código
<style scoped>
.admin-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden; /* Evita scrolls raros */
}

.content {
  flex: 1;
  padding: 40px;
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
