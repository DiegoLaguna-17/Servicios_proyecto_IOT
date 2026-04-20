<template>
    <div class="wrapper">
        <div class="title-row">
        <h1>Estado académico de mis materias</h1>

        <button class="volver-btn" @click="volver">
            Volver
        </button>
        </div>

        <div class="head">
        <div class="search">
            <SearchBar @update:search="searchTerm = $event" />
        </div>

        <div class="filter-container">
            <select v-model="estadoFiltro">
            <option value="">Filtrar por estado</option>
            <option value="EN_CURSO">Activo</option>
            <option value="APROBADA">Aprobado</option>
            <option value="REPROBADA">Reprobado</option>
            </select>
        </div>

        <button class="archivadas-btn" @click="abrirArchivadas">
            <i class="fa-solid fa-box-archive"></i>
            Materias archivadas
        </button>
        </div>

        <div class="container">
        <CursoEstadoCard
            v-for="curso in filteredEnCurso"
            :key="curso.id_materia + '-' + (curso.id_inscripcion || '')"
            :curso="curso"
            @view="irMiProgreso"
        />
        </div>

        <ModalMateriasCulminadas
        v-if="modalArchivadas"
        :materias="filteredArchivadas"
        @close="modalArchivadas = false"
        @view="irMiProgreso"
        />
    </div>
</template>

    <script setup>
    import { ref, computed, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import SearchBar from '../components/SearchBar.vue'
    import CursoEstadoCard from '../components/CursoEstadoCard.vue'
    import ModalMateriasCulminadas from '../components/ModalMateriasCulminadas.vue'
    import {
    listarMateriasEnCurso,
    listarMateriasCulminadas
    } from '../services/estudianteService'

    const router = useRouter()

    const searchTerm = ref("")
    const estadoFiltro = ref("")
    const materiasEnCurso = ref([])
    const materiasArchivadas = ref([])
    const modalArchivadas = ref(false)

    const normalizarEstadoAcademico = (estado) => {
    if (!estado) return ""
    return String(estado).toUpperCase().trim()
    }

    const abrirArchivadas = () => {
    modalArchivadas.value = true
    }

    const irMiProgreso = (curso) => {
    modalArchivadas.value = false
    router.push({
        name: "miProgreso",
        params: {
        id_materia: curso.id_materia
        }
    })
}


    const volver = () => {
    router.back()
    }

    const filteredEnCurso = computed(() => {
    let resultado = materiasEnCurso.value.filter(
        (curso) => normalizarEstadoAcademico(curso.estado_academico) === 'EN_CURSO'
    )

    if (searchTerm.value) {
        resultado = resultado.filter(
        (curso) =>
            curso.nombre?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            curso.id_materia?.toString().includes(searchTerm.value)
        )
    }

    if (estadoFiltro.value) {
        resultado = resultado.filter(
        (curso) =>
            normalizarEstadoAcademico(curso.estado_academico) === normalizarEstadoAcademico(estadoFiltro.value)
        )
    }

    return resultado
    })

    const filteredArchivadas = computed(() => {
    let resultado = materiasArchivadas.value.filter((curso) => {
        const estado = normalizarEstadoAcademico(curso.estado_academico)
        return estado === 'APROBADA' || estado === 'REPROBADA'
    })

    if (searchTerm.value) {
        resultado = resultado.filter(
        (curso) =>
            curso.nombre?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            curso.id_materia?.toString().includes(searchTerm.value)
        )
    }

    if (estadoFiltro.value) {
        const filtro = normalizarEstadoAcademico(estadoFiltro.value)
        resultado = resultado.filter(
        (curso) => normalizarEstadoAcademico(curso.estado_academico) === filtro
        )
    }

    return resultado
    })

    const mapearInscripcionesAMaterias = (inscripciones = []) => {
    return inscripciones.flatMap(inscripcion =>
        (inscripcion.materias || []).map(m => ({
        ...m.materia,
        estado: m.estado,
        estado_academico: m.estado_academico,
        id_inscripcion: inscripcion.id_inscripcion,
        fecha_inscripcion: inscripcion.fecha_inscripcion,
        fecha_retiro: m.fecha_retiro || null,
        fecha_culminacion: m.fecha_fin || null
        }))
    )
    }

    const cargarMateriasEnCurso = async () => {
    try {
        const response = await listarMateriasEnCurso()

        console.log("RESPUESTA EN_CURSO:", response)

        const inscripciones = response?.data?.data || []
        materiasEnCurso.value = mapearInscripcionesAMaterias(inscripciones)

        console.log("MATERIAS EN CURSO MAPEADAS:", materiasEnCurso.value)
    } catch (error) {
        console.log("Error al obtener materias en curso:", error?.response?.data || error)
        materiasEnCurso.value = []
    }
    }

    const cargarMateriasArchivadas = async () => {
    try {
        const response = await listarMateriasCulminadas()

        console.log("RESPUESTA CULMINADAS:", response)

        const inscripciones = response?.data?.data || []
        materiasArchivadas.value = mapearInscripcionesAMaterias(inscripciones)

        console.log("MATERIAS ARCHIVADAS MAPEADAS:", materiasArchivadas.value)
    } catch (error) {
        console.log("Error al obtener materias culminadas:", error?.response?.data || error)
        materiasArchivadas.value = []
    }
}

onMounted(async () => {
    await Promise.all([
        cargarMateriasEnCurso(),
        cargarMateriasArchivadas()
    ])
})
</script>

<style scoped>
.wrapper {
    padding: 40px;
}

.title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
}

.volver-btn {
    border: none;
    background: #6fb3cf;
    color: #fff;
    border-radius: 999px;
    padding: 10px 20px;
    font-weight: 600;
    cursor: pointer;
}

.head {
    display: flex;
    gap: 20px;
    background: #fff;
    padding: 16px;
    border-radius: 12px;
    align-items: center;
}

.search {
    width: 55%;
}

.filter-container {
    width: 25%;
}

.archivadas-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    border: none;
    border-radius: 10px;
    padding: 10px 14px;
    background: #59b3c8;
    color: white;
    cursor: pointer;
    font-weight: 600;
    transition: 0.2s ease;
}

.archivadas-btn:hover {
    background: #4aa2b6;
}

.container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 25px;
    margin-top: 30px;
}

select {
    width: 100%;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid #ddd;
    background-color: #fff;
}
</style>