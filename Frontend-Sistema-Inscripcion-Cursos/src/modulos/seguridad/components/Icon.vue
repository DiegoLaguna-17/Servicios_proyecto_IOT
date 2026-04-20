<template>
  <div v-if="icons && icons[iconName]">
    <router-link v-if="to" :to="to" class="icon-group">
      <div v-html="icons[iconName]" :style="{ color: iconColor }"></div>
      <p v-if="message" :style="{ color: iconColor }">{{ message }}</p>
    </router-link>

    <div v-else class="icon-group">
      <div v-html="icons[iconName]" :style="{ color: iconColor }"></div>
      <p v-if="message" :style="{ color: iconColor }">{{ message }}</p>
    </div>
  </div>

  <div v-else>No Icon</div>
</template>

<script setup>
import { icons } from "@/icons/lib.js";
defineProps({
  to: {
    type: String,
    required: false,
  },
  iconName: {
    type: String,
    required: true,
  },
  iconColor: {
    type: String,
    default: "black",
  },
  message: {
    type: String,
    required: false,
    default: "",
  },
});
</script>

<style scoped>
.icon-group {
  display: flex;
  flex-direction: row;
  text-decoration: none;
  justify-content: center;
  align-items: flex-start;
  gap: 6px;
}
</style>
