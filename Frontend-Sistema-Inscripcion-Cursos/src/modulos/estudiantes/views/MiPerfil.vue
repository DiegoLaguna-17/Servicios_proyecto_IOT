<template>
  <div class="perfil-container">
    <h1>Panel de Estudiante</h1>

    <section class="card shadow-sm">
      <div class="card-header">Mis Datos Académicos</div>
      <div class="datos-grid" v-if="estudiante">
        <div class="info-group">
          <p><b>Nombre completo:</b> {{ estudiante.nombre }}</p>
          <p><b>Cédula de Identidad:</b> {{ estudiante.ci }}</p>
          <p><b>Correo institucional:</b> {{ estudiante.correo }}</p>
        </div>
        <div class="info-group">
          <p><b>Carrera:</b> {{ estudiante.carrera || 'No definida' }}</p>
          <p><b>Teléfono:</b> {{ estudiante.telefono }}</p>
          <p><b>Ubicación:</b> {{ estudiante.direccion }}</p>
        </div>
      </div>
    </section>

    <section class="card shadow-sm">
      <div class="card-header">Mi Horario Semanal</div>
      
      <div class="horario-layout">
        
        <aside class="materias-sidebar">
          <h3>Mis Materias</h3>
          <div v-if="materiasUnicas.length === 0" class="no-data">Cargando...</div>
          <div 
            v-for="m in materiasUnicas" 
            :key="m.id_materia" 
            class="materia-item"
          >
            <span class="dot"></span>
            <div>
              <div class="m-code">{{ m.id_materia }}</div>
              <div class="m-name">{{ m.nombre }}</div>
            </div>
          </div>
        </aside>

        <div class="grid-wrapper">
          <div class="grid-container">
            <div class="grid-header-cell time-col">Hora</div>
            <div v-for="dia in dias" :key="dia" class="grid-header-cell">
              {{ dia }}
            </div>
            <div 
              v-for="hora in etiquetasHoras" 
              :key="hora" 
              class="hora-label"
              :style="{ gridRowStart: getRowIndex(hora) }"
            >
              {{ hora }}
            </div>

            <div
              v-for="(clase, index) in horario"
              :key="index"
              class="clase-bloque"
              :style="posicionarClase(clase)"
              @click="abrirDetalle(clase)"
            >
              <div class="clase-mini-info">
                <span class="clase-id">{{ clase.id_materia }}</span>
                <span class="clase-aula">Aula: {{ clase.aula }}</span>
              </div>
            </div>

            <div v-for="n in 6" :key="'line-'+n" class="vertical-line" :style="{ gridColumn: n + 1 }"></div>
          </div>
        </div>
      </div>
    </section>

    <Transition name="bounce">
      <div v-if="modalActivo" class="modal-overlay" @click.self="cerrarModal">
        <div class="modal-box">
          <div class="modal-banner">
            <h2>Información de la Clase</h2>
            <button @click="cerrarModal" class="close-x">&times;</button>
          </div>
          <div class="modal-body" v-if="seleccion">
            <div class="detail-row">
              <span class="label">Materia:</span>
              <span class="value">{{ seleccion.nombre }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Código:</span>
              <span class="value">{{ seleccion.id_materia }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Horario:</span>
              <span class="value highlight">
                {{ seleccion.dia }} | {{ seleccion.hora_inicio.substring(0,5) }} - {{ seleccion.hora_fin.substring(0,5) }}
              </span>
            </div>
            <div class="detail-row">
              <span class="label">Ubicación:</span>
              <span class="value">📍 {{ seleccion.aula }}</span>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="cerrarModal" class="btn-primary">Cerrar</button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { miPerfil } from "../services/estudianteService"

//ESTADOS
const estudiante = ref(null)
const materias = ref([])
const horario = ref([])
const modalActivo = ref(false)
const seleccion = ref(null)

const dias = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sábado"]

// CONFIGURACIÓN (Precisión de 15 minutos)
const START_MIN = 7 * 60; // 07:00
const END_MIN = 21 * 60;  // 21:00
const STEP = 15;          // Intervalo de filas

// --- FIX DEL BUG DE LA LISTA ---
// Filtramos las materias para que no se repitan por nombre/ID en el sidebar
const materiasUnicas = computed(() => {
  const ids = new Set();
  return materias.value.filter(m => {
    if (!ids.has(m.id_materia)) {
      ids.add(m.id_materia);
      return true;
    }
    return false;
  });
});

onMounted(async () => {
  try {
    const res = await miPerfil();
    if (res.data.success) {
      estudiante.value = res.data.data.estudiante;
      materias.value = res.data.data.materias_inscritas;
      horario.value = res.data.data.horario;
    }
  } catch (e) { console.error("Error API:", e); }
});

// LÓGICA DE TIEMPO
const toMin = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const etiquetasHoras = computed(() => {
  const list = [];
  for (let t = START_MIN; t <= END_MIN; t += 60) {
    const h = Math.floor(t / 60).toString().padStart(2, '0');
    list.push(`${h}:00`);
  }
  return list;
});

const getRowIndex = (horaStr) => Math.floor((toMin(horaStr) - START_MIN) / STEP) + 2;

const posicionarClase = (c) => {
  const dIdx = dias.indexOf(c.dia);
  if (dIdx === -1) return { display: 'none' };
  
  return {
    gridRowStart: Math.floor((toMin(c.hora_inicio) - START_MIN) / STEP) + 2,
    gridRowEnd: Math.floor((toMin(c.hora_fin) - START_MIN) / STEP) + 2,
    gridColumnStart: dIdx + 2
  };
};

// ACCIONES MODAL
const abrirDetalle = (clase) => {
  seleccion.value = clase;
  modalActivo.value = true;
};

const cerrarModal = () => {
  modalActivo.value = false;
  setTimeout(() => { seleccion.value = null; }, 300);
};
</script>

<style scoped>
/* GENERAL */
.perfil-container { padding: 40px; background: #f4f7f6; min-height: 100vh; color: #2c3e50; }
h1 { margin-bottom: 30px; font-weight: 700; color: #0b0b6f; }

/* CARDS */
.card { background: white; border-radius: 15px; margin-bottom: 30px; border: none; overflow: hidden; }
.shadow-sm { box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
.card-header { background: #0b0b6f; color: white; padding: 20px 25px; font-size: 1.2rem; font-weight: 600; }

.datos-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); padding: 25px; gap: 20px; }
.info-group p { margin: 12px 0; font-size: 1rem; }

/* LAYOUT HORARIO */
.horario-layout { display: flex; padding: 25px; gap: 25px; }

/* SIDEBAR REVISADO */
.materias-sidebar { width: 220px; border-right: 1px solid #eee; padding-right: 15px; }
.materias-sidebar h3 { font-size: 0.9rem; text-transform: uppercase; color: #95a5a6; letter-spacing: 1px; margin-bottom: 20px; }
.materia-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 15px; padding: 10px; border-radius: 8px; background: #f9fbfb; transition: 0.3s; }
.materia-item:hover { background: #edf2f2; }
.dot { width: 8px; height: 8px; background: #8cc4c8; border-radius: 50%; margin-top: 5px; }
.m-code { font-weight: 800; font-size: 0.8rem; color: #0b0b6f; }
.m-name { font-size: 0.85rem; line-height: 1.2; }

/* GRID CORE */
.grid-wrapper { flex: 1; overflow-x: auto; }
.grid-container { 
  display: grid; 
  grid-template-columns: 70px repeat(6, 1fr); 
  grid-template-rows: 50px repeat(auto-fill, 12px); /* Fila pequeña para precisión */
  border: 1px solid #e0e0e0;
  min-width: 800px;
}

.grid-header-cell { background: #f8f9fa; border-bottom: 2px solid #0b0b6f; display: flex; align-items: center; justify-content: center; font-weight: 700; grid-row: 1; }
.hora-label {
  grid-column: 1;
  font-size: 0.7rem;
  color: #999;
  font-weight: bold;

  display: flex;
  align-items: flex-start;
  justify-content: center;

  padding-top: 2px;
}

/* Asegúrate de que el header tenga prioridad visual */
.grid-header-cell {
  z-index: 20;
  position: relative;
  background: #f8f9fa; /* Color sólido para que no se transparente nada debajo */
}
.clase-bloque { 
  background: #8cc4c8; 
  border-left: 5px solid #0b0b6f; 
  margin: 1px; 
  border-radius: 5px; 
  cursor: pointer; 
  transition: all 0.2s; 
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.clase-bloque:hover { filter: saturate(1.5); transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.15); }

.clase-mini-info { height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 5px; text-align: center; }
.clase-id { font-weight: bold; font-size: 0.75rem; color: #0b0b6f; }
.clase-aula { font-size: 0.65rem; color: #444; }

.vertical-line { grid-row: 2 / -1; border-right: 1px solid #f0f0f0; pointer-events: none; }

/* MODAL STYLES */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(11, 11, 111, 0.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 9999; }
.modal-box { background: white; width: 90%; max-width: 450px; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.3); }
.modal-banner { background: #0b0b6f; color: white; padding: 20px 25px; display: flex; justify-content: space-between; align-items: center; }
.modal-banner h2 { margin: 0; font-size: 1.3rem; }
.close-x { background: none; border: none; color: white; font-size: 2rem; cursor: pointer; }

.modal-body { padding: 30px; }
.detail-row { display: flex; flex-direction: column; margin-bottom: 15px; }
.label { font-size: 0.8rem; color: #95a5a6; text-transform: uppercase; font-weight: bold; }
.value { font-size: 1.1rem; color: #2c3e50; font-weight: 500; }
.highlight { color: #0b0b6f; font-weight: 700; }

.modal-footer { padding: 20px; text-align: right; background: #f8f9fa; }
.btn-primary { background: #0b0b6f; color: white; border: none; padding: 12px 30px; border-radius: 10px; cursor: pointer; font-weight: 600; transition: 0.3s; }
.btn-primary:hover { background: #1a1a8f; transform: scale(1.05); }

/* ANIMACIONES */
.bounce-enter-active { animation: bounce-in 0.5s; }
.bounce-leave-active { animation: bounce-in 0.3s reverse; }
@keyframes bounce-in {
  0% { transform: scale(0.7); opacity: 0; }
  60% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); }
}

@media (max-width: 768px) {
  .horario-layout { flex-direction: column; }
  .materias-sidebar { width: 100%; border-right: none; border-bottom: 1px solid #eee; margin-bottom: 20px; }
}
</style>