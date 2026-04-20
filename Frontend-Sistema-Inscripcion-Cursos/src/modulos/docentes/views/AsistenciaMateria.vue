<template>
  <div class="contenedor">

    <h2>Registro de Asistencia</h2>
    <p class="subtitulo">
      Aquí puedes registrar las asistencias de los estudiantes
    </p>

    <!-- Botón para iniciar registro SIEMPRE visible -->
    <div class="barra-acciones">
      <button class="btn-agregar-fecha" @click="abrirModalFecha">
        + Registrar Nueva Asistencia
      </button>
    </div>

    <!-- Modal para agregar nueva fecha -->
    <div v-if="mostrarModalFecha" class="modal-overlay" @click.self="cerrarModalFecha">
      <div class="modal-contenido">
        <h3>Registrar Nueva Fecha de Asistencia</h3>
        
        <div class="campo-fecha">
          <label>Seleccione la fecha:</label>
          <input 
            type="date" 
            v-model="nuevaFecha"
            :max="fechaActual"
            class="input-fecha"
          >
        </div>

        <div class="modal-acciones">
          <button class="btn-cancelar" @click="cerrarModalFecha">
            Cancelar
          </button>
          <button 
            class="btn-confirmar" 
            @click="confirmarNuevaFecha"
            :disabled="!nuevaFecha"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para guardar -->
    <div v-if="mostrarModalConfirmacion" class="modal-overlay" @click.self="cerrarModalConfirmacion">
      <div class="modal-contenido modal-confirmacion">
        <h3>Confirmar Registro de Asistencia</h3>
        
        <div class="mensaje-advertencia">
          Una vez guardada la asistencia, NO se podrá modificar
        </div>

        <!-- Lista de estudiantes sin marcar -->
        <div v-if="estudiantesSinMarcar.length > 0" class="lista-pendientes">
          <p><strong>Estudiantes sin asistencia marcada:</strong></p>
          <p class="nota">(Se les asignará FALTA por defecto)</p>
          <ul>
            <li v-for="est in estudiantesSinMarcar" :key="est.id_estudiante">
              {{ est.nombre }}
            </li>
          </ul>
        </div>

        <div v-else class="mensaje-exito">
          ✓ Todos los estudiantes tienen su asistencia marcada
        </div>

        <div class="fecha-confirmacion">
          <strong>Fecha a registrar:</strong> {{ formatearFecha(nuevaFechaActual) }}
        </div>

        <div class="modal-acciones">
          <button class="btn-cancelar" @click="cerrarModalConfirmacion">
            Cancelar
          </button>
          <button 
            class="btn-confirmar-guardar" 
            @click="confirmarGuardado"
          >
            Sí, Guardar Asistencia
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para cancelar -->
    <div v-if="mostrarModalCancelar" class="modal-overlay" @click.self="cerrarModalCancelar">
      <div class="modal-contenido modal-confirmacion">
        <h3>Cancelar Registro</h3>

        <div class="mensaje-advertencia">
          Se perderán todos los cambios no guardados
        </div>

        <div class="modal-acciones">
          <button class="btn-cancelar" @click="cerrarModalCancelar">
            Volver
          </button>
          <button class="btn-confirmar-guardar" @click="confirmarCancelacion">
            Sí, Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de éxito -->
    <div v-if="mostrarModalExito" class="modal-overlay" @click.self="cerrarModalExito">
      <div class="modal-contenido modal-confirmacion">
        <h3>Registro Exitoso</h3>

        <div class="mensaje-exito">
          {{ mensajeExito }}
        </div>

        <div class="modal-acciones">
          <button class="btn-confirmar-guardar" @click="cerrarModalExito">
            Aceptar
          </button>
        </div>
      </div>
    </div>

    <!-- Contenedor con scroll horizontal -->
    <div class="tabla-contenedor" v-if="tieneFechas">
      <table class="tabla">
        <thead>
          <tr>
            <th class="columna-fija nombre-col">Nombre del Estudiante</th>
            <th class="columna-fija porcentaje-col">% Asistencia</th>

            <!-- Fechas ordenadas de más reciente a más antigua (izquierda a derecha) -->
            <th 
              v-for="fecha in fechasOrdenadas" 
              :key="fecha"
              class="fecha-col"
              :class="{ 'fecha-actual': fecha === nuevaFechaActual && modoRegistro }"
            >
              <div class="encabezado-fecha">
                <span>{{ formatearFecha(fecha) }}</span>
                <span v-if="fecha === nuevaFechaActual && modoRegistro" class="badge-nuevo">
                  Nuevo
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="estudiante in estudiantes" :key="estudiante.id_estudiante">
            <!-- Columna fija: Nombre -->
            <td class="columna-fija nombre">{{ estudiante.nombre }}</td>
            
            <!-- Columna fija: % Asistencia -->
            <td class="columna-fija porcentaje">
                <span 
                    class="porcentaje-valor"
                    :class="{
                    'alto': estudiante.porcentajeAsistencia >= 70,
                    'bajo': estudiante.porcentajeAsistencia < 70
                    }"
                >
                    {{ estudiante.porcentajeAsistencia }}%
                </span>
            </td>

            <!-- Columnas de fechas -->
            <td 
              v-for="fecha in fechasOrdenadas" 
              :key="fecha"
              class="asistencia-col"
            >
              <!-- Si es la fecha actual y estamos en modo registro, se puede editar -->
              <button 
                v-if="fecha === nuevaFechaActual && modoRegistro"
                class="btn-estado"
                :class="{
                  'presente': estudiante.asistenciasTemp[fecha] === true,
                  'ausente': estudiante.asistenciasTemp[fecha] === false,
                  'pendiente': estudiante.asistenciasTemp[fecha] === undefined || estudiante.asistenciasTemp[fecha] === null
                }"
                @click="cambiarAsistenciaTemp(estudiante, fecha)"
              >
                <span v-if="estudiante.asistenciasTemp[fecha] === true">✓</span>
                <span v-else-if="estudiante.asistenciasTemp[fecha] === false">✗</span>
                <span v-else class="pendiente">-</span>
              </button>

              <!-- Si es fecha guardada, solo se muestra (no se puede editar) -->
              <div v-else class="asistencia-lectura">
                <span 
                  class="icono-asistencia"
                  :class="{
                    'presente': estudiante.asistencias[fecha] === true,
                    'ausente': estudiante.asistencias[fecha] === false,
                    'sin-registro': estudiante.asistencias[fecha] === undefined || estudiante.asistencias[fecha] === null
                  }"
                >
                  {{ obtenerIconoAsistencia(estudiante.asistencias[fecha]) }}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mensaje cuando no hay fechas registradas -->
    <div v-else class="sin-datos-mensaje">
      <p>No hay asistencias registradas para esta materia</p>
      <p class="subtitulo-mensaje">Haz clic en "Registrar Nueva Asistencia" para comenzar</p>
    </div>

    <!-- Botones de acción (solo visibles en modo registro) -->
    <div v-if="modoRegistro" class="acciones-finales">
      <button class="btn-cancelar" @click="cancelarRegistro">
        Cancelar
      </button>
      <button 
        class="btn-guardar" 
        @click="abrirModalConfirmacion"
      >
        Guardar Asistencia
      </button>
    </div>
  </div>
