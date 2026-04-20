<template>
  <div class="contenedor">

    <h2>Mi Progreso en la Materia</h2>

    <div v-if="cargando" class="mensaje">Cargando datos...</div>

    <div v-else-if="error" class="mensaje error">
      {{ error }}
    </div>

    <div v-else>

  <div class="dashboard">
    <div class="grafica-card">
      <h3>Porcentaje de Asistencia</h3>
      <Pie :data="chartData" :options="chartOptions" />
      <div class="porcentaje-grande">
        {{ porcentaje }}%
      </div>
    </div>

    <div class="resumen-card">
      <h3>Resumen</h3>

      <div class="dato">
        <span>Clases asistidas</span>
        <strong class="positivo">{{ presentes }}</strong>
      </div>

      <div class="dato">
        <span>Faltas</span>
        <strong class="negativo">{{ faltas }}</strong>
      </div>

      <div class="dato">
        <span>Total de clases</span>
        <strong>{{ total }}</strong>
      </div>

      <div :class="['mensaje-asistencia', claseMensaje]">
        {{ mensajeAsistencia }}
      </div>
    </div>
  </div>
  <br>
  <h1>
  Mis notas
  </h1>
  <!-- 👇 AHORA QUEDA DEBAJO -->
  <div class="notas-container">
    <div class="nota-card" v-for="(nota, index) in notas" :key="index">
      <div class="nota-header">
        Nota {{ index + 1 }}
      </div>

      <div class="nota-valor">
        {{ nota.calificacion }}
      </div>
    </div>
  </div>

</div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { Pie } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";

import { obtenerMiProgreso,listarNotasMaterias } from "../services/miProgresoService";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const route = useRoute();
const materiaId = route.params.id_materia;

const notas=ref([])

const cargando = ref(true);
const error = ref(null);

const presentes = ref(0);
const faltas = ref(0);
const total = ref(0);

const porcentaje = computed(() => {
  if (total.value === 0) return 0;
  return Math.round((presentes.value / total.value) * 100);
});

const mensajeAsistencia = computed(() => {
  if (porcentaje.value >= 70) {
    return "Tu asistencia está bien";
  }
  return "Tu asistencia no está bien";
});

const claseMensaje = computed(() => {
  return porcentaje.value >= 70 ? "mensaje-ok" : "mensaje-mal";
});

const chartData = computed(() => ({
  labels: ["Asistencias", "Faltas"],
  datasets: [
    {
      data: [presentes.value, faltas.value],
      backgroundColor: ["#4CAF50", "#F44336"]
    }
  ]
}));

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: "bottom" }
  }
};

onMounted(async () => {
  try{

  const resp = await obtenerMiProgreso(materiaId);
  const data = resp.data;
  presentes.value = data.presentes || 0;
  faltas.value = data.faltas || 0;
  total.value = data.total || 0;
  }catch(error){

  
    error.value = resp.mensaje;
    cargando.value = false;
    return;
  }

  try{
    const response=await listarNotasMaterias(materiaId);

    notas.value=response.data.data.data
  }catch(error){
    console.log(error)
  }
  

  

  cargando.value = false;
});
</script>

<style scoped>
.contenedor {
  padding: 40px;
}

.dashboard {
  display: flex;
  gap: 40px;
  margin-top: 30px;
}

.grafica-card,
.resumen-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.grafica-card {
  width: 320px;
  position: relative;
}

.porcentaje-grande {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 26px;
  font-weight: bold;
  color: #ffffff;
}

.resumen-card {
  flex: 1;
}

.dato {
  display: flex;
  justify-content: space-between;
  margin: 18px 0;
  font-size: 18px;
}

.positivo { color: #2e7d32; }
.negativo { color: #c62828; }

.mensaje {
  margin-top: 30px;
  font-size: 18px;
}

.error {
  color: #c62828;
}

.mensaje-asistencia {
  margin-top: 20px;
  padding: 14px;
  border-radius: 10px;
  font-weight: 600;
  text-align: center;
}

.mensaje-ok {
  background-color: #dcedc8; /* verde claro */
  color: #2e7d32;
}

.mensaje-mal {
  background-color: #ffcdd2; /* rojo claro */
  color: #c62828;
}
.notas-container {
  display: flex;
  gap: 28px;
  flex-wrap: wrap;
  margin-top: 40px;
  justify-content: center;
}

.nota-card {
  background: white;
  padding: 28px;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);

  width: clamp(180px, 22vw, 260px); /* ⭐ responsive real */
  aspect-ratio: 1 / 1;              /* ⭐ cuadrado perfecto */

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.nota-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 18px rgba(0,0,0,0.12);
  background: linear-gradient(145deg, #ffffff, #f3f6fb);
  border: 1px solid #eef1f6;
}

.nota-header {
  color: #666;
  margin-bottom: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
  font-size: clamp(14px, 1.2vw, 40px);

}

.nota-valor {
  font-weight: bold;
  color: #1976d2;
  font-size: clamp(28px, 3vw, 100px);
}

</style>