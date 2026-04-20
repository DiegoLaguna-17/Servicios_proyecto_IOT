<template>
  <div class="contenedor">
    <div class="icon-wrapper">
      <Icon
        to="../MateriasDocente"
        iconName="arrow_back"
        iconColor="black"
        message="Volver"
      />
    </div>
    <h2>Registro de notas</h2>
    <p class="subtitulo">
      Aquí puedes registrar nuevas notas de los estudiantes
    </p>

    <button
      class="btn-guardar"
      @click="guardarNotas"
      :disabled="!notasCompletas"
    >
      Guardar Notas
    </button>

    <button
      class="btn-certificados"
      @click="procesarEnvioCertificados"
      :disabled="cargandoCertificados || estudiantes.length === 0"
    >
      {{ cargandoCertificados ? "Enviando..." : "Enviar Certificados (PDF)" }}
    </button>

    <table class="tabla">
      <thead>
        <tr>
          <th>Nombre Completo</th>

          <th v-for="i in cantidadEvaluaciones" :key="i">Nota {{ i }}</th>

          <th v-if="nuevaEvaluacion">Nueva Evaluación</th>

          <th>
            <button class="btn-agregar" @click="agregarEvaluacion">
              + Agregar Evaluación
            </button>
          </th>

          <th>Promedio</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="estudiante in estudiantes" :key="estudiante.id_estudiante">
          <td class="nombre">{{ estudiante.nombre }}</td>

          <!-- NOTAS ANTIGUAS SOLO VISUAL -->
          <td v-for="i in cantidadEvaluaciones" :key="i">
            {{ estudiante.notas?.[i - 1]?.calificacion ?? "-" }}
          </td>

          <!-- NUEVA NOTA -->
          <td v-if="nuevaEvaluacion">
            <input
              type="number"
              v-model.number="
                obtenerNuevaNota(estudiante.id_estudiante).nueva_nota
              "
              @input="calcularEstado(estudiante)"
              class="input-nota"
            />
          </td>

          <td></td>

          <td>
            <span class="estado">
              {{ calcularPromedio(estudiante) }}
            </span>
          </td>
          <td>
            <button class="btn-editar" @click="abrirModalEditar(estudiante)">
              Editar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="mostrarModal" class="modal-overlay">
      <div class="modal">
        <h3>¿Estás seguro de guardar la evaluación?</h3>

        <p class="sub">Estas son las notas a registrar</p>

        <div class="lista-notas">
          <div
            v-for="nota in nuevasNotas"
            :key="nota.id_estudiante"
            class="item-nota"
          >
            <strong>{{ nota.nombre }}</strong> :
            {{ nota.nueva_nota }}
          </div>
        </div>

        <div class="botones">
          <button class="btn-cancelar" @click="cancelarGuardado">
            Cancelar
          </button>

          <button class="btn-confirmar" @click="confirmarGuardado">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="mostrarModalEditar" class="modal-overlay">
    <div class="modal">
      <h3>Editar notas de {{ estudianteSeleccionado.nombre }}</h3>

      <div class="lista-notas">
        <div
          v-for="(nota, index) in notasEditar"
          :key="nota.id_nota"
          class="item-nota"
        >
          Nota {{ index + 1 }}:
          <input
            type="number"
            v-model.number="nota.calificacion"
            class="input-nota"
          />
        </div>
      </div>

      <div class="botones">
        <button class="btn-cancelar" @click="cancelarEdicion">Cancelar</button>
        <button class="btn-confirmar" @click="guardarEdicion">Guardar</button>
      </div>
    </div>
  </div>
  <ModalExito
    :message="mensajeModal"
    :visible="mostrarExito"
    @close="mostrarExito = false"
  />

  <ModalError
    :message="mensajeModal"
    :visible="mostrarError"
    @close="mostrarError = false"
  />
</template>

<script setup>
import { ref, onMounted } from "vue";
import Icon from "../../seguridad/components/Icon.vue";
import { useRoute, useRouter } from "vue-router";
const mostrarModal = ref(false);
import ModalExito from "../../seguridad/components/ModalExito.vue";
import ModalError from "../../seguridad/components/ModalError.vue";
import { computed } from "vue";
import {
  listarNotasMateria,
  registrarNotas,
  editarNotas,
  enviarCertificadosLote,
} from "../services/DocenteService";
const route = useRoute();
const router = useRouter();
const mostrarError = ref(false);
const mostrarExito = ref(false);
const mensajeModal = ref("");
const mostrarModalEditar = ref(false);
const estudianteSeleccionado = ref(null);
const notasEditar = ref([]);
const cargandoCertificados = ref(false);
onMounted(async () => {
  const id_materia = route.params.id_materia;
  const response = await listarNotasMateria(id_materia);

  if (!response?.data?.data) {
    mensajeModal.value =
      response?.mensaje || "Error al obtener las notas de la materia";
    mostrarError.value = true;
    estudiantes.value = [];
    return;
  }

  estudiantes.value = response.data.data.map((e) => ({
    ...e,
    notas: e.notas ?? [],
    correo: e.correo,
  }));
});