</template>

<script setup>
import { obtenerHistorialMateria, registrarAsistenciaClase } from "../services/asistenciaService";
import { ref, computed, onMounted, watch } from "vue" // Agregué watch aquí
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const materiaId = route.params.id_materia
const router = useRouter()

// 1. PRIMERO: Declarar los refs
const estudiantes = ref([])
const modoRegistro = ref(false)
const mostrarModalFecha = ref(false)
const mostrarModalConfirmacion = ref(false)
const mostrarModalCancelar = ref(false)
const mostrarModalExito = ref(false)
const mensajeExito = ref("")
const nuevaFecha = ref("")
const nuevaFechaActual = ref("")

// 2. DESPUÉS: Computed properties que dependen de estudiantes
const tieneFechas = computed(() => {
  return fechasOrdenadas.value.length > 0
})

const todasLasFechas = computed(() => {
  const fechasSet = new Set()
  // Aquí ya podemos usar estudiantes.value porque ya está declarado
  estudiantes.value.forEach(est => {
    Object.keys(est.asistencias).forEach(fecha => {
      if (fecha && fecha !== 'undefined' && fecha !== 'null' && fecha.trim() !== '') {
        fechasSet.add(fecha)
      }
    })
  })
  return Array.from(fechasSet)
})

const fechasOrdenadas = computed(() => {
  const fechas = todasLasFechas.value.filter(fecha => {
    return fecha && fecha !== 'undefined' && fecha !== 'null' && fecha.trim() !== ''
  })
  
  return fechas.sort((a, b) => {
    return new Date(b) - new Date(a)
  })
})

const estudiantesSinMarcar = computed(() => {
  if (!nuevaFechaActual.value) return []
  
  return estudiantes.value.filter(est => {
    const temp = est.asistenciasTemp[nuevaFechaActual.value]
    return temp === undefined || temp === null
  })
})

