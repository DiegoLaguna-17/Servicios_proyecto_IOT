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

          <div class="field">
            <label>Código</label>
            <input :value="curso.id_materia" disabled />
          </div>

          <div class="field">
            <label>Docente</label>
            <input :value="curso.docente?.nombre" disabled />
          </div>

          <div class="field">
            <label>Tipo</label>
            <input :value="curso.tipo" disabled />
          </div>

          <div class="field">
            <label>Cupo</label>
            <input :value="curso.cupo" disabled />
          </div>

          <div class="field">
            <label>Inscritos</label>
            <input :value="curso.inscritos" disabled />
          </div>

          <div class="field">
            <label>Día</label>
            <input :value="curso.dia" disabled />
          </div>

          <div
            class="field requisitos"
            v-if="Array.isArray(curso.requisitos) && curso.requisitos.length"
          >
            <label>Requisitos</label>
            <div class="req-container">
              <input 
                v-for="req in curso.requisitos"
                :key="req.id_materia"
                :value="req.nombre"
                disabled
                :class="{
                  'input-error': noCumpleComputed.includes(req.id_materia),
                  'input-success': !noCumpleComputed.includes(req.id_materia)
                }"
              />
            </div>
          </div>

          <div class="field">
            <label>Fecha de inicio</label>
            <input :value="curso.fecha_inicio" disabled />
          </div>

          <div class="field">
            <label>Hora de inicio</label>
            <input :value="curso.hora_inicio" disabled />
          </div>

          <div class="field">
            <label>Fecha fin</label>
            <input :value="curso.fecha_fin" disabled />
          </div>

          <div class="field">
            <label>Hora fin</label>
            <input :value="curso.hora_fin" disabled />
          </div>

          <div class="field monto-field">
            <label>Monto</label>
            <input :value="curso.monto + ' Bs'" disabled />
          </div>

        </div>
      </form>

      <div
        v-if="motivosBloqueoComputed.length > 0"
        class="bloqueos-container"
      >
        <p class="bloqueos-title">No puedes inscribirte por lo siguiente:</p>
        <ul class="bloqueos-list">
          <li v-for="(motivo, index) in motivosBloqueoComputed" :key="index">
            {{ motivo }}
          </li>
        </ul>
      </div>

      <button 
        type="button" 
        class="btn-submit" 
        @click="agregarAlCarrito" 
        :disabled="botonDeshabilitado"
      >
        {{ textoBoton }}
      </button>
    </div>
  </div>

  <ModalError
    :message="mensajeModal"
    :visible="mostrarError"
    @close="mostrarError = false"
  />
  <ModalExito
    :message="mensajeModal"
    :visible="mostrarExito"
    @close="mostrarExito = false"
  />
</template>

<script setup>
import { computed, ref } from "vue";
import { usarCarrito } from "../../../store/carrito";
import ModalError from "../../seguridad/components/ModalError.vue";
import ModalExito from "../../seguridad/components/ModalExito.vue";

const carrito = usarCarrito();
const mensajeModal = ref("");
const mostrarExito = ref(false);
const mostrarError = ref(false);

const props = defineProps({ 
  curso: { type: Object, required: true },
  noCumple: { type: Array, required: true },
  motivosBloqueo: { type: Array, default: () => [] },
  puedeInscribirse: { type: Boolean, default: true }
});

const emit = defineEmits(["close", "save"]);

const noCumpleComputed = computed(() => {
  return Array.isArray(props.noCumple) ? props.noCumple : [];
});

const motivosBloqueoComputed = computed(() => {
  return Array.isArray(props.motivosBloqueo) ? props.motivosBloqueo : [];
});

const yaEnCarrito = computed(() => {
  return carrito.cursos.some(
    c => c.id_materia === props.curso.id_materia
  );
});

const tieneRequisitosIncumplidos = computed(() => {
  return noCumpleComputed.value.length > 0;
});

const tieneBloqueos = computed(() => {
  return motivosBloqueoComputed.value.length > 0 || props.puedeInscribirse === false;
});

const botonDeshabilitado = computed(() => {
  return yaEnCarrito.value || tieneRequisitosIncumplidos.value || tieneBloqueos.value;
});

const textoBoton = computed(() => {
  if (yaEnCarrito.value) return "Ya agregado";
  if (tieneBloqueos.value) return "No disponible";
  if (tieneRequisitosIncumplidos.value) return "No se cumplen los requisitos";
  return "Agregar al carrito";
});

