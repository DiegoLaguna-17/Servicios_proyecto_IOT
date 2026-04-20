<template>
  <div v-if="loading">Cargando...</div>

  <div v-else>
    <div v-if="student && student.data.carrera_usuario === null">
      <h1 class="title">Carreras Disponibles</h1>
      <p class="description">
        Aún no estás inscrito en ninguna carrera. Este es el momento perfecto
        para dar el primer paso hacia tu futuro profesional. Explora nuestras
        carreras disponibles, descubre nuevas oportunidades y elige el camino
        que mejor se adapte a tus metas y aspiraciones. Empieza hoy a construir
        tu futuro académico con confianza, compromiso y el respaldo que
        necesitas para alcanzar el éxito.
      </p>
      <div class="carrera-grid">
        <div class="carrera-card" v-for="carrera in carreras.data">
          <h2>{{ carrera.nombre }}</h2>
          <p class="desc">{{ carrera.descripcion }}</p>
          <div class="specs">
            <p class="spec">
              <SimpleIcon iconName="grid" iconColor="#c32aff" />
              Código: {{ String(carrera.codigo).toUpperCase() }}
            </p>
            <p class="spec">
              <SimpleIcon iconName="verified" iconColor="#00ff3c" />
              Certificación
            </p>
            <p class="spec">
              <SimpleIcon iconName="clock" iconColor="rgb(255,140,0)" />
              Duración: {{ carrera.duracion }}
            </p>
          </div>
          <div class="button-group">
            <button class="insc" @click="prepararInscripcion(carrera)">
              Inscribirse
            </button>
            <button class="vermas" @click="verMaterias(carrera)">
              Ver Materias
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="showModal"
        class="modal-overlay"
        @click.self="showModal = false"
      >
        <div class="modal-content">
          <h2>{{ selectedCarrera }}</h2>

          <div v-if="materias.data && materias.data.length > 0">
            <div v-for="materia in materias.data" class="materia-row">
              <p class="detail">
                <SimpleIcon iconName="carrera" iconColor="#003ffc" />
                {{ materia.nombre }}
              </p>
              <p class="detail">
                <SimpleIcon iconName="attention" iconColor="red" />
                Tipo: {{ materia.tipo }}
              </p>
              <p class="detail">
                <SimpleIcon iconName="money" iconColor="#00ff3c" />
                Monto: Bs. {{ materia.monto }}
              </p>
            </div>
          </div>
          <p v-else-if="!materias.data">Cargando materias...</p>
          <p v-else>No hay materias disponibles.</p>

          <button class="btn-cancel" @click="showModal = false">Cerrar</button>
        </div>
      </div>
      <div
        v-if="showConfirmModal"
        class="modal-overlay"
        @click.self="showConfirmModal = false"
      >
        <div class="modal-content confirm-box">
          <SimpleIcon iconName="warning" iconColor="orange" />
          <p>
            Te inscribirás a
            <strong>{{ carreraParaInscribir?.nombre }}</strong> ¿Deseas
            continuar?
          </p>

          <div class="confirm-buttons">
            <button class="btn-cancel" @click="showConfirmModal = false">
              Cancelar
            </button>
            <button class="btn-confirm" @click="inscribirse">
              Sí, Inscribirme
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="student">
      <h1>Mi Carrera</h1>
      <div class="main-container">
        <h1 class="title">{{ student.data.carrera.nombre }}</h1>
        <p class="description">{{ student.data.carrera.descripcion }}</p>
        <div class="two-group">
          <div class="badges">
            <p class="badge">
              <SimpleIcon iconName="clock" iconColor="rgb(255,140,0)" />
              Duración de {{ student.data.carrera.duracion }}
            </p>
            <p class="badge">
              <SimpleIcon iconName="verified" iconColor="#00ff3c" />
              Certificación Digital
            </p>
            <p class="badge">
              <SimpleIcon iconName="grid" iconColor="#c32aff" />
              Código:
              {{ String(student.data.carrera.codigo).toUpperCase() }}
            </p>
            <p class="badge" v-if="courseComp && totalMaterias > 0">
              <SimpleIcon iconName="percentage" iconColor="#ff2b00" />
              Completado: {{ completionPercentage }} %
            </p>
          </div>
          <div class="information">
            <h3 class="title">
              <SimpleIcon iconName="datos" iconColor="orange" />
              Mis Datos:
            </h3>
            <p class="titu">Nombre:</p>
            {{ student.data.nombre }}
            <p class="titu">CI:</p>
            {{ student.data.ci }}
            <p class="titu">Correo:</p>
            {{ student.data.correo }}
            <p class="titu">Fecha de Nacimiento:</p>
            {{ student.data.fecha_nac }}
            <p class="titu">Dirección:</p>
            {{ student.data.direccion }}
            <p class="titu">Teléfono:</p>
            {{ student.data.telefono }}
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <p>Estudiante no encontrado o error al cargar los datos.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../../../services";
import SimpleIcon from "../../seguridad/components/SimpleIcon.vue";

const student = ref(null);
const loading = ref(true);
const carreras = ref([]);
const materias = ref([]);
const selectedCarrera = ref("");
const showModal = ref(false);
const showConfirmModal = ref(false);
const carreraParaInscribir = ref(null);
const courseComp = ref(null);

const totalMaterias = computed(() => {
  return courseComp.value?.data?.total_materias_carrera ?? 0;
});

const aprobadasMaterias = computed(() => {
  return courseComp.value?.data?.materias_por_estado?.aprobadas ?? 0;
});

const completionPercentage = computed(() => {
  if (!totalMaterias.value) return 0;
  return ((aprobadasMaterias.value / totalMaterias.value) * 100).toFixed(0);
});

