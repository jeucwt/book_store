<script setup lang="ts">
defineProps<{ label: string; error?: string }>()
</script>

<template>
  <label class="block">
    <span class="mb-1 block text-sm font-semibold text-ink-2">{{ label }}</span>
    <slot />
    <span v-if="error" class="mt-1 block text-xs text-[#9a3b25]">{{ error }}</span>
  </label>
</template>