const fechaActual = computed(() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

// 3. FUNCIONES
const obtenerIconoAsistencia = (estado) => {
  if (estado === true) return '✓'
  if (estado === false) return '✗'
  return '-'
}

const formatearFecha = (fecha) => {
  if (!fecha || fecha === 'undefined' || fecha === 'null') return 'Fecha inválida'
  const [year, month, day] = fecha.split('-')
  return `${day}/${month}/${year}`
}

const calcularPorcentajes = () => {
  // Verificar que estudiantes existe antes de usarlo
  if (!estudiantes.value) return
  
  estudiantes.value.forEach(est => {
    const asistencias = Object.values(est.asistencias).filter(val => val !== undefined && val !== null)
    const total = asistencias.length
    if (total > 0) {
      const presentes = asistencias.filter(a => a === true).length
      est.porcentajeAsistencia = Math.round((presentes / total) * 100)
    } else {
      est.porcentajeAsistencia = 0
    }
  })
}

const abrirModalFecha = () => {
  nuevaFecha.value = ""
  mostrarModalFecha.value = true
}

const cerrarModalFecha = () => {
  mostrarModalFecha.value = false
  nuevaFecha.value = ""
}

const confirmarNuevaFecha = () => {
  if (!nuevaFecha.value) return

  if (todasLasFechas.value.includes(nuevaFecha.value)) {
    alert("Esta fecha ya ha sido registrada")
    return
  }

  if (!modoRegistro.value) {
    modoRegistro.value = true
  }
  
  nuevaFechaActual.value = nuevaFecha.value
  
  estudiantes.value.forEach(est => {
    est.asistencias[nuevaFecha.value] = null
    est.asistenciasTemp[nuevaFecha.value] = null
  })

  cerrarModalFecha()
}

const cambiarAsistenciaTemp = (estudiante, fecha) => {
  if (!modoRegistro.value || fecha !== nuevaFechaActual.value) return
  
  const estadoActual = estudiante.asistenciasTemp[fecha]
  
  if (estadoActual === null || estadoActual === undefined) {
    estudiante.asistenciasTemp[fecha] = true
  } else if (estadoActual === true) {
    estudiante.asistenciasTemp[fecha] = false
  } else {
    estudiante.asistenciasTemp[fecha] = null
  }
}

const abrirModalConfirmacion = () => {
  mostrarModalConfirmacion.value = true
}

const cerrarModalConfirmacion = () => {
  mostrarModalConfirmacion.value = false
}

const cerrarModalExito = () => {
  mostrarModalExito.value = false
}

const confirmarGuardado = async () => {
  try {
    const asistenciasPayload = estudiantes.value.map(est => {
      const temp = est.asistenciasTemp[nuevaFechaActual.value];
      const estado = temp === true ? true : false;

      return {
        ci: est.id_estudiante,
        estado: estado
      };
    });

    const payload = {
      fecha: nuevaFechaActual.value,
      asistencias: asistenciasPayload
    };

    const resp = await registrarAsistenciaClase(materiaId, payload);

    estudiantes.value.forEach(est => {
      const temp = est.asistenciasTemp[nuevaFechaActual.value];
      est.asistencias[nuevaFechaActual.value] = temp === true ? true : false;
    });

    calcularPorcentajes();

    estudiantes.value.forEach(est => {
      delete est.asistenciasTemp[nuevaFechaActual.value];
    });

    modoRegistro.value = false;
    nuevaFechaActual.value = "";

    mensajeExito.value = resp.mensaje || "Asistencia guardada correctamente";
    mostrarModalExito.value = true;

    cerrarModalConfirmacion();

  } catch (err) {
    console.error(err);
  }
};

const cancelarRegistro = () => {
  mostrarModalCancelar.value = true
}

const cerrarModalCancelar = () => {
  mostrarModalCancelar.value = false
}

const confirmarCancelacion = () => {
  estudiantes.value.forEach(est => {
    delete est.asistenciasTemp[nuevaFechaActual.value]
    delete est.asistencias[nuevaFechaActual.value]
  })

  modoRegistro.value = false
  nuevaFechaActual.value = ""
  mostrarModalCancelar.value = false
}

// 4. onMounted para cargar datos
onMounted(async () => {
  try {
    const resp = await obtenerHistorialMateria(materiaId);
    console.log("Historial de asistencias:", resp)
    const historial = resp.data;

    estudiantes.value = historial.map(est => {
      const asistenciasObj = {};

      if (est.asistencias && Array.isArray(est.asistencias)) {
        est.asistencias.forEach(a => {
          if (a.fecha && a.fecha !== 'undefined' && a.fecha !== 'null') {
            asistenciasObj[a.fecha] = a.estado;
          }
        });
      }

      return {
        id_estudiante: est.ci,
        nombre: est.nombre,
        asistencias: asistenciasObj,
        asistenciasTemp: {}
      };
    });

    calcularPorcentajes();

  } catch (err) {
    console.error("Error cargando historial:", err);
  }
});

// 5. Watch para debug
watch(todasLasFechas, (nuevasFechas) => {
  console.log("Fechas actualizadas:", nuevasFechas)
})
</script>

<style scoped>
.contenedor {
  padding: 30px;
}

.subtitulo {
  color: #777;
  margin-bottom: 20px;
}

.barra-acciones {
  margin-bottom: 20px;
}

.btn-agregar-fecha {
  background: #f2b705;
  border: 1px solid #000000;
  padding: 10px 25px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-agregar-fecha:hover {
  background: #fdd661;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-contenido {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
}

.modal-confirmacion {
  width: 550px;
}

.modal-contenido h3 {
  margin-bottom: 20px;
  color: #333;
}

.campo-fecha {
  margin-bottom: 20px;
}

.campo-fecha label {
  display: block;
  margin-bottom: 8px;
  color: #555;
}

.input-fecha {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.modal-acciones {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancelar {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
}

.btn-cancelar:hover {
  background: #f5f5f5;
}

.btn-confirmar {
  padding: 8px 16px;
  background: #f2b705;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}

.btn-confirmar:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-confirmar-guardar {
  padding: 8px 16px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}

.btn-confirmar-guardar:hover {
  background: #45a049;
}

.mensaje-advertencia {
  background: #fff3cd;
  color: #856404;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-weight: bold;
  text-align: center;
}

.lista-pendientes {
  background: #ffebee;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  max-height: 200px;
  overflow-y: auto;
}

.lista-pendientes p {
  margin: 5px 0;
}

.lista-pendientes .nota {
  color: #c62828;
  font-size: 0.9em;
  font-style: italic;
}

.lista-pendientes ul {
  margin: 10px 0 0 20px;
  color: #333;
}

.mensaje-exito {
  background: #d4edda;
  color: #155724;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  text-align: center;
}

.fecha-confirmacion {
  background: #e3f2fd;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  text-align: center;
}

/* Tabla */
.tabla-contenedor {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #5ca6d4;
  border-radius: 8px;
  background: white;
  margin: 20px 0;
}

.tabla {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.tabla th,
.tabla td {
  border: 1px solid #5ca6d4;
  padding: 12px;
  text-align: center;
}

.columna-fija {
  background: white;
  position: sticky;
  left: 0;
  z-index: 2;
  border-right: 2px solid #5ca6d4;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
}

.nombre-col {
  min-width: 250px;
  left: 0;
  background: #f5f5f5;
}

.porcentaje-col {
  min-width: 120px;
  left: 250px;
  background: #f5f5f5;
}

.nombre {
  text-align: left;
  font-weight: 500;
  min-width: 250px;
  left: 0;
  background: white;
}

.porcentaje {
  min-width: 120px;
  left: 250px;
  background: white;
}

.porcentaje-valor {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.porcentaje-valor.alto {
  background: #b9f6c5;
  color: #2e7d32;
}

.porcentaje-valor.bajo {
  background: #ffc3c3;
  color: #c62828;
}

.fecha-col {
  min-width: 100px;
  background: #f5f5f5;
}

.fecha-actual {
  background: #fff3cd;
}

.encabezado-fecha {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.badge-nuevo {
  background: #f2b705;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
}

.asistencia-col {
  min-width: 100px;
}

.btn-estado {
  width: 40px;
  height: 40px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.btn-estado.presente {
  background: #b9f6c5;
  border-color: #2e7d32;
  color: #2e7d32;
}

.btn-estado.ausente {
  background: #ffc3c3;
  border-color: #c62828;
  color: #c62828;
}

.btn-estado.pendiente {
  border-color: #999;
  color: #999;
  background: #f5f5f5;
}

.btn-estado:hover {
  transform: scale(1.1);
}

.asistencia-lectura {
  display: flex;
  justify-content: center;
  align-items: center;
}

.icono-asistencia {
  display: inline-block;
  width: 30px;
  height: 30px;
  line-height: 30px;
  border-radius: 50%;
  font-size: 16px;
  font-weight: bold;
}

.icono-asistencia.presente {
  background: #b9f6c5;
  color: #2e7d32;
}

.icono-asistencia.ausente {
  background: #ffc3c3;
  color: #c62828;
}

.acciones-finales {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
}

.btn-guardar {
  background: #f2b705;
  border: none;
  padding: 10px 25px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-guardar:hover {
  background: #d9a104;
}

/* Nuevos estilos para el mensaje de sin datos */
.sin-datos-mensaje {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #5ca6d4;
  margin: 20px 0;
}

.sin-datos-mensaje p {
  font-size: 18px;
  color: #666;
  margin: 10px 0;
}

.sin-datos-mensaje .subtitulo-mensaje {
  font-size: 14px;
  color: #999;
  font-style: italic;
}

/* Nuevo estilo para el icono de sin registro */
.icono-asistencia.sin-registro {
  background: #e0e0e0;
  color: #666;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 18px;
  font-weight: bold;
}
</style>