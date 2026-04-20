

<template>
  <div class="cart-overlay" @click.self="$emit('cerrar')">
    <div class="cart-sidebar">

      <div class="cart-header">
        <h2>Carrito de cursos</h2>
        <Icon icon-name="shopping_cart" icon-color="#fff"/>
        <button class="close" @click="$emit('cerrar')">✖</button>
      </div>

      <div v-if="carrito.cursos.length === 0" class="empty">
        No hay cursos en el carrito
      </div>

      <div v-else class="content">

        <div 
          v-for="curso in carrito.cursos" 
          :key="curso.id_materia"
          class="cart-item"
        >
          <span class="codigo">{{ curso.id_materia }}</span>
          <span class="nombre">{{ curso.nombre }}</span>
          <span class="monto">Bs {{ curso.monto }}</span>
          <button class="delete" @click="eliminar(curso.id_materia)">
            <Icon iconName="trash" icon-color="red"/>
          </button>
        </div>

        
      </div>
      <div class="cart-bottom">
            <div class="total">
            <strong>Total:</strong>
            <span>Bs {{ carrito.total }}</span>
            </div>

            <button class="clear" @click="vaciar">
            Vaciar carrito
            </button>

            <button class="pay" @click="pagar" :disabled="carrito.cursos.length === 0">
            {{carrito.cursos.length === 0 ? "No hay cursos en el carrito" : "Realizar el pago"}}
            </button>
        </div>

    </div>
  </div>
</template>

<script setup>
import { usarCarrito } from '../../../store/carrito';
import Icon from '../../seguridad/components/Icon.vue';
import { useRouter } from 'vue-router';
const carrito=usarCarrito();
const router=useRouter();
const eliminar = (id_materia) => {
  carrito.eliminarCurso(id_materia);
};

const vaciar = () => {
  carrito.vaciarCarrito();
};

const pagar = () => {
  router.push({name:"pagarCarrito"})
};
</script>
<style scoped>
/* 1. Overlay - Fondo oscuro */
.cart-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: flex-end;
  z-index: 1000;
  /* Suaviza la aparición del fondo */
  backdrop-filter: blur(2px);
}

/* 2. Sidebar - El cuerpo del carrito */
.cart-sidebar {
  width: 100%; /* Por defecto ocupa todo el ancho (móvil) */
  max-width: 100%; 
  height: 100%;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
  
  /* Aplicamos la animación que ya tenías definida */
  animation: slideIn 0.3s ease-out;
}

/* 3. Header - Quitamos los porcentajes fijos de altura */
.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #1a1a7c;
  padding: 1.2rem; /* Usamos rem para consistencia */
  color: #fff;
}

.cart-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.close {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #fff;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 4. Contenido de la lista */
.content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.empty {
  padding: 2rem;
  text-align: center;
  color: #666;
}

/* 5. Items del carrito */
.cart-item {
  display: grid; /* Cambiamos a grid para mejor control en móvil */
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  background: #fff;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  border-left: 4px solid #1a1a7c;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.codigo {
  background: #0b7285;
  color: white;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: bold;
}

.nombre {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

.monto {
  font-weight: bold;
  color: #1a1a7c;
}

.delete {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
}

/* 6. Parte inferior (Footer) */
.cart-bottom {
  padding: 1.5rem;
  background: #fff;
  border-top: 1px solid #ddd;
  box-shadow: 0 -4px 10px rgba(0,0,0,0.03);
}

.total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.clear {
  width: 100%;
  padding: 8px;
  background: transparent;
  color: #666;
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.pay {
  width: 100%;
  padding: 14px;
  background: #5fa8a8; /* Color consistente con tus otros componentes */
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: background 0.3s;
}

.pay:hover {
  background: #4d8a8a;
}

/* --- MEDIA QUERIES --- */

/* Tablets y Desktop */
@media (min-width: 600px) {
  .cart-sidebar {
    width: 400px; /* Tamaño fijo ideal para una sidebar */
  }
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
</style>