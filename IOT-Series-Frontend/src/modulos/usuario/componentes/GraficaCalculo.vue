<template>
  <div>
    <h2>Iteraciones de todos los cálculos</h2>
    <Chart
      v-if="chartData"
      :chart-data="chartData"
      :chart-options="chartOptions"
      type="line"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from "chart.js";
import { Chart } from "vue-chartjs";

// Registrar componentes de Chart.js
ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const chartData = ref(null);
const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: true },
    title: { display: true, text: "Iteraciones vs Valor Aproximado" }
  },
  scales: {
    x: { title: { display: true, text: "Iteración" } },
    y: { title: { display: true, text: "Valor" } }
  }
};

// Función para preparar datos de varias series
const prepararDatos = (todosCalculos) => {
  const datasets = todosCalculos.map((calculo, index) => {
    const valores = calculo.iteraciones.map(i => i.valor);
    const pasos = calculo.iteraciones.map(i => i.paso);
    const color = `hsl(${index * 50 % 360}, 70%, 50%)`; // color diferente para cada cálculo
    return {
      label: calculo.nombre_calculo || `Calculo ${index + 1}`,
      data: valores,
      borderColor: color,
      backgroundColor: color + "33", // semitransparente
      tension: 0.3
    };
  });

  // Usar los pasos de la primera serie como labels
  const labels = todosCalculos[0]?.iteraciones.map(i => i.paso) || [];

  return { labels, datasets };
};

// Llamar al endpoint y preparar datos
onMounted(async () => {
  try {
    const res = await fetch("http://localhost:3000/api/calculos/seno");
    const json = await res.json();
    if (json.success) {
      chartData.value = prepararDatos(json.data);
    }
  } catch (error) {
    console.error("Error cargando cálculos:", error);
  }
});
</script>