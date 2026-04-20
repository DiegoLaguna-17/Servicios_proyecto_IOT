<template>
  <div class="info-curso-container">
    <div class="header">
      <button class="back-button" @click="volver">
        <span class="back-arrow">←</span> Volver
      </button>
      <h2>Información de la Materia</h2>
      <p class="subtitle">Aquí puedes ver la lista de estudiantes y los pagos relacionados</p>
    </div>
    <!-- Información del curso -->
    <div v-if="cursoInfo" class="curso-header">
      <h3>{{ cursoInfo.nombre }} <br><span class="curso-id">[{{ cursoInfo.id_materia }}]</span></h3>
    </div>

    <!-- Resumen de pagos -->
    <div v-if="resumen" class="resumen-cards">
      <div class="resumen-card">
        <div class="resumen-info">
          <span class="resumen-label">Inscritos</span>
          <span class="resumen-value">{{ resumen.inscritos }}</span>
        </div>
      </div>
      <div class="resumen-card">
        <div class="resumen-info">
          <span class="resumen-label">Cupos restantes</span>
          <span class="resumen-value">{{ resumen.cupos_restantes }}</span>
        </div>
      </div>
      <div class="resumen-card">
        <div class="resumen-info">
          <span class="resumen-label">Recaudado</span>
          <span class="resumen-value">{{ formatCurrency(resumen.recaudado) }}</span>
        </div>
      </div>
    </div>

    <!-- Tabla de estudiantes -->
    <div class="table-container" v-if="estudiantes.length > 0">
      <table class="estudiantes-table">
        <thead>
          <tr>
            <th>Nombre Completo</th>
            <th>Estado materia</th>
            <th>Estado académico</th>
            <th>Fecha retiro</th>
            <th>Monto pagado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(estudiante, index) in estudiantes" :key="index">
            <td>{{ estudiante.nombre_completo }}</td>
            <td>
              <span :class="getEstadoMateriaClass(estudiante.estado_materia)">
                {{ estudiante.estado_materia }}
              </span>
            </td>
            <td>{{ estudiante.estado_academico || '-' }}</td>
            <td>{{ estudiante.fecha_retiro || '-' }}</td>
            <td :class="{ 'monto-pagado': estudiante.monto_pagado > 0 }">
              {{ formatCurrency(estudiante.monto_pagado) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-else-if="cargando" class="loading-message">
      Cargando información...
    </div>
    
    <div v-else class="no-data-message">
      No hay estudiantes inscritos en este curso
    </div>

    <!-- Modales de error/éxito -->
    <ModalError
      :message="errorMessage"
      :visible="showErrorModal"
      @close="showErrorModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import ModalError from "../../seguridad/components/ModalError.vue";
import { 
  obtenerEstudiantesPagosCurso, 
  obtenerResumenPagosCurso 
} from "../servicios/cursosService";

const route = useRoute();
const router = useRouter();

const cursoInfo = ref(null);
const estudiantes = ref([]);
const resumen = ref(null);
const cargando = ref(true);
const showErrorModal = ref(false);
const errorMessage = ref("");

// Obtener el ID del curso de la URL
const cursoId = route.params.id;

// Función para volver a la lista de cursos
const volver = () => {
  router.push('/administrador/listarCursos');
};

// Formatear moneda
const formatCurrency = (value) => {
  if (value === undefined || value === null) return '$0';
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Clases CSS según el estado de la materia
const getEstadoMateriaClass = (estado) => {
  switch(estado) {
    case 'INSCRITO':
      return 'estado-inscrito';
    case 'PENDIENTE_PAGO':
      return 'estado-pendiente';
    case 'RETIRADO':
      return 'estado-retirado';
    default:
      return '';
  }
};

// Cargar datos al montar el componente
onMounted(async () => {
  cargando.value = true;
  
  try {
    // Cargar estudiantes y pagos
    const estudiantesResponse = await obtenerEstudiantesPagosCurso(cursoId);
    if (estudiantesResponse.exito) {
      cursoInfo.value = estudiantesResponse.data.curso;
      estudiantes.value = estudiantesResponse.data.estudiantes || [];
    } else {
      errorMessage.value = estudiantesResponse.mensaje || "Error al cargar estudiantes";
      showErrorModal.value = true;
    }

    // Cargar resumen de pagos
    const resumenResponse = await obtenerResumenPagosCurso(cursoId);
    if (resumenResponse.exito) {
      resumen.value = resumenResponse.data.resumen;
    }
  } catch (error) {
    console.error("Error cargando datos:", error);
    errorMessage.value = "Error al cargar la información del curso";
    showErrorModal.value = true;
  } finally {
    cargando.value = false;
  }
});
</script>

<style scoped>
.info-curso-container {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header {
  margin-bottom: 30px;
}

.back-button {
  background-color: #1d4879;
  border: 10px solid #250584;
  border-radius: 30px;
  color: #ffffff;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 0;
  font-weight: 500;
  padding: 10px 20px;
}

.back-button:hover {
  background-color: #336aaa;
}

.back-arrow {
  font-size: 20px;
}

h2 {
  margin: 10px 0 5px 0;
  color: #333;
}

.subtitle {
  color: #666;
  margin-top: 0;
}

.curso-header {
  background-color: white;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.curso-header h3 {
  margin: 0;
  color: #333;
  font-size: 2rem;
  text-align: center;
}

.curso-id {
  color: #999;
  font-size: 0.9rem;
  font-weight: normal;
  margin-left: 10px;
}

/* Cards de resumen */
.resumen-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.resumen-card {
  background-color: rgb(173, 215, 222);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.resumen-icon {
  font-size: 32px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f7ba0020;
  border-radius: 50%;
}

.resumen-info {
  display: flex;
  flex-direction: column;
  text-align: center;
}

.resumen-label {
  color: #000000;
  font-size: 20px;
  text-align: center;
}

.resumen-value {
  color: #333;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
}

/* Tabla */
.table-container {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow-x: auto;
}

.estudiantes-table {
  width: 100%;
  border-collapse: collapse;
}

.estudiantes-table th {
  text-align: center;
  padding: 12px;
  background-color: #f8f9fa;
  color: #333;
  font-weight: 600;
  border: 2px solid #2f8eb0;
}

.estudiantes-table td {
  padding: 12px;
  border: 1px solid #3872ab;
  color: #555;
  text-align: center;
}

.estudiantes-table tbody tr:hover {
  background-color: #f8f9fa;
}

/* Estados de materia */
.estado-inscrito {
  background-color: #d4edda;
  color: #155724;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.estado-pendiente {
  background-color: #fff3cd;
  color: #856404;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.estado-retirado {
  background-color: #f8d7da;
  color: #721c24;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.monto-pagado {
  color: #28a745;
  font-weight: 500;
}

.loading-message,
.no-data-message {
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  color: #666;
  font-size: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .resumen-cards {
    grid-template-columns: 1fr;
  }
  
  .estudiantes-table {
    font-size: 14px;
  }
  
  .estudiantes-table th,
  .estudiantes-table td {
    padding: 8px;
  }
}
</style>