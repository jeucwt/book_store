<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ page: number; totalPages: number }>()
const emit = defineEmits<{ (e: 'doi-trang', p: number): void }>()

const cacTrang = computed(() => {
  const ds: (number | '...')[] = []
  const tu = Math.max(1, props.page - 2)
  const den = Math.min(props.totalPages, props.page + 2)
  if (tu > 1) {
    ds.push(1)
    if (tu > 2) ds.push('...')
  }
  for (let i = tu; i <= den; i++) ds.push(i)
  if (den < props.totalPages) {
    if (den < props.totalPages - 1) ds.push('...')
    ds.push(props.totalPages)
  }
  return ds
})
</script>

<template>
  <nav v-if="totalPages > 1" class="mt-10 flex flex-wrap items-center justify-center gap-1.5">
    <button class="btn-outline" :disabled="page <= 1" @click="emit('doi-trang', page - 1)">‹ Trước</button>
    <template v-for="(p, i) in cacTrang" :key="i">
      <span v-if="p === '...'" class="px-2 text-muted">…</span>
      <button v-else class="chip min-w-10" :class="{ 'chip-on': p === page }" @click="emit('doi-trang', p)">{{ p }}</button>
    </template>
    <button class="btn-outline" :disabled="page >= totalPages" @click="emit('doi-trang', page + 1)">Sau ›</button>
  </nav>
</template>