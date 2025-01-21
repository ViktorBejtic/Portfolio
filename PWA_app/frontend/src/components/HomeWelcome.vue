<template>
    <div class="text-center welcome-section column flex-center full-window"
    :style = "{ marginTop : !$q.screen.gt.sm ? '4rem' : '0rem' }">
      <div class="row flex-center fit q-gutter-x-lg">
        <div class="col-xs-12 col-sm-5 col-md-5 ">
          <div class="q-py-md row flex-center text-center left-column col-div">
            <h4 class="q-ma-none">Welcome to <span class="text-bold text-primary text-no-wrap">Comb-bot</span></h4>
            <div class=" q-mx-auto column items-center">
              <p class="welcome-subtitle text-subtitle1">Your all-in-one platform for connecting, sharing, and discovering!</p>
              <p class="q-mt-md welcome-description">Join our community and stay updated with the latest features and enhancements. Explore, interact, and make the most out of your experience!</p>
              <q-btn label="Register Now" color="primary" class="register-button" @click="goToRegister"/>
            </div>
          </div>
        </div>
        
        <div class="col-xs-12 col-sm-5 col-md-5 ">
          <div class="col-div column justify-between">
            <q-card class="feature-card">
              <q-card-section>
                <h4 class="text-h6">🔒 Safe and Private Chatting</h4>
                <p>Your safety is our priority. All your messages are encrypted, so you can chat without worries.</p>
              </q-card-section>
            </q-card>
  
            <q-card class="feature-card">
              <q-card-section>
                <h4 class="feature-title text-h6">👥 Connect with Your Community</h4>
                <p>Create and manage groups, share ideas, and connect with people who share your interests.</p>
              </q-card-section>
            </q-card>
  
            <q-card class="feature-card">
              <q-card-section>
                <h4 class="feature-title text-h6">🎉 Organize Events</h4>
                <p>Create and plan events with friends, so you can meet in person and celebrate special moments.</p>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
</template>


<script setup lang="ts">
    import { useRouter } from 'vue-router';
    import { useQuasar } from 'quasar';

    const $q = useQuasar();
    const router = useRouter()
    function goToRegister() {
      router.push('/register')
    }
</script>
  
  
<style scoped>
.col-div{
  min-height: 60vh;
}
.left-column {
  margin: 0 auto;
  border: var(--q-primary) 3px solid;
  border-radius: 1.5rem;
}

.left-column p {
  width: 80%;
}

.feature-card {
  background-color: #1e2021;
  border-radius: 1.5rem;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: scale(1.02);
}

.register-button {
  margin-top: 65px;
  border-radius: 20rem;
  width: 45%;
  text-align: center;
  transition: transform 0.3s;
}

.register-button:hover {
  transform: scale(1.02);
}

  </style>
  