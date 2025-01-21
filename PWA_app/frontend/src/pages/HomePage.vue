<template>
  <q-page class=" bg-dark">
    <HomeTitleBar />
    <div class="page">
      <div class="container column" >
        <div class="content">
          <HomeWelcome />
          <HomeNews />
          <HomeFAQ />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import HomeTitleBar from '../components/HomeTitleBar.vue';
import HomeWelcome from '../components/HomeWelcome.vue';
import HomeNews from '../components/HomeNews.vue';
import HomeFAQ from '../components/HomeFAQ.vue';
</script>

<style scoped>

.page {
  max-width: 1200px;
  margin: 0 auto;
}




</style>
