<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { bamChuoi } from '../utils/hash'

type Mau = { bg: string; text: string }
const MAU: Mau[] = [
  { bg: '#b8644a', text: '#fff8ee' },
  { bg: '#3f5a48', text: '#fff8ee' },
  { bg: '#d6a24a', text: '#33241d' },
  { bg: '#6e4150', text: '#fff8ee' },
  { bg: '#8fa5b3', text: '#33241d' },
  { bg: '#ddaa9c', text: '#33241d' },
  { bg: '#8c7b5a', text: '#fff8ee' },
  { bg: '#34454f', text: '#fff8ee' },
]

// Lấp đầy khung cha: cha quyết định kích thước (aspect-[2/3], w-.., h-..)
const props = defineProps<{ anh?: string; ten: string }>()
const loi = ref(false)
watch(() => props.anh, () => (loi.value = false))
const mau = computed(() => MAU[bamChuoi(props.ten) % MAU.length] as Mau)
</script>

<template>
  <div
    class="book relative h-full w-full overflow-hidden rounded-[3px_8px_8px_3px] shadow-[0_8px_16px_rgba(58,42,34,0.2)] [container-type:inline-size]"
    :style="anh && !loi ? undefined : { background: mau.bg, color: mau.text }"
  >
    <img v-if="anh && !loi" :src="anh" :alt="ten" loading="lazy" class="h-full w-full object-cover" @error="loi = true" />
    <template v-else>
      <i class="absolute right-[16%] top-[14%] aspect-square w-[34%] rounded-full bg-[#fff0d7]/40"></i>
      <span
        class="absolute inset-x-0 bottom-0 p-[9cqw] font-display font-semibold leading-tight"
        :style="{ fontSize: 'clamp(11px, 11cqw, 32px)' }"
      >{{ ten }}</span>
    </template>
    <i class="absolute inset-y-0 left-0 w-[5px] bg-black/10"></i>
  </div>
</template>