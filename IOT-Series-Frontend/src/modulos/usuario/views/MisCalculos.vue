<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend } from "chart.js";
import { io } from "socket.io-client";
import axios from "axios";
import { obtenerSeries, obtenerSeriesDatos } from "../services/UsuarioService";
import zoomPlugin from 'chartjs-plugin-zoom';
Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend,zoomPlugin);

const chartRefValor = ref(null);
const chartRefError = ref(null);
let chartValor = null;
let chartError = null;

const socket = io("http://localhost:3000"); // tu backend

// Estado
const seriesList = ref([]);
const selectedSerie = ref("");

// Función para transformar cálculos a datos de Chart.js
const prepararDatos = (data) => {
  const allIterations = data.flatMap(calculo =>
    calculo.iteraciones.map(iter => ({
      fecha: new Date(calculo.fecha),
      paso: iter.paso,
      valor: iter.valor,
      error: iter.error
    }))
  );

  allIterations.sort((a, b) => a.fecha - b.fecha || a.paso - b.paso);

  return {
    labels: allIterations.map(item =>
      `${item.fecha.toLocaleDateString()} ${item.fecha.toLocaleTimeString()} P${item.paso}`
    ),
    valores: allIterations.map(item => item.valor),
    errores: allIterations.map(item => item.error)
  };
};

// Cargar series del backend
const cargarSeries = async () => {
  try {
    const res = await obtenerSeries()
    seriesList.value = res.data.data;
    if (seriesList.value.length) selectedSerie.value = seriesList.value[0]._id;
  } catch (error) {
    console.error("Error cargando series:", error);
  }
};

// Cargar datos iniciales de la serie seleccionada
const cargarDatosSerie = async (serieId) => {
  try {
    if (!serieId) return;
    const res = await obtenerSeriesDatos(serieId)
    const { labels, valores, errores } = prepararDatos(res.data.data);

    // Destruir gráficos anteriores si existen
    if (chartValor) chartValor.destroy();
    if (chartError) chartError.destroy();

    // Gráfico de valores
    chartValor = new Chart(chartRefValor.value, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Valor de las iteraciones",
          data: valores,
          borderColor: "rgba(180,122,179,1)",
          backgroundColor: "rgba(180,122,179,0.2)",
          fill: false,
          tension: 0.2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
          animation: {
    duration: 800, // Duración de la animación en milisegundos
    easing: 'linear' // Movimiento constante y suave
  },
        plugins: {
          tooltip: { mode: "index", intersect: false },
          title: { display: true, text: "Evolución de Iteraciones" },
          zoom: {
      pan: {
        enabled: true,
        mode: 'x', // Permitir mover a los lados
      },
      zoom: {
        wheel: {
          enabled: true, // Zoom con la rueda del ratón
        },
        pinch: {
          enabled: true // Zoom con dedos en móviles
        },
        mode: 'x',
      },
    },
        },
        interaction: { mode: "nearest", axis: "x", intersect: false },
        scales: {
          x: {
            title: { display: true, text: "Fecha y hora" },
            ticks: {
              maxRotation: 0, // Evita que se inclinen tanto
              autoSkip: true, // Chart.js saltará etiquetas para que no choquen
              maxTicksLimit: 10 // Solo mostrará máximo 10 etiquetas de texto
            }
          },
          // ... resto de la config
        }        
      }
    });

    // Gráfico de errores
    chartError = new Chart(chartRefError.value, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Error de aproximación",
          data: errores,
          borderColor: "rgba(255,0,0,1)",
          backgroundColor: "rgba(124,153,47,0.2)",
          fill: false,
          tension: 0.2
        }]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
    duration: 800, // Duración de la animación en milisegundos
    easing: 'linear' // Movimiento constante y suave
  },
        plugins: {
          tooltip: { mode: "index", intersect: false },
          title: { display: true, text: "Error de Aproximación" },
          zoom: {
      pan: {
        enabled: true,
        mode: 'x', // Permitir mover a los lados
      },
      zoom: {
        wheel: {
          enabled: true, // Zoom con la rueda del ratón
        },
        pinch: {
          enabled: true // Zoom con dedos en móviles
        },
        mode: 'x',
      },
    },
        },
        interaction: { mode: "nearest", axis: "x", intersect: false },
        scales: {
          x: {
            title: { display: true, text: "Fecha y hora" },
            ticks: {
              maxRotation: 0, // Evita que se inclinen tanto
              autoSkip: true, // Chart.js saltará etiquetas para que no choquen
              maxTicksLimit: 20 // Solo mostrará máximo 10 etiquetas de texto
            }
          },
          // ... resto de la config
        }      
      }
    });

  } catch (error) {
    console.error("Error cargando datos de la serie:", error);
  }
};

