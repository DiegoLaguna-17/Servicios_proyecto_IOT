<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="helper-container">
        <div class="user-data">
          <h2>{{ curso.nombre }}</h2>
        </div>

        <div class="close-button" @click="$emit('close')">
          ×
        </div>
      </div>

      <form>
        <div class="form-grid">

          <!-- FILA 1 -->
          <div class="field">
            <label>Código</label>
            <input :value="curso.id_materia" disabled />
          </div>

          <div class="field">
            <label>Docente</label>
            <input :value="curso.docente?.nombre || 'Sin docente'" disabled />
          </div>

          <div class="field">
            <label>Tipo</label>
            <input :value="curso.tipo || 'N/A'" disabled />
          </div>

          <div class="field">
            <label>Cupo</label>
            <input :value="curso.cupo ?? 'N/A'" disabled />
          </div>

          <!-- FILA 2 -->
          <div class="field">
            <label>Día</label>
            <input :value="curso.dia || 'N/A'" disabled />
          </div>

          <!-- FILA 3 -->
          <div class="field">
            <label>Fecha de inicio</label>
            <input :value="formatearFecha(curso.fecha_inicio)" disabled />
          </div>

          <div class="field">
            <label>Hora de inicio</label>
            <input :value="curso.hora_inicio || 'N/A'" disabled />
          </div>

          <div class="field">
            <label>Fecha fin</label>
            <input :value="formatearFecha(curso.fecha_fin)" disabled />
          </div>

          <div class="field">
            <label>Hora fin</label>
            <input :value="curso.hora_fin || 'N/A'" disabled />
          </div>

          <div
            v-if="normalizarEstado(curso.estado) === 'RETIRADO'"
            class="field"
          >
            <label>Fecha retiro</label>
            <input :value="formatearFecha(curso.fecha_retiro)" disabled />
          </div>

          <!-- MONTO -->
          <div class="field monto-field">
            <label>Monto</label>
            <input :value="curso.monto != null ? `${curso.monto} Bs` : 'N/A'" disabled />
          </div>

        </div>
      </form>

      <div class="buttons">
        <button
          v-if="normalizarEstado(curso.estado) !== 'RETIRADO'"
          type="button"
          class="btn-retirar"
          @click="$emit('retirar', curso)"
        >
          Retirar Materia
        </button>

        <button
          v-else
          type="button"
          class="btn-retirada"
          disabled
        >
          Materia retirada
        </button>

        <button
          type="button"
          class="btn-progreso"
          @click="verMiProgreso"
        >
          Ver mi progreso
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { usarCarrito } from "../../../store/carrito";
import ModalError from "../../seguridad/components/ModalError.vue";
import ModalExito from "../../seguridad/components/ModalExito.vue";
import { useRouter } from "vue-router";

const router = useRouter();

const props = defineProps({
  curso: { type: Object, required: true },
  noCumple: { type: Array, required: true }
});

const emit = defineEmits(["close", "retirar"]);

const noCumpleComputed = computed(() => {
  return Array.isArray(props.noCumple) ? props.noCumple : [];
});

const form = ref({
  nombre: "",
  cupo: "",
  dia: "",
  monto: ""
});

const formatearFecha = (fecha) => {
  if (!fecha) return "N/A";
  return fecha;
};

const normalizarEstado = (estado) => {
  if (!estado) return "";
  return String(estado).toUpperCase().trim();
};

const verMiProgreso = () => {
  router.push({
    name: "miProgreso",
    params: { id_materia: props.curso.id_materia }
  });
};
</script>
<style scoped>
/* --- Estructura Base y Overlay --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 10px; /* Margen de seguridad para móviles */
}

.modal-content {
  background-color: #f2f2f2;
  padding: 1.5rem;
  border-radius: 12px;
  width: 100%;
  max-width: 1100px;
  max-height: 95vh; /* Evita que el modal sea más alto que la pantalla */
  overflow-y: auto; /* Permite scroll si el contenido es largo */
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

/* --- Cabecera --- */
.helper-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 15px;
}

.user-data h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #333;
  line-height: 1.2;
}

.close-button {
  font-size: 32px;
  cursor: pointer;
  color: #000;
  line-height: 1;
  transition: color 0.2s;
  padding: 5px;
}

.close-button:hover {
  color: #666;
}

/* --- Grid Responsivo --- */
.form-grid {
  display: grid;
  grid-template-columns: 1fr; /* 1 columna en móvil */
  gap: 15px;
}

.field {
  display: flex;
  flex-direction: column;
}

label {
  font-size: 13px;
  margin-bottom: 5px;
  color: #555;
  font-weight: 600;
}

input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #dcdcdc;
  background: #fff;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
}

input:disabled {
  background-color: #f9f9f9;
  color: #666;
  cursor: not-allowed;
}

/* --- Botones --- */
.buttons {
  margin-top: 30px;
  display: flex;
  flex-direction: column; /* Botones apilados en móvil */
  gap: 12px;
}

.btn-retirar, .btn-retirada, .btn-progreso {
  width: 100%;
  padding: 12px 22px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  text-align: center;
}

.btn-retirar { background: #e88787; color: white; }
.btn-retirar:hover { background-color: #d96d6d; }

.btn-retirada { background: #8e8e8e; color: white; cursor: not-allowed; }

.btn-progreso { background: #5fa8a8; color: white; }
.btn-progreso:hover { background-color: #4b8f8f; }

/* --- Media Queries --- */

/* Tablet (768px en adelante) */
@media (min-width: 768px) {
  .modal-content {
    padding: 2.5rem;
    width: 90%;
  }

  .form-grid {
    grid-template-columns: repeat(2, 1fr); /* 2 columnas */
    gap: 20px;
  }

  .buttons {
    flex-direction: row; /* Botones lado a lado */
    justify-content: flex-end;
  }

  .btn-retirar, .btn-retirada, .btn-progreso {
    width: auto; /* Ancho natural del texto */
  }
}

/* Desktop (1024px en adelante) */
@media (min-width: 1024px) {
  .form-grid {
    grid-template-columns: repeat(4, 1fr); /* 4 columnas originales */
    gap: 25px 30px;
  }

  /* Ajustes específicos para campos que quieras destacar */
  .monto-field {
    grid-column: span 1;
  }
}
</style>