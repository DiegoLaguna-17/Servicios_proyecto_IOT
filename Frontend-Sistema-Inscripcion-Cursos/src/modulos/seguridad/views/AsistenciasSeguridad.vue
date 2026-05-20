<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { 
  Chart, LineController, LineElement, PointElement, 
  LinearScale, Title, CategoryScale, Tooltip, Legend 
} from "chart.js";
import socketIot from "../servicios/socketIot"; 
import { obtenerAsistenciasIOT } from "../servicios/asistenciasIOTService";

// Registrar componentes de Chart.js
Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend);

// Referencias a los Canvas en el template
const chartRefEstudiante = ref(null);
const chartRefMovimiento = ref(null);
const chartRefFechas = ref(null);

// Instancias de Chart.js
let chartEstudiante = null;
let chartMovimiento = null;
let chartFechas = null;

const MAX_PUNTOS = 20; // Límite de eventos en pantalla antes de hacer scroll
const conteoPorFecha = ref({}); // Diccionario para guardar asistencias por día

// --- FUNCIONES DE AYUDA ---
// Para saber si sumamos +1 a la fecha (solo reconocidos)
const esReconocidoValido = (resultado) => {
  return !['NoFace', 'Fake', 'Desconocido'].includes(resultado);
};

// Para saber qué valor graficar en el eje Y del Estudiante
const obtenerNivelEstudiante = (resultado) => {
  if (['NoFace', 'Fake'].includes(resultado)) return 0;
  if (resultado === 'Desconocido') return 1;
  return 2; // Si no es ninguno de los anteriores, es un estudiante reconocido
};

// --- CONFIGURACIONES DE GRÁFICAS ---

// Configuración para 3 niveles (0, 1, 2)
const crearConfiguracionEstudiante = (titulo, colorLinea, colorFondo) => ({
  type: "line",
  data: { labels: [], datasets: [{ label: titulo, data: [], borderColor: colorLinea, backgroundColor: colorFondo, fill: false, tension: 0.1 }] },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800, easing: 'linear' },
    plugins: { title: { display: true, text: titulo }, legend: { display: false } },
    scales: {
      y: { 
        min: 0, 
        max: 2, 
        ticks: { 
          stepSize: 1, 
          callback: (value) => {
            if (value === 0) return 'Sin cara/Fake (0)';
            if (value === 1) return 'Desconocido (1)';
            if (value === 2) return 'Reconocido (2)';
            return value;
          } 
        } 
      },
      x: { title: { display: true, text: "Hora del evento" } }
    }
  }
});

// Configuración Binaria para Movimiento (0 y 1)
const crearConfiguracionBinaria = (titulo, colorLinea, colorFondo) => ({
  type: "line",
  data: { labels: [], datasets: [{ label: titulo, data: [], borderColor: colorLinea, backgroundColor: colorFondo, fill: false, tension: 0.1 }] },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800, easing: 'linear' },
    plugins: { title: { display: true, text: titulo }, legend: { display: false } },
    scales: {
      y: { min: 0, max: 1, ticks: { stepSize: 1, callback: (value) => value === 1 ? 'Sí (1)' : 'No (0)' } },
      x: { title: { display: true, text: "Hora del evento" } }
    }
  }
});

// --- CARGAR DATOS INICIALES REST API ---
const cargarDatosHistoricos = async () => {
  try {
    const res = await obtenerAsistenciasIOT();
    const asistencias = res.data || [];

    const labelsEventos = [];
    const dataEstudiante = [];
    const dataMovimiento = [];

    // Procesar histórico
    asistencias.forEach((a) => {
      const fechaObj = new Date(a.fecha_hora);
      const labelHora = fechaObj.toLocaleTimeString();
      
      labelsEventos.push(labelHora);
      dataEstudiante.push(obtenerNivelEstudiante(a.resultado));
      dataMovimiento.push(a.movimiento_detectado ? 1 : 0);

      // Agrupar por fechas (Solo válidos)
      if (esReconocidoValido(a.resultado)) {
        const fechaCorta = fechaObj.toISOString().split('T')[0];
        conteoPorFecha.value[fechaCorta] = (conteoPorFecha.value[fechaCorta] || 0) + 1;
      }
    });

    const inicioSlice = labelsEventos.length > MAX_PUNTOS ? labelsEventos.length - MAX_PUNTOS : 0;

    // Inicializar Gráfica: Estudiante
    chartEstudiante = new Chart(chartRefEstudiante.value, crearConfiguracionEstudiante(
      "Detección de Estudiante", "rgba(59, 130, 246, 1)", "rgba(59, 130, 246, 0.2)"
    ));
    chartEstudiante.data.labels = labelsEventos.slice(inicioSlice);
    chartEstudiante.data.datasets[0].data = dataEstudiante.slice(inicioSlice);
    chartEstudiante.update();

    // Inicializar Gráfica: Movimiento
    chartMovimiento = new Chart(chartRefMovimiento.value, crearConfiguracionBinaria(
      "Detección de Movimiento", "rgba(16, 185, 129, 1)", "rgba(16, 185, 129, 0.2)"
    ));
    chartMovimiento.data.labels = labelsEventos.slice(inicioSlice);
    chartMovimiento.data.datasets[0].data = dataMovimiento.slice(inicioSlice);
    chartMovimiento.update();

    // Inicializar Gráfica: Total Fechas
    const labelsFechas = Object.keys(conteoPorFecha.value).sort();
    const dataTotales = labelsFechas.map(f => conteoPorFecha.value[f]);

    chartFechas = new Chart(chartRefFechas.value, {
      type: "line",
      data: {
        labels: labelsFechas,
        datasets: [{ label: "Asistencias Válidas", data: dataTotales, borderColor: "rgba(245, 158, 11, 1)", tension: 0.3 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { title: { display: true, text: "Asistencia total por fecha" }, legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } }, x: { title: { display: true, text: "Fecha" } } }
      }
    });

  } catch (error) {
    console.error("Error cargando asistencias:", error);
  }
};