// Agregar nuevo cálculo solo si corresponde a la serie activa

const MAX_PUNTOS = 100; // Ajusta este número según prefieras

const agregarNuevoCalculo = (nuevoCalculo) => {
  if (!selectedSerie.value || nuevoCalculo.serie !== selectedSerie.value) return;

  const nuevasIteraciones = nuevoCalculo.iteraciones;

  nuevasIteraciones.forEach(item => {
    const fechaDate = new Date(nuevoCalculo.fecha);
    const label = `${fechaDate.toLocaleTimeString()} P${item.paso}`;

    // Agregar datos
    chartValor.data.labels.push(label);
    chartValor.data.datasets[0].data.push(item.valor);
    
    chartError.data.labels.push(label);
    chartError.data.datasets[0].data.push(item.error);

    // ELIMINAR EL PRIMERO SI EXCEDEMOS EL LÍMITE
    if (chartValor.data.labels.length > MAX_PUNTOS) {
      chartValor.data.labels.shift();
      chartValor.data.datasets[0].data.shift();
      
      chartError.data.labels.shift();
      chartError.data.datasets[0].data.shift();
    }

  });

  // Usar 'none' para que no haya animaciones bruscas en el scroll
  chartValor.update();
  chartError.update();
};
// Watcher para cambiar de serie
watch(selectedSerie, async (newSerie) => {
  await cargarDatosSerie(newSerie);
});

onMounted(async () => {
  await cargarSeries();
  await cargarDatosSerie(selectedSerie.value);

  socket.on("nuevoCalculo", (nuevo) => {
    console.log("Nuevo cálculo recibido:", nuevo);
    agregarNuevoCalculo(nuevo);
  });
  scrollAlFinal();
});

onBeforeUnmount(() => {
  socket.off("nuevoCalculo");
  socket.disconnect();
});
const scrollAlFinal = () => {
  // Usamos nextTick para esperar a que Chart.js termine de renderizar el nuevo punto
  setTimeout(() => {
    if (chartRefValor.value && chartRefError.value) {
      const containerValor = chartRefValor.value.parentElement.parentElement;
      const containerError = chartRefError.value.parentElement.parentElement;
      
      containerValor.scrollTo({ left: containerValor.scrollWidth, behavior: 'smooth' });
      containerError.scrollTo({ left: containerError.scrollWidth, behavior: 'smooth' });
    }
  }, 100); // Un pequeño delay para que la animación de la línea no se vea cortada
};
</script>

<template>
  <div>
    <label for="serieSelect">Selecciona la serie:</label>
    <br>  
    <select id="serieSelect" v-model="selectedSerie">
      <option v-for="serie in seriesList" :key="serie._id" :value="serie._id">
        {{ serie.nombre }}
      </option>
    </select>

    <div style="overflow-x: auto; width: 100%;">
      <div style="width: 5000px; height: 400px;">
        <canvas ref="chartRefValor"></canvas>
      </div>
    </div>    
    <div style="overflow-x: auto; width: 100%;">
      <div style="width: 5000px; height: 400px;">
        <canvas ref="chartRefError"></canvas>
      </div>
    </div> 
  </div>
</template>


<style scoped>
/* Estilo del SELECT */
#serieSelect {
  appearance: none; /* Quita el estilo por defecto del navegador */
  background-color: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 1rem;
  color: #2d3748;
  cursor: pointer;
  transition: all 0.2s ease;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234a5568'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px; /* Espacio para la flecha personalizada */
}

/* Efecto al pasar el mouse */
#serieSelect:hover {
  border-color: #cbd5e0;
}

/* Efecto al hacer foco (clic) */
#serieSelect:focus {
  outline: none;
  border-color: #b47ab3; /* Color púrpura como tu gráfica */
  box-shadow: 0 0 0 3px rgba(180, 122, 179, 0.2);
}

/* Estilo de las OPTIONS */
#serieSelect option {
  padding: 10px;
  background-color: #ffffff;
  color: #2d3748;
}
</style>