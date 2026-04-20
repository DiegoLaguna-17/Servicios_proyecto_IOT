<template>
<div>

  

  <h2>Registrar Cálculo</h2>
  <p>Completa el formulario para generar un cálculo</p>

  <div class="layout">

    <!-- FORMULARIO -->
    <div class="form-card">

      <form @submit.prevent="generarCalculo">

        <div class="grid">

          <div>
            <label>Serie</label>
            <select v-model="serieSeleccionada">
              <option value="">Seleccione una serie</option>
              <option v-for="s in series" :key="s._id" :value="s">
                {{ s.nombre }}
              </option>
            </select>
          </div>


          <div>
            <label>Valor de X</label>
            <input type="number" step="0.01" v-model="form.x_valor"/>
          </div>

          <div>
            <label>Número de términos</label>
            <input type="number" v-model="form.n_terminos"/>
          </div>

        </div>

        <div class="buttons">
          <button type="reset" class="btn-clear">Limpiar</button>
          <button class="btn-register">Calcular</button>
          
        </div>

      </form>   
      <button class="btn-register" :disabled="!resultado" @click="abrirModal">Guardar calculo</button>


      <!-- TABLA ITERACIONES -->
      <table v-if="iteraciones.length" class="tabla">
        <thead>
          <tr>
            <th>Paso</th>
            <th>Valor</th>
            <th>Error</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="it in iteraciones" :key="it.paso">
            <td>{{ it.paso }}</td>
            <td>{{ it.valor }}</td>
            <td>{{ it.error }}</td>
          </tr>
        </tbody>
      </table>

    </div>


    <!-- PANEL DERECHO -->
    <div class="result-panel">

      <div class="resultado-card" v-if="resultado">

        <h3>Resultados</h3>

        <p>
          <strong>Resultado Aproximado:</strong>
          {{ resultado.resultado_aprox }}
        </p>

        <p>
          <strong>Valor Real:</strong>
          {{ resultado.valor_real }}
        </p>

        <p>
          <strong>Error:</strong>
          {{ resultado.error }}
        </p>

      </div>


      <div class="chart-card">
        <canvas id="aproxChart"></canvas>
      </div>

      <div class="chart-card">
        <canvas id="errorChart"></canvas>
      </div>

    </div>

  </div>

</div>

<div v-if="modalGuardar" class="modal-overlay">

  <div class="modal">

    <h2>Guardar cálculo</h2>

    <p>Ingresa el nombre con el que quieres guardar tu cálculo</p>

    <input
      type="text"
      v-model="nombre_calculo"
      placeholder="Nombre del cálculo"
    >

    <div class="modal-buttons">
      <button class="btn-register" @click="guardarCalculo">Guardar</button>
      <button class="btn-clear" @click="cerrarModal">Cancelar</button>
    </div>

  </div>

</div>
</template>
<script setup>

import { ref,onMounted } from "vue"
import Chart from "chart.js/auto"
import Icon from "../../login/componentes/Icon.vue"
import { crearCalculo, obtenerSeries } from "../services/UsuarioService"
const series = ref([])

const resultado = ref(null)
const iteraciones = ref([])
const serieSeleccionada = ref(null)
const nombre_calculo=ref("")
const modalGuardar=ref(false)

let datosSerie={}
const form = ref({
  serie:"",
  x_valor:"",
  n_terminos:""
})


const abrirModal=()=>{
    modalGuardar.value=true
}
const cerrarModal=()=>{
    modalGuardar.value=false;
}


const guardarCalculo=async()=>{
    datosSerie={
        ...datosSerie,
        nombre_calculo:nombre_calculo.value
    }
    
    const datosGuardar=datosSerie
    console.log(datosGuardar)
    
    try{
        const respuesta= await crearCalculo(datosGuardar);
        if(respuesta.success){
            alert("Calculo guardado correctamente")
        }
    }catch(error){
        alert("Error al guardar calculo")
        console.log(error)
    }
    cerrarModal()
}

onMounted(async()=>{
    try{
        const response=await obtenerSeries();
        const data=response.data.data
        series.value=data
        console.log(data)
    }catch(error){
        alert("error al obtener series")
    }
})

