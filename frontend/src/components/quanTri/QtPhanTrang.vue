<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ page: number; totalPages: number; total: number; limit: number }>()
const emit = defineEmits<{ (e: 'doiTrang', n: number): void }>()

const tu = computed(() => (props.total === 0 ? 0 : (props.page - 1) * props.limit + 1))
const den = computed(() => Math.min(props.page * props.limit, props.total))

// 1 ... p-1 p p+1 ... cuối
const cacTrang = computed(() => {
  const t = props.totalPages
  const p = props.page
  const ds = [...new Set([1, t, p - 1, p, p + 1])].filter((n) => n >= 1 && n <= t).sort((a, b) => a - b)
  const kq: (number | '...')[] = []
  ds.forEach((n, i) => {
    if (i > 0 && n - ds[i - 1]! > 1) kq.push('...')
    kq.push(n)
  })
  return kq
})

function di(n: number) {
  if (n < 1 || n > props.totalPages || n === props.page) return
  emit('doiTrang', n)
}

const nutCoBan =
  'min-w-9 rounded-lg border border-line px-2.5 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40'
</script>

<template>
  <div v-if="total > 0" class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
    <span>Hiển thị {{ tu }}–{{ den }} / {{ total }}</span>
    <nav v-if="totalPages > 1" class="flex items-center gap-1" aria-label="Phân trang">
      <button type="button" :class="[nutCoBan, 'hover:bg-sand-2']" :disabled="page <= 1" @click="di(page - 1)">
        ‹
      </button>
      <template v-for="(n, i) in cacTrang" :key="i">
        <span v-if="n === '...'" class="px-1">…</span>
        <button
          v-else
          type="button"
          :class="[nutCoBan, n === page ? 'bg-sand-3 font-semibold text-ink' : 'text-ink-2 hover:bg-sand-2']"
          :aria-current="n === page ? 'page' : undefined"
          @click="di(n)"
        >
          {{ n }}
        </button>
      </template>
      <button
        type="button"
        :class="[nutCoBan, 'hover:bg-sand-2']"
        :disabled="page >= totalPages"
        @click="di(page + 1)"
      >
        ›
      </button>
    </nav>
  </div>
</template>