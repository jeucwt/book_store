<script setup lang="ts">
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <NavBar />
    <main class="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
      <RouterView />
    </main>
    <footer class="py-8 text-center text-sm text-muted">jeucwt bookshelf · thuê sách đọc trực tuyến</footer>
  </div>
</template>