onMounted(async () => {
  try {
    const ci = localStorage.getItem("ci");
    const token = localStorage.getItem("token");
    if (ci) {
      const response = await api.get(`/estudiantes/${ci}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.data;
      student.value = data;
    }

    const carrerasResponse = await api.get("/carreras/disponibles", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const carreraData = await carrerasResponse.data;
    carreras.value = carreraData;

    const courseResponse = await api.get("/estudiantes/mi-carrera", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    courseComp.value = courseResponse.data;
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
  } finally {
    loading.value = false;
  }
});

async function verMaterias(carrera) {
  try {
    selectedCarrera.value = carrera.nombre;
    const localToken = localStorage.getItem("token");
    const materiasResponse = await api.get(
      `carreras/disponibles/${carrera.codigo}/materias`,
      {
        headers: { Authorization: `Bearer ${localToken}` },
      },
    );

    const materiasData = materiasResponse.data;
    materias.value = materiasData;
    showModal.value = true;
  } catch (error) {
    console.error("ERROR", error);
  }
}

function prepararInscripcion(carrera) {
  carreraParaInscribir.value = carrera;
  showConfirmModal.value = true;
}

async function inscribirse() {
  if (!carreraParaInscribir.value) return;

  try {
    showConfirmModal.value = false;
    loading.value = true;
    const locToken = localStorage.getItem("token");

    const inscResponse = await api.post(
      "/estudiantes/inscribirse",
      {
        codigo_carrera: carreraParaInscribir.value.codigo,
      },
      {
        headers: { Authorization: `Bearer ${locToken}` },
      },
    );

    if (inscResponse.data.success) {
      student.value = inscResponse.data;
    }
  } catch (error) {
    console.error("ERROR", error);
    alert("No se pudo completar la inscripción.");
  } finally {
    loading.value = false;
    carreraParaInscribir.value = null;
  }
}
</script>

<style scoped>
.title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: clamp(1.4rem, 3vw, 2.2rem);
  text-align: center;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.description {
  color: #787878;
  text-align: center;
  padding: 0 clamp(1rem, 6vw, 5rem);
  margin-top: 1rem;
  font-size: clamp(0.9rem, 1.5vw, 1rem);
  line-height: 1.6;
}

.main-container {
  margin-top: 1rem;
  background-color: white;
  padding: clamp(1rem, 3vw, 2rem);
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.two-group {
  display: flex;
  gap: 2rem;
  margin-top: 2.5rem;
  flex-wrap: wrap;
}

@media (max-width: 900px) {
  .two-group {
    flex-direction: column;
  }
}

.badges {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  flex: 1 1 300px;
  gap: 1rem;
}

.badge {
  cursor: default;
  user-select: none;
  display: flex;
  align-items: center;
  border-radius: 999px;
  font-size: clamp(0.7rem, 1.5vw, 0.9rem);
  font-weight: bold;
  padding: clamp(0.3rem, 1vw, 0.5rem) clamp(0.8rem, 2vw, 1.2rem);
  gap: 0.5rem;
  width: fit-content;
  max-width: 100%;
  flex-wrap: wrap;
}

.badge:nth-child(1) {
  background-color: rgb(105, 37, 0);
  color: rgb(255, 255, 158);
}

.badge:nth-child(2) {
  background-color: #00542e;
  color: #a0ffb6;
}

.badge:nth-child(3) {
  background-color: #450060;
  color: #f0c9ff;
}

.badge:nth-child(4) {
  background-color: #890000;
  color: #ffacac;
}

.information {
  display: flex;
  flex-direction: column;
  flex: 2 1 400px;
  padding: clamp(0.5rem, 2vw, 2rem);
}

.titu {
  margin-top: 1rem;
  font-weight: bold;
}

.carrera-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 20px;
  padding: clamp(1rem, 3vw, 2rem);
}

.carrera-card {
  background-color: white;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: clamp(1rem, 2vw, 1.5rem);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

.desc {
  margin: 0.5rem 0;
  color: #787878;
  font-size: clamp(0.85rem, 1.4vw, 0.95rem);
}

.specs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 1rem 0;
}

.spec {
  display: flex;
  cursor: default;
  user-select: none;
  align-items: center;
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  font-size: clamp(0.7rem, 1.2vw, 0.85rem);
  gap: 5px;
  white-space: nowrap;
}

.spec:nth-child(1) {
  background-color: #450060;
  color: #f0c9ff;
}

.spec:nth-child(2) {
  background-color: #00542e;
  color: #a0ffb6;
}

.spec:nth-child(3) {
  background-color: rgb(105, 37, 0);
  color: rgb(255, 255, 158);
}

.button-group {
  margin: 2rem 0 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.insc,
.vermas {
  cursor: pointer;
  padding: 0.6rem 1.5rem;
  min-width: 120px;
  border-radius: 6px;
  font-weight: 600;
  font-size: clamp(0.8rem, 1.2vw, 0.95rem);
}

.insc {
  background-color: #003cff;
  color: white;
  border: none;
}

.insc:hover {
  background-color: #002db3;
}

.vermas {
  background-color: transparent;
  border: none;
}

.vermas:hover {
  background-color: #dcdcdc;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: clamp(1rem, 3vw, 2rem);
  border-radius: 15px;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.materia-row {
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0.6rem;
  border-radius: 8px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
}

.detail {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.confirm-box {
  text-align: center;
  max-width: 500px;
}

.confirm-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.btn-cancel,
.btn-confirm {
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  border: none;
}

.btn-cancel {
  background-color: #eee;
}

.btn-cancel:hover {
  background-color: #ddd;
}

.btn-confirm {
  background-color: #003cff;
  color: white;
}

.btn-confirm:hover {
  background-color: #002db3;
}
</style>
