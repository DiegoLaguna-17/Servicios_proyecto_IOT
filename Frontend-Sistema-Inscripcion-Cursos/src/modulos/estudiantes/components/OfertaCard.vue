<template>
  <div class="card-container">
    <div class="header">
      <h2 class="title">{{ curso.nombre }}</h2>
      <p class="codigo">ID: {{ curso.id_materia }}</p>
      <p class="docente"><strong>Docente:</strong> {{ curso.docente.nombre }}</p>
    </div>

    <div class="content">
      <div class="info-grid">
        <div class="box">
          <p>Cupo</p>
          <div class="pill">{{ curso.cupo }}</div>
        </div>

        <div class="box">
          <p>Monto</p>
          <div class="pill">{{ curso.monto }} Bs</div>
        </div>
      </div>

      <div class="schedule-section">
        <div class="pill dia">{{ curso.dia }}</div>
        <div class="horarios">
          <span class="pill small">{{ curso.hora_inicio }}</span>
          <span class="pill small">{{ curso.hora_fin }}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <button class="btn" @click="$emit('view')">Ver más</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  curso: { type: Object, required: true }
})
defineEmits(["view"])
</script>

<style scoped>
.card-container {
  width: 100%;
  max-width: 350px; 
  min-width: 280px;
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  box-sizing: border-box;
  
  /* REQUISITOS PARA EL EFECTO GIRATORIO */
  position: relative;
  overflow: hidden; /* Corta lo que sobresale del giro */
  z-index: 1;
  transition: transform 0.3s ease;
}

/* El "rayo" o fondo que gira */
.card-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  /* Graduación cónica para el efecto de giro */
  background: conic-gradient(
    transparent, 
    #66c2ff, 
    transparent 70%
  );
  transition: opacity 0.3s ease;
  opacity: 0; /* Oculto por defecto */
  z-index: -2;
  animation: rotate 4s linear infinite;
}

/* El fondo interno para que el contenido no se tape */
.card-container::after {
  content: '';
  position: absolute;
  inset: 3px; /* Grosor del borde */
  background: white;
  border-radius: 10px;
  z-index: -1;
}

/* Animación de rotación */
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* HOVER */
.card-container:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15), 0 0 20px rgba(102, 194, 255, 0.4);
}

.card-container:hover::before {
  opacity: 1; /* Mostramos el giro al pasar el mouse */
}


.title {
  margin: 0;
  font-size: 1.2rem;
  line-height: 1.2;
  color: #333;
}

.codigo {
  margin: 5px 0 0;
  font-size: 0.85rem;
  color: #666;
}

.docente {
  margin: 5px 0 10px;
  font-size: 0.9rem;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-grid {
  display: flex;
  justify-content: bween;
  gap: 10px;
}

.box {
  flex: 1; /* Hace que ambas cajas crezcan por igual */
}

.box p {
  margin: 0 0 5px;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #777;
  text-align: center;
}

.pill {
  background: #f4f4f4;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 6px 12px;
  text-align: center;
  font-size: 0.9rem;
}

.schedule-section {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap; /* Permite que baje si no hay espacio */
  gap: 20px;
}

.horarios {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.small {
  font-size: 0.75rem;
  padding: 4px 10px;
  background: #e1f5fe;
  border-color: #b3e5fc;
}

.footer {
  margin-top: auto; /* Empuja el botón al fondo si la card crece */
  display: flex;
  justify-content: center;
}

.btn {
  width: 60%; /* Botón más fácil de tocar en móviles */
  background: #0c5c75;
  color: white;
  border: none;
  border-radius: 100px;
  padding: 10px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s ease;
}

.btn:hover {
  background: #08485c;
}

/* Ajustes para pantallas muy pequeñas */
@media (max-width: 320px) {
  .schedule-section {
    flex-direction: column;
    align-items: stretch;
  }
  .horarios {
    justify-content: center;
  }
}
</style>