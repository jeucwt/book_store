<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <div class="card-paper text-center">
    <h1 class="text-3xl font-semibold">Trình đọc sách</h1>
    <p class="mt-2 text-muted">Trình đọc lật trang sẽ làm ở Phần 6 (sách: {{ route.params.id }}).</p>
    <RouterLink :to="{ name: 'chi-tiet-sach', params: { id: String(route.params.id) } }" class="btn-outline mt-4">Quay lại chi tiết sách</RouterLink>
  </div>
</template>