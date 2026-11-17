<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
const auth = useAuthStore()
</script>

<template>
  <div class="card-paper">
    <h1 class="text-3xl font-semibold">Trang quản trị</h1>
    <p class="mt-2 text-slate-600">
      Xin chào {{ auth.tenHienThi }} ({{ auth.user?.MSNV }} · {{ auth.nhanVaiTro }}).
    </p>
    <p class="mt-1 text-sm text-muted">Giao diện quản trị sẽ làm ở Phần 8.</p>
  </div>
</template>