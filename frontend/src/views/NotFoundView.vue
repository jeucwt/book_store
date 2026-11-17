<template>
  <div class="py-16 text-center">
    <h1 class="text-5xl font-semibold">404</h1>
    <p class="mt-2 text-muted">Không tìm thấy trang.</p>
    <RouterLink :to="{ name: 'kham-pha' }" class="btn-primary mt-4">Về trang chủ</RouterLink>
  </div>
</template>