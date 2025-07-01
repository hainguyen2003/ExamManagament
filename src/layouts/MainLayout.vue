<template>
  <div class="layout-wrapper" v-if="user">
 
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const user = ref(null);
const router = useRouter();

onMounted(() => {
  const auth = localStorage.getItem('auth');
  if (auth) user.value = JSON.parse(auth);
  else router.replace('/login');
});
</script>
