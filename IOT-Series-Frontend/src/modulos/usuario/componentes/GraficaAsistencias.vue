<template>
  <div class="dashboard-container">
    <h1 class="title">Panel de control</h1>

    <div class="chart-card">
      <h3>Detección de estudiante</h3>
      <Chart v-if="chartDataEstudiante" type="line" :data="chartDataEstudiante" :options="optionsEstudiante" />
    </div>

    <div class="chart-card">
      <h3>Detección de movimiento</h3>
      <Chart v-if="chartDataMovimiento" type="line" :data="chartDataMovimiento" :options="optionsBinarias" />
    </div>

    <div class="chart-card">
      <h3>Asistencia total por fecha</h3>
      <Chart v-if="chartDataFechas" type="line" :data="chartDataFechas" :options="optionsTotales" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";
import { Chart } from "vue-chartjs";
import { io } from "socket.io-client";
import { obtenerAsistencias } from "@/services/AsistenciaService"; // Ajusta tu ruta

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

// --- ESTADOS REACTIVOS ---
const asistenciasCrudas = ref([]);
const chartDataEstudiante = ref(null);
const chartDataMovimiento = ref(null);
const chartDataFechas = ref(null);
let socket = null;

// --- CONFIGURACIÓN DE GRÁFICAS ---

// NUEVA: Configuración específica para el Estudiante (0, 1, 2)
const optionsEstudiante = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { 
      min: 0, 
      max: 2, 
      ticks: { 
        stepSize: 1,
        // Convertimos los números en etiquetas legibles en el eje Y
        callback: function(value) {
          if (value === 0) return 'Sin cara / Fake (0)';
          if (value === 1) return 'Desconocido (1)';
          if (value === 2) return 'Reconocido (2)';
          return value;
        }
      } 
    },
    x: { title: { display: true, text: "Eventos (T)" } }
  }
};

// Para gráfica de movimiento (0 y 1)
const optionsBinarias = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { 
        min: 0, 
        max: 1, 
        ticks: { 
            stepSize: 1,
            callback: function(value) {
                return value === 1 ? 'Sí (1)' : 'No (0)';
            }
        } 
    },
    x: { title: { display: true, text: "Eventos (T)" } }
  }
};

// Para gráfica de totales
const optionsTotales = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1 } },
    x: { title: { display: true, text: "Fechas (F)" } }
  }
};

// --- LÓGICA DE PROCESAMIENTO DE DATOS ---
const procesarGraficas = (datos) => {
  const labelsEventos = datos.map((_, index) => `T${index + 1}`);

  // 1. Procesar Datos Estudiante (Mapeo a 0, 1 o 2)
  const dataEstudiante = datos.map(a => {
    if (a.resultado === 'NoFace' || a.resultado === 'Fake') return 0;
    if (a.resultado === 'Desconocido') return 1;
    return 2; // Si es un nombre, es el estudiante reconocido
  });

  // 2. Procesar Datos Movimiento
  const dataMovimiento = datos.map(a => a.movimiento_detectado ? 1 : 0);

  // 3. Procesar Agrupación por Fechas
  const conteoPorFecha = {};
  datos.forEach(a => {
    // Solo contamos las asistencias válidas
    if (!['NoFace', 'Fake', 'Desconocido'].includes(a.resultado)) {
      const fechaCorta = new Date(a.fecha_hora).toISOString().split('T')[0];
      conteoPorFecha[fechaCorta] = (conteoPorFecha[fechaCorta] || 0) + 1;
    }
  });

  const labelsFechas = Object.keys(conteoPorFecha).sort();
  const dataTotales = labelsFechas.map(fecha => conteoPorFecha[fecha]);

  // --- ASIGNACIÓN REACTIVA A CHART.JS ---
  chartDataEstudiante.value = {
    labels: labelsEventos,
    datasets: [{ data: dataEstudiante, borderColor: "#3b82f6", tension: 0.1, backgroundColor: "rgba(59, 130, 246, 0.2)", fill: true }]
  };

  chartDataMovimiento.value = {
    labels: labelsEventos,
    datasets: [{ data: dataMovimiento, borderColor: "#10b981", tension: 0.1, backgroundColor: "rgba(16, 185, 129, 0.2)", fill: true }]
  };

  chartDataFechas.value = {
    labels: labelsFechas, 
    datasets: [{ data: dataTotales, borderColor: "#f59e0b", tension: 0.3, pointBackgroundColor: "#f59e0b", backgroundColor: "rgba(245, 158, 11, 0.2)", fill: true }]
  };
};

// --- CICLO DE VIDA Y SOCKETS ---
onMounted(async () => {
  const response = await obtenerAsistencias();
  if (response.success) {
    asistenciasCrudas.value = response.data;
    procesarGraficas(asistenciasCrudas.value);
  }

  socket = io("http://localhost:3000"); // ⚠️ Verifica el puerto de tu Node

  socket.on("nuevaAsistencia", (nuevaAsistencia) => {
    asistenciasCrudas.value.push(nuevaAsistencia);
    procesarGraficas(asistenciasCrudas.value);
  });
});

onUnmounted(() => {
  if (socket) socket.disconnect();
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}
.title {
  text-align: center;
  font-family: sans-serif;
  margin-bottom: 30px;
  color: #1f2937;
}
.chart-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  height: 280px; 
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.chart-card h3 {
  margin-top: 0;
  margin-bottom: 15px;
  text-align: left;
  font-weight: 600;
  color: #374151;
}
</style>