const generarCalculo = async () => {

  let respuesta = null

  const x = Number(form.value.x_valor)
  const n = Number(form.value.n_terminos)

  if(serieSeleccionada.value.funcion === "sin"){
      respuesta = calcularSeno(x, n)
  }

  if(serieSeleccionada.value.funcion === "cos"){
      respuesta = calcularCoseno(x, n)
  }

  if(serieSeleccionada.value.funcion === "arctan"){
      respuesta = calcularArcotangente(x, n)
  }

  datosSerie = {
      ...respuesta,
      usuario: localStorage.getItem("id"),
      serie: serieSeleccionada.value._id
  }

  resultado.value = {
      resultado_aprox: respuesta.resultado_aprox,
      error: respuesta.error,
      valor_real: respuesta.valor_real
  }

  iteraciones.value = respuesta.iteraciones

  generarGraficaAprox()
  generarGraficaError()
}
//para aproximacion a seno
function factorial(num) {
  let resultado = 1;
  for (let i = 1; i <= num; i++) {
    resultado *= i;
  }
  return resultado;
}

function senSerie(x, iteraciones) {

  let suma = 0;
  let listaIteraciones = [];

  const valorReal = Math.sin(x);

  for (let n = 0; n < iteraciones; n++) {

    let numerador = Math.pow(-1, n) * Math.pow(x, 2 * n + 1);
    let denominador = factorial(2 * n + 1);

    suma += numerador / denominador;

    let error = Math.abs(valorReal - suma);

    listaIteraciones.push({
      paso: n + 1,
      valor: suma,
      error: error
    });

  }

  return {
    resultado_aprox: suma,
    valor_real: valorReal,
    error: Math.abs(valorReal - suma),
    iteraciones: listaIteraciones
  };
}

function calcularSeno(x, n) {

  const resultado = senSerie(x, n);

  return {
    x_valor: x,
    n_terminos: n,
    resultado_aprox: resultado.resultado_aprox,
    valor_real: resultado.valor_real,
    error: resultado.error,
    iteraciones: resultado.iteraciones
  };
}


//Funcion de coseno 
function cosSerie(x, iteraciones) {

  let suma = 0;
  let listaIteraciones = [];

  const valorReal = Math.cos(x);

  for (let n = 0; n < iteraciones; n++) {

    let numerador = Math.pow(-1, n) * Math.pow(x, 2 * n);
    let denominador = factorial(2 * n);

    suma += numerador / denominador;

    let error = Math.abs(valorReal - suma);

    listaIteraciones.push({
      paso: n + 1,
      valor: suma,
      error: error
    });

  }

  return {
    resultado_aprox: suma,
    valor_real: valorReal,
    error: Math.abs(valorReal - suma),
    iteraciones: listaIteraciones
  };
}


function calcularCoseno(x, n) {

  const resultado = cosSerie(x, n);

  return {
    x_valor: x,
    n_terminos: n,
    resultado_aprox: resultado.resultado_aprox,
    valor_real: resultado.valor_real,
    error: resultado.error,
    iteraciones: resultado.iteraciones
  };

}

//funcion de arcotangente
function atanSerie(x, iteraciones) {

  let suma = 0;
  let listaIteraciones = [];

  const valorReal = Math.atan(x);

  for (let n = 0; n < iteraciones; n++) {

    let numerador = Math.pow(-1, n) * Math.pow(x, 2 * n + 1);
    let denominador = (2 * n + 1);

    suma += numerador / denominador;

    let error = Math.abs(valorReal - suma);

    listaIteraciones.push({
      paso: n + 1,
      valor: suma,
      error: error
    });

  }

  return {
    resultado_aprox: suma,
    valor_real: valorReal,
    error: Math.abs(valorReal - suma),
    iteraciones: listaIteraciones
  };
}


function calcularArcotangente(x, n) {

  const resultado = atanSerie(x, n);

  return {
    x_valor: x,
    n_terminos: n,
    resultado_aprox: resultado.resultado_aprox,
    valor_real: resultado.valor_real,
    error: resultado.error,
    iteraciones: resultado.iteraciones
  };

}

let chartAprox = null

const generarGraficaAprox = () => {

  if(chartAprox){
    chartAprox.destroy()
  }

  const funcion = serieSeleccionada.value.funcion

  const puntos = generarPuntosFuncion(
    funcion,
    form.value.n_terminos,
    parseFloat(form.value.x_valor)
  )

  chartAprox = new Chart(document.getElementById("aproxChart"), {

    type: "line",

    data: {

      labels: puntos.xs,

      datasets: [
        
        {
          label: "Función Real",
          data: puntos.real,
          borderColor: "orange",
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 0
        },
{
          label: "Aproximación Serie",
          data: puntos.aprox,
          borderColor: "blue",
          borderWidth: 4,
          tension: 0.35,
          pointRadius: 0
        },
        

      ]

    },

    options:{
      responsive:true,

      interaction:{
        intersect:false,
        mode:'index'
      },

      plugins:{
        legend:{position:"top"}
      },

      scales:{
        x:{
          title:{display:true,text:"x"}
        },
        y:{
          title:{display:true,text:"f(x)"}
        }
      }

    }

  })

}

