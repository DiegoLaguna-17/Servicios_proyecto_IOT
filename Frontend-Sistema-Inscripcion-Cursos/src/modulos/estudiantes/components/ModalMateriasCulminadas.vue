<template>
    <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-content">
        <div class="top">
            <h2>Materias culminadas</h2>
            <button class="close-btn" @click="$emit('close')">×</button>
        </div>

        <div class="cards-container">
            <CursoEstadoCard
            v-for="curso in materias"
            :key="curso.id_materia + '-' + (curso.id_inscripcion || '')"
            :curso="curso"
            @view="$emit('view', curso)"
            />
        </div>
        </div>
    </div>
</template>

<script setup>
import CursoEstadoCard from './CursoEstadoCard.vue'

defineProps({
    materias: {
        type: Array,
        default: () => []
    }
})

defineEmits(['close', 'view'])
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.35);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    width: 85%;
    max-width: 1200px;
    max-height: 80vh;
    overflow-y: auto;
    background: white;
    border-radius: 12px;
    padding: 24px;
}

.top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 22px;
}

.close-btn {
    border: none;
    background: transparent;
    font-size: 32px;
    cursor: pointer;
}

.cards-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
}
</style>