// --- ACTUALIZAR EN TIEMPO REAL (SOCKET) ---
const agregarNuevaAsistencia = (nueva) => {
  const fechaObj = new Date(nueva.fecha_hora);
  const labelHora = fechaObj.toLocaleTimeString();

  // 1. Agregar a gráficas de eventos
  chartEstudiante.data.labels.push(labelHora);
  chartEstudiante.data.datasets[0].data.push(obtenerNivelEstudiante(nueva.resultado));

  chartMovimiento.data.labels.push(labelHora);
  chartMovimiento.data.datasets[0].data.push(nueva.movimiento_detectado ? 1 : 0);

  // Eliminar el más antiguo si excedemos el límite
  if (chartEstudiante.data.labels.length > MAX_PUNTOS) {
    chartEstudiante.data.labels.shift();
    chartEstudiante.data.datasets[0].data.shift();
    chartMovimiento.data.labels.shift();
    chartMovimiento.data.datasets[0].data.shift();
  }

  chartEstudiante.update('none');
  chartMovimiento.update('none');

  // 2. Actualizar gráfica de Totales por fecha
  if (esReconocidoValido(nueva.resultado)) {
    const fechaCorta = fechaObj.toISOString().split('T')[0];
    conteoPorFecha.value[fechaCorta] = (conteoPorFecha.value[fechaCorta] || 0) + 1;

    chartFechas.data.labels = Object.keys(conteoPorFecha.value).sort();
    chartFechas.data.datasets[0].data = chartFechas.data.labels.map(l => conteoPorFecha.value[l]);
    chartFechas.update('none');
  }

  scrollAlFinal();
};

const scrollAlFinal = () => {
  setTimeout(() => {
    [chartRefEstudiante, chartRefMovimiento].forEach(refCanvas => {
      if (refCanvas.value) {
        const container = refCanvas.value.parentElement.parentElement;
        container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
      }
    });
  }, 100);
};

// --- CICLO DE VIDA ---
onMounted(async () => {
  await cargarDatosHistoricos();

  // Conectar el socket cuando la vista está montada
  socketIot.connect();

  socketIot.on("nuevaAsistencia", (nueva) => {
    console.log("Nueva asistencia en tiempo real IOT:", nueva);
    agregarNuevaAsistencia(nueva);
  });
});

onBeforeUnmount(() => {
  socketIot.off("nuevaAsistencia");
  // Desconectar al salir de la vista para evitar conflictos/recursos
  socketIot.disconnect();
});
</script>

<template>
  <div class="panel-asistencias">
    <h2 class="titulo-panel">Panel de Control de Asistencias (IOT)</h2>

    <div class="contenedor-scroll">
      <div class="canvas-wrapper">
        <canvas ref="chartRefEstudiante"></canvas>
      </div>
    </div>

    <div class="contenedor-scroll">
      <div class="canvas-wrapper">
        <canvas ref="chartRefMovimiento"></canvas>
      </div>
    </div>

    <div class="grafica-fija">
      <canvas ref="chartRefFechas"></canvas>
    </div>
  </div>
</template>

<style scoped>
.panel-asistencias {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.titulo-panel {
  text-align: center;
  font-family: sans-serif;
  color: #333;
  margin-bottom: 20px;
}

/* Scroll horizontal para eventos en tiempo real */
.contenedor-scroll {
  overflow-x: auto;
  width: 100%;
  margin-bottom: 30px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px;
}

.canvas-wrapper {
  /* Ancho estático largo para permitir el scroll si hay muchos puntos */
  width: 1200px; 
  height: 250px;
}

/* Gráfica de fechas estática y responsiva */
.grafica-fija {
  width: 100%;
  height: 300px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px;
}
</style>