async function procesarEnvioCertificados() {
  if (estudiantes.value.length === 0) return;

  cargandoCertificados.value = true;

  const id_materia = route.params.id_materia;

  const payload = {
    id_materia: id_materia,
    estudiantes: estudiantes.value.map((e) => ({
      id_estudiante: e.id_estudiante,
      nombre: e.nombre,
      correo: e.correo,
      promedio: calcularPromedio(e),
    })),
  };

  const response = await enviarCertificadosLote(payload);

  if (response.exito) {
    mensajeModal.value =
      response.mensaje || "Certificados enviados con éxito por correo.";
    mostrarExito.value = true;
  } else {
    mensajeModal.value =
      response.mensaje || "Hubo un problema al enviar los certificados.";
    mostrarError.value = true;
  }

  cargandoCertificados.value = false;
}

function abrirModalEditar(estudiante) {
  if (!estudiante.notas || estudiante.notas.length === 0) {
    mensajeModal.value =
      "Este estudiante todavía no tiene notas registradas para editar";
    mostrarError.value = true;
    return;
  }

  estudianteSeleccionado.value = estudiante;

  notasEditar.value = estudiante.notas.map((n) => ({
    id_nota: n.id_nota,
    calificacion: n.calificacion,
  }));

  mostrarModalEditar.value = true;
}
function cancelarEdicion() {
  mostrarModalEditar.value = false;
  estudianteSeleccionado.value = null;
  notasEditar.value = [];
}

async function guardarEdicion() {
  if (!estudianteSeleccionado.value) return;

  if (!notasEditar.value || notasEditar.value.length === 0) {
    mensajeModal.value = "No hay notas para editar";
    mostrarError.value = true;
    return;
  }

  const tieneNotasInvalidas = notasEditar.value.some(
    (nota) =>
      nota.calificacion === null ||
      nota.calificacion === undefined ||
      nota.calificacion === "" ||
      Number.isNaN(Number(nota.calificacion)),
  );

  if (tieneNotasInvalidas) {
    mensajeModal.value = "Todas las notas deben tener una calificación válida";
    mostrarError.value = true;
    return;
  }

  const id_materia = route.params.id_materia;
  const enviar = {
    id_materia,
    notas: [
      {
        id_estudiante: estudianteSeleccionado.value.id_estudiante,
        nombre: estudianteSeleccionado.value.nombre,
        nuevas_notas: notasEditar.value.map((n) => ({
          id_nota: n.id_nota,
          calificacion: Number(n.calificacion),
        })),
      },
    ],
  };

  console.log(JSON.stringify(enviar, null, 2));

  const response = await editarNotas(enviar);

  if (response.exito) {
    mensajeModal.value = response.mensaje || "Notas actualizadas correctamente";
    mostrarExito.value = true;

    estudianteSeleccionado.value.notas = notasEditar.value.map((n) => ({
      ...n,
      calificacion: Number(n.calificacion),
    }));

    cancelarEdicion();

    setTimeout(() => {
      router.go(0);
    }, 2000);

    return;
  }

  mensajeModal.value = response.mensaje || "Error al actualizar notas";
  mostrarError.value = true;
  console.log(response);
}

const notasCompletas = computed(() => {
  if (!nuevaEvaluacion.value) return false;

  return nuevasNotas.value.every(
    (nota) => nota.nueva_nota !== null && nota.nueva_nota !== "",
  );
});
function calcularPromedio(estudiante) {
  let notas = [...(estudiante.notas ?? []).map((n) => Number(n.calificacion))];
  const nueva = obtenerNuevaNota(estudiante.id_estudiante);

  if (nueva && nueva.nueva_nota !== null && nueva.nueva_nota !== undefined) {
    notas.push(Number(nueva.nueva_nota));
  }

  if (notas.length === 0) return "-";

  const suma = notas.reduce((a, b) => a + Number(b), 0);
  return Math.round(suma / notas.length);
}

const nuevaEvaluacion = ref(false);

const nuevasNotas = ref([]);

const estudiantes = ref([]);

