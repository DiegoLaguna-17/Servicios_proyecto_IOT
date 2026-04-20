<template>
  <div
    v-if="icons && iconName && icons[iconName]"
    v-html="icons[iconName]"
    :style="{ color: iconColor }"
  ></div>

  <div v-else class="no-icon">
    No Icon
  </div>
</template>

<script setup>
import { icons } from "@/icons/lib.js";

defineProps({
  iconName: {
    type: String,
    required: true,
  },
  iconColor: {
    type: String,
    default: "black",
  },
});
</script>

<style scoped>
.no-icon{
  display:none; /* evita mostrar el mensaje en producción */
}
</style>