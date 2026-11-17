<script setup lang="ts">
import type { Sach } from '../types'
import BookCover from './BookCover.vue'

defineProps<{ sach: Sach }>()
</script>

<template>
  <RouterLink :to="{ name: 'chi-tiet-sach', params: { id: sach._id } }" class="group block">
    <div class="aspect-[2/3] transition duration-200 group-hover:-translate-y-1">
      <BookCover :anh="sach.AnhBia" :ten="sach.TenSach" />
    </div>
    <h3 class="mt-3 line-clamp-2 text-base font-semibold group-hover:text-clay-dark">{{ sach.TenSach }}</h3>
    <p class="mt-0.5 line-clamp-1 text-[13px] text-muted">{{ sach.TacGia }} · {{ sach.TheLoai }}</p>
  </RouterLink>
</template>