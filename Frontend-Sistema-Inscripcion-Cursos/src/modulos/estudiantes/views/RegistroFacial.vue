<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { registrarRostro } from '../services/facial';

const router = useRouter();

const ciEstudiante = ref('');
const archivosSeleccionados = ref([]);
const previewUrls = ref([]);
const isSubmitting = ref(false);

const MIN_FOTOS = 5;

onMounted(() => {
  const ciGuardado = localStorage.getItem('ci');
  if (!ciGuardado) {
    Swal.fire({
      icon: 'error',
      title: 'No Autorizado',
      text: 'No se encontró tu Cédula de Identidad en la sesión.',
    }).then(() => {
      router.push('/estudiante/miPerfil');
    });
    return;
  }
  ciEstudiante.value = ciGuardado;
});

// Liberar memoria
onBeforeUnmount(() => {
  previewUrls.value.forEach(url => URL.revokeObjectURL(url));
});

const onArchivosSeleccionados = (event) => {
  const files = Array.from(event.target.files);
  if (!files.length) return;

  files.forEach(file => {
    archivosSeleccionados.value.push(file);
    previewUrls.value.push(URL.createObjectURL(file));
  });

  event.target.value = '';
};

const eliminarFoto = (index) => {
  URL.revokeObjectURL(previewUrls.value[index]);
  archivosSeleccionados.value.splice(index, 1);
  previewUrls.value.splice(index, 1);
};

const limpiarTodo = () => {
  previewUrls.value.forEach(url => URL.revokeObjectURL(url));
  archivosSeleccionados.value = [];
  previewUrls.value = [];
};

const enviarRegistro = async () => {
  if (archivosSeleccionados.value.length < MIN_FOTOS) {
    Swal.fire({
      icon: 'warning',
      title: 'Atención',
      text: `Debes seleccionar al menos ${MIN_FOTOS} fotografías.`
    });
    return;
  }

  isSubmitting.value = true;

  Swal.fire({
    title: 'Enviando...',
    text: 'Procesando imágenes y generando vector facial...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    const res = await registrarRostro(
      ciEstudiante.value,
      archivosSeleccionados.value
    );

    console.log('RESPUESTA BACKEND:', res);

    // ✅ Backend correcto devuelve message
    if (res.success && res.data?.message) {
      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: res.message
      }).then(() => {
        limpiarTodo();
        router.push('/estudiante/miPerfil');
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Respuesta inesperada del servidor'
      });
    }

  } catch (error) {
    console.error('ERROR COMPLETO:', error);

    let mensaje = 'Error de red o servidor';

    if (error.response) {
      // 🔥 Manejo de FastAPI (422, 400, etc)
      if (error.response.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          mensaje = error.response.data.detail
            .map(e => e.msg)
            .join(', ');
        } else {
          mensaje = error.response.data.detail;
        }
      }
    }

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje
    });

  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="registro-facial-container">
    <div class="card shadow">
      <div class="card-header text-center">
        <h2>Registro de Rostro</h2>
        <p class="subtitle">Sube al menos {{ MIN_FOTOS }} fotografías tuyas con buena iluminación</p>
      </div>
      
      <div class="card-body">
        
        <div class="info-alert">
          <p><strong>Cédula de Identidad asignada:</strong> {{ ciEstudiante }}</p>
          <p class="small-text">Este CI se asociará automáticamente a tu registro biométrico.</p>
        </div>

        <div class="upload-section">
          <input 
            type="file" 
            id="fileInput" 
            multiple 
            accept="image/*"
            @change="onArchivosSeleccionados" 
            class="d-none"
          />
          <label for="fileInput" class="btn btn-upload">
            <span class="icon">📁</span> Seleccionar Fotografías
          </label>
          <p class="contador">
            Imágenes seleccionadas: <strong>{{ archivosSeleccionados.length }}</strong>
          </p>
        </div>

        <div class="preview-grid" v-if="previewUrls.length > 0">
          <div v-for="(url, idx) in previewUrls" :key="idx" class="preview-item">
            <img :src="url" alt="Preview" />
            <button @click="eliminarFoto(idx)" class="btn-delete" title="Eliminar foto">
              &times;
            </button>
          </div>
        </div>

      </div>

      <div class="card-footer">
        <button 
          @click="router.push('/estudiante/miPerfil')" 
          class="btn btn-secondary"
          :disabled="isSubmitting"
        >
          Cancelar
        </button>
        <button 
          @click="enviarRegistro" 
          class="btn btn-primary"
          :disabled="isSubmitting || archivosSeleccionados.length < MIN_FOTOS"
        >
          {{ isSubmitting ? 'Procesando...' : 'Registrar Rostro' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.registro-facial-container {
  padding: 40px;
  background: #f4f7f6;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.card {
  background: white;
  border-radius: 15px;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  overflow: hidden;
}

.card-header {
  background: #0b0b6f;
  color: white;
  padding: 30px 25px;
}

.card-header h2 {
  margin: 0 0 10px 0;
  font-weight: 700;
}

.subtitle {
  margin: 0;
  opacity: 0.8;
  font-size: 0.95rem;
}

.card-body {
  padding: 30px;
}

.info-alert {
  background: #e3f2fd;
  color: #0b0b6f;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 25px;
  border-left: 4px solid #0b0b6f;
}

.info-alert p {
  margin: 5px 0;
}

.small-text {
  font-size: 0.85rem;
  opacity: 0.8;
}

.upload-section {
  text-align: center;
  margin-bottom: 30px;
}

.d-none {
  display: none;
}

.btn {
  padding: 12px 25px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-upload {
  background: #8cc4c8;
  color: #0b0b6f;
  display: inline-block;
  font-size: 1.1rem;
}
.btn-upload:hover {
  background: #7bb5b9;
  transform: translateY(-2px);
}

.contador {
  margin-top: 15px;
  color: #666;
}

/* Grilla de Previsualización */
.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  border: 1px dashed #ccc;
}

.preview-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1; /* Cuadrado perfecto */
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-delete {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 0, 0, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.2s;
}

.btn-delete:hover {
  background: red;
  transform: scale(1.1);
}

.card-footer {
  padding: 20px 30px;
  background: #f8f9fa;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  border-top: 1px solid #eee;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}
.btn-secondary:hover:not(:disabled) {
  background: #d0d0d0;
}

.btn-primary {
  background: #0b0b6f;
  color: white;
}
.btn-primary:hover:not(:disabled) {
  background: #1a1a8f;
  transform: scale(1.05);
}
</style>