const cantidadEvaluaciones = computed(() => {
  if (estudiantes.value.length === 0) return 1;

  const maxNotas = Math.max(
    ...estudiantes.value.map((e) => e.notas?.length ?? 0),
    1,
  );

  return maxNotas;
});

function calcularEstado(estudiante) {
  let notas = [...(estudiante.notas ?? []).map((n) => Number(n.calificacion))];

  const nueva = obtenerNuevaNota(estudiante.id_estudiante);

  if (
    nueva &&
    nueva.nueva_nota !== null &&
    nueva.nueva_nota !== undefined &&
    nueva.nueva_nota !== ""
  ) {
    notas.push(Number(nueva.nueva_nota));
  }

  if (notas.length === 0) {
    estudiante.estado = null;
    return;
  }

  const suma = notas.reduce((a, b) => a + Number(b), 0);
  const promedio = suma / notas.length;

  estudiante.estado = promedio >= 51 ? "APROBADO" : "REPROBADO";
}

function agregarEvaluacion() {
  nuevaEvaluacion.value = true;

  nuevasNotas.value = estudiantes.value.map((e) => ({
    id_estudiante: e.id_estudiante,
    nombre: e.nombre,
    correo: e.correo,
    nueva_nota: null,
  }));
}
function obtenerNuevaNota(id_estudiante) {
  return nuevasNotas.value.find((n) => n.id_estudiante === id_estudiante);
}

function guardarNotas() {
  mostrarModal.value = true;
}

async function confirmarGuardado() {
  const id_materia = route.params.id_materia;

  const hayNotasInvalidas = nuevasNotas.value.some(
    (nota) =>
      nota.nueva_nota === null ||
      nota.nueva_nota === undefined ||
      nota.nueva_nota === "" ||
      Number.isNaN(Number(nota.nueva_nota)),
  );

  if (hayNotasInvalidas) {
    mensajeModal.value = "Debes completar todas las nuevas notas";
    mostrarError.value = true;
    mostrarModal.value = false;
    return;
  }

  const enviar = {
    id_materia,
    notas: nuevasNotas.value.map((n) => ({
      id_estudiante: n.id_estudiante,
      nombre: n.nombre,
      nueva_nota: Number(n.nueva_nota),
    })),
  };

  console.log(JSON.stringify(enviar, null, 2));
  mostrarModal.value = false;

  const response = await registrarNotas(enviar);

  if (response.exito) {
    mensajeModal.value = response.mensaje || "Notas correctamente registradas";
    mostrarExito.value = true;

    setTimeout(() => {
      router.go(0);
    }, 3000);

    return;
  }

  mensajeModal.value = response.mensaje || "Error al registrar notas";
  mostrarError.value = true;
  console.log(response);
}

function cancelarGuardado() {
  mostrarModal.value = false;
}
</script>

<style scoped>
.contenedor {
  padding: 30px;
}

.subtitulo {
  color: #777;
}

.btn-guardar {
  background: #f2b705;
  border: none;
  padding: 10px 25px;
  border-radius: 6px;
  margin: 20px 0;
  font-weight: bold;
}

.tabla {
  width: 100%;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
}

.tabla th,
.tabla td {
  border: 1px solid #5ca6d4;
  padding: 12px;
  text-align: center;
}

.nombre {
  text-align: left;
}

.input-nota {
  width: 70px;
  padding: 6px;
  border-radius: 6px;
  border: 1px solid #999;
  text-align: center;
}

.btn-agregar {
  background: #d9edf7;
  border: 1px solid #5ca6d4;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.estado {
  padding: 6px 14px;
  border-radius: 6px;
  font-weight: bold;
}

.aprobado {
  background: #b9f6c5;
  color: green;
}

.reprobado {
  background: #ffc3c3;
  color: red;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 25px;
  border-radius: 10px;
  width: 400px;
  max-height: 500px;
}

.sub {
  color: #666;
  margin-bottom: 10px;
}

.lista-notas {
  border: 1px solid #ccc;
  padding: 10px;
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.item-nota {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

.botones {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancelar {
  background: #ddd;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
}

.btn-confirmar {
  background: #a0dde0;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
}
.icon-wrapper {
  cursor: pointer;
  display: inline-flex;
  padding: 0.5rem 0.6rem;
  border-radius: 50px;
}

.icon-wrapper:hover {
  background-color: #eee;
}
.btn-editar {
  background: #f0ad4e;
  color: white;
  border: none;
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-editar:hover {
  background: #ec971f;
}

.btn-certificados {
  background: #5ca6d4; /* Color azul acorde a tu tabla */
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-certificados:hover:not(:disabled) {
  background: #4a8db5;
}

.btn-certificados:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
