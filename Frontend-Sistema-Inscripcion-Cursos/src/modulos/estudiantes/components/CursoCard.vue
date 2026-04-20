<template>
  <div class="card-container">
    <div class="header">
      <h2 class="title">{{ curso.nombre }}</h2>
      <p class="codigo">Código materia</p>
      <p class="codigo-value">{{ curso.id_materia }}</p>
      <p class="docente">Docente</p>
      <p class="docente-value">{{ curso.docente?.nombre || 'Sin docente' }}</p>
    </div>

    <div class="content">
      <div class="info-grid"></div>

      <div class="schedule-section">
        <div class="pill dia">{{ curso.dia || 'Día' }}</div>
        <div class="horarios">
          <span class="pill small">{{ curso.hora_inicio || 'Hora inicio' }}</span>
          <span class="pill small">{{ curso.hora_fin || 'Hora fin' }}</span>
        </div>
      </div>

      <span class="estado-pill" :class="estadoClass">
        {{ estadoLabel }}
      </span>

      <div
        v-if="normalizarEstado(curso.estado) === 'RETIRADO'"
        class="retiro-info"
      >
        <span class="retiro-label">Fecha de retiro:</span>
        <span class="retiro-value">{{ formatearFecha(curso.fecha_retiro) }}</span>
      </div>
    </div>

    <div class="footer">
      <button class="btn" @click="$emit('view')">Ver más</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  curso: { type: Object, required: true }
})

defineEmits(["view"])

const normalizarEstado = (estado) => {
  if (!estado) return ""
  return String(estado).toUpperCase().trim()
}

const formatearFecha = (fecha) => {
  if (!fecha) return "N/A"
  return fecha
}

const estadoLabel = computed(() => {
  const estado = normalizarEstado(props.curso.estado)

  if (estado === 'INSCRITO') return 'Inscrito'
  if (estado === 'PENDIENTE_PAGO') return 'Pago Pendiente'
  if (estado === 'RETIRADO') return 'Retirado'

  return props.curso.estado || 'Sin estado'
})

const estadoClass = computed(() => {
  const estado = normalizarEstado(props.curso.estado)

  if (estado === 'INSCRITO') return 'estado-inscrito'
  if (estado === 'PENDIENTE_PAGO') return 'estado-pendiente'
  if (estado === 'RETIRADO') return 'estado-retirado'

  return ''
})
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
  position: relative;
  overflow: hidden;
  z-index: 1;
  transition: transform 0.3s ease;
}

.card-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    transparent,
    #66c2ff,
    transparent 70%
  );
  transition: opacity 0.3s ease;
  opacity: 0;
  z-index: -2;
  animation: rotate 4s linear infinite;
}

.card-container::after {
  content: '';
  position: absolute;
  inset: 3px;
  background: white;
  border-radius: 10px;
  z-index: -1;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.card-container:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15), 0 0 20px rgba(102, 194, 255, 0.4);
}

.card-container:hover::before {
  opacity: 1;
}

.title {
  margin: 0;
  font-size: 1.2rem;
  line-height: 1.2;
  color: #333;
}

.codigo,
.docente {
  margin: 5px 0 0;
  font-size: 0.85rem;
  color: #777;
}

.codigo-value,
.docente-value {
  margin: 0;
  font-size: 0.9rem;
  color: #444;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.info-grid {
  display: flex;
  justify-content: space-between;
  gap: 10px;
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
  flex-wrap: wrap;
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

.estado-pill {
  border-radius: 20px;
  padding: 7px 12px;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 700;
}

.estado-inscrito {
  background: #c7d98d;
  color: #44561f;
  border: none;
}

.estado-pendiente {
  background: #bfbfbf;
  color: #303030;
  border: none;
}

.estado-retirado {
  background: #eb8f95;
  color: #5a1116;
  border: none;
}

.retiro-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: -4px;
}

.retiro-label {
  font-size: 0.8rem;
  color: #8a8a8a;
}

.retiro-value {
  font-size: 0.82rem;
  color: #666;
}

.footer {
  margin-top: auto;
  display: flex;
  justify-content: center;
}

.btn {
  width: 60%;
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