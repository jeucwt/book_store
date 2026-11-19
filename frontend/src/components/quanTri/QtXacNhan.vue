<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{ mo: boolean; tieuDe: string; noiDung: string; nhanXacNhan?: string; dangXuLy?: boolean }>(),
  { nhanXacNhan: 'Xóa', dangXuLy: false },
)
const emit = defineEmits<{ (e: 'xacNhan'): void; (e: 'huy'): void }>()

const nutHuy = ref<HTMLButtonElement | null>(null)

function huy() {
  if (!props.dangXuLy) emit('huy')
}

function onKey(ev: KeyboardEvent) {
  if (ev.key === 'Escape') huy()
}

watch(
  () => props.mo,
  (v) => {
    if (v) {
      document.addEventListener('keydown', onKey)
      nextTick(() => nutHuy.value?.focus())
    } else {
      document.removeEventListener('keydown', onKey)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="mo"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-4"
      @click.self="huy"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="qt-xn-tieu-de"
        class="w-full max-w-md rounded-2xl border border-line bg-paper p-6 shadow-lg"
      >
        <h2 id="qt-xn-tieu-de" class="font-display text-xl font-semibold text-ink">{{ tieuDe }}</h2>
        <p class="mt-2 text-sm text-ink-2">{{ noiDung }}</p>
        <div class="mt-6 flex justify-end gap-2">
          <button ref="nutHuy" type="button" class="btn-outline" :disabled="dangXuLy" @click="huy">Hủy</button>
          <button
            type="button"
            class="rounded-xl bg-clay-dark px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            :disabled="dangXuLy"
            @click="emit('xacNhan')"
          >
            {{ dangXuLy ? 'Đang xử lý…' : nhanXacNhan }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>