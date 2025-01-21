<template>
    <q-header id="toolBar" reveal class="bg-primary text-white">
      <div class="titlebar">
        <q-toolbar>
          <q-avatar>
            <img src="~assets/Comb-bot_logo.svg" alt="Comb-bot Logo" @click="goToHomepage" />
          </q-avatar>
          <q-toolbar-title>Comb-Bot</q-toolbar-title>
          <q-space/>
            <q-btn  rounded label="Login" @click="goToLogin" />
        </q-toolbar>
      </div>
    </q-header>
</template>  

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function goToLogin() {
  router.push('/login'); 
}

function goToHomepage() {
  router.push('/'); 
}
</script>

<style scoped>
.titlebar {
  max-width: 1200px;
  margin: 0 auto; 
}

.q-btn {
  background-color: #1e2021;
}

#toolBar{
  position: absolute;
}

</style>