let chartError = null

const generarGraficaError = () => {

  if(chartError){
    chartError.destroy()
  }

  const pasos = iteraciones.value.map(i => i.paso)
  const errores = iteraciones.value.map(i => i.error)

  chartError = new Chart(document.getElementById("errorChart"), {

    type: "line",

    data:{
      labels: pasos,
      datasets:[
        {
          label:"Reducción del error",
          data: errores,
          borderColor:"red",
          borderWidth:3,
          tension:0.3,
          pointRadius:4
        }
      ]
    },

    options:{
      responsive:true,

      scales:{
        x:{
          title:{display:true,text:"Iteración"}
        },
        y:{
          title:{display:true,text:"Error"}
        }
      }

    }

  })

}

function generarPuntosFuncion(funcion, iteraciones, xCentro) {

  const xs = []
  const real = []
  const aprox = []

  const rango = 2
  const paso = 0.05

  for (let x = xCentro - rango; x <= xCentro + rango; x += paso) {

    xs.push(x.toFixed(2))

    if (funcion === "sin") {
      real.push(Math.sin(x))
      aprox.push(senSerie(x, iteraciones).resultado_aprox)
    }

    else if (funcion === "cos") {
      real.push(Math.cos(x))
      aprox.push(cosSerie(x, iteraciones).resultado_aprox)
    }

    else if (funcion === "arctan") {
      real.push(Math.atan(x))
      aprox.push(atanSerie(x, iteraciones).resultado_aprox)
    }

  }

  return { xs, real, aprox }

}
</script>



<style scoped>
.icon-wrapper {
  cursor: pointer;
  display: inline-flex;
  padding: 0.5rem 0.6rem;
  border-radius: 50px;
}

.icon-wrapper:hover {
  background-color: #eee;
}
h2 {
  margin-bottom: 10px;
}

p {
  margin-bottom: 30px;
  color: #666;
}

.form-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  transition: 0.2s;
}

input:focus {
  border-color: #5fa8a8;
  outline: none;
}

.buttons {
  margin-top: 40px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.btn-clear {
  background: #ccc;
  border: none;
  padding: 10px 22px;
  border-radius: 8px;
}

.btn-register {
  background: #5fa8a8;
  border: none;
  padding: 10px 22px;
  border-radius: 8px;
  color: white;
}
.btn-register:disabled {
  background: #405656;
  border: none;
  padding: 10px 22px;
  border-radius: 8px;
  color: white;
}
.error {
  color: red;
  font-size: 13px;
  margin-top: 4px;
}
.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper input {
  width: 100%;
  padding-right: 40px;
}

.toggle-btn {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
}

.toggle-btn:hover {
  color: #5fa8a8;
}


.layout{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap:30px;
}

.form-card{
  background:white;
  padding:40px;
  border-radius:12px;
}

.result-panel{
  display:flex;
  flex-direction:column;
  gap:20px;
}

.resultado-card{
  background:white;
  padding:20px;
  border-radius:10px;
}

.chart-card{
  background:white;
  padding:20px;
  border-radius:10px;
  height: 40vh;
}

.tabla{
  margin-top:30px;
  width:100%;
  border-collapse: collapse;
}

.tabla th{
  background:#f0f0f0;
}

.tabla th, .tabla td{
  padding:10px;
  border:1px solid #ddd;
}

.grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:20px;
}
.modal-overlay{
  position: fixed;
  top:0;
  left:0;
  width:100%;
  height:100%;

  background: rgba(0,0,0,0.5);

  display:flex;
  justify-content:center;
  align-items:center;

  z-index:1000;
}

.modal{
  background:white;
  padding:30px;
  border-radius:12px;
  width:350px;

  box-shadow:0 10px 30px rgba(0,0,0,0.2);

  display:flex;
  flex-direction:column;
  gap:15px;
}

.modal input{
  padding:10px;
  border-radius:8px;
  border:1px solid #ddd;
}

.modal-buttons{
  display:flex;
  justify-content:flex-end;
  gap:10px;
}
</style>