const agregarAlCarrito = () => {
  if (tieneBloqueos.value) {
    mensajeModal.value = motivosBloqueoComputed.value.length > 0
      ? motivosBloqueoComputed.value.join(" | ")
      : "No puedes inscribirte en esta materia";
    mostrarError.value = true;
    return;
  }

  if (tieneRequisitosIncumplidos.value) {
    mensajeModal.value = "No puedes agregar este curso porque no cumple los requisitos";
    mostrarError.value = true;
    return;
  }

  const resultado = carrito.agregarCurso(props.curso);

  mensajeModal.value = resultado.mensaje;

  if (resultado.exito) {
    mostrarExito.value = true;

    setTimeout(() => {
      emit("close");
    }, 3000);
  } else {
    mostrarError.value = true;
  }
};
</script>
<style scoped>
/* --- 1. Estructura Base y Overlay --- */
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
  padding: 15px; /* Espacio de seguridad para móviles */
}

.modal-content {
  background-color: #f2f2f2;
  padding: 1.5rem;
  border-radius: 12px;
  width: 100%;
  max-width: 1100px;
  max-height: 90vh; /* Evita que el modal sea más alto que la pantalla */
  overflow-y: auto; /* Scroll interno si hay mucho contenido */
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

/* --- 2. Cabecera del Modal --- */
.helper-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.user-data {
  flex: 1;
}

.user-data h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #333;
}

.close-button {
  font-size: 32px;
  cursor: pointer;
  color: #000;
  line-height: 0.8;
  padding: 5px;
  transition: color 0.2s;
}

.close-button:hover {
  color: #666;
}

/* --- 3. Formulario y Grid --- */
.form-grid {
  display: grid;
  grid-template-columns: 1fr; /* Una sola columna en móvil */
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
}

input:focus {
  border-color: #5fa8a8;
  outline: none;
}

input:disabled {
  background-color: #f9f9f9;
  cursor: not-allowed;
}

/* --- 4. Requisitos y Estados --- */
.req-container {
  display: flex;
  flex-wrap: wrap; /* Para que los inputs de requisitos bajen de línea */
  gap: 10px;
}

.req-container input {
  flex: 1 1 140px; /* Tamaño mínimo flexible */
}

.input-error {
  background-color: #ffadad !important;
  border-color: #e57373;
}

.input-success {
  background-color: #b2ffb2 !important;
  border-color: #81c784;
}

/* --- 5. Contenedor de Bloqueos --- */
.bloqueos-container {
  margin-top: 20px;
  padding: 14px 16px;
  border-radius: 10px;
  background: #ffe3e3;
  border: 1px solid #f0a7a7;
}

.bloqueos-title {
  margin: 0 0 8px 0;
  font-weight: 700;
  color: #8a1f1f;
  font-size: 14px;
}

.bloqueos-list {
  margin: 0;
  padding-left: 20px;
  color: #7a2323;
  font-size: 13px;
}

/* --- 6. Botones --- */
.btn-submit {
  width: 100%; /* Botón grande en móvil */
  cursor: pointer;
  background: #5fa8a8;
  border: none;
  padding: 14px 22px;
  border-radius: 8px;
  color: white;
  margin-top: 24px;
  font-weight: bold;
  transition: background 0.3s;
}

.btn-submit:hover:not(:disabled) {
  background: #4d8a8a;
}

.btn-submit:disabled {
  background: #405656;
  cursor: not-allowed;
  opacity: 0.8;
}

/* --- 7. Media Queries (Adaptabilidad) --- */

/* Tablets en adelante (768px) */
@media (min-width: 768px) {
  .modal-content {
    padding: 2.5rem;
    width: 90%;
  }

  .form-grid {
    grid-template-columns: repeat(2, 1fr); /* 2 columnas */
    gap: 20px;
  }

  .requisitos {
    grid-column: span 2;
  }

  .btn-submit {
    width: auto; /* El botón vuelve a su tamaño real */
    min-width: 200px;
    display: block;
    margin: 24px auto 0 auto;
  }
}

/* Desktop (1024px en adelante) */
@media (min-width: 1024px) {
  .form-grid {
    grid-template-columns: repeat(4, 1fr); /* 4 columnas originales */
    gap: 25px 35px;
  }

  .requisitos {
    grid-column: span 3;
  }

  .monto-field {
    grid-column: 4;
  }

  .user-data h2 {
    font-size: 1.8rem;
  }
}
</style>