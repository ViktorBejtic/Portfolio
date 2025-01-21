<template>
    <q-page padding class="fullscreen flex column flex-center page">
      <h2 class="text-center"
      style="font-size: clamp(3rem, 7vw, 4.5rem)"> Welcome to <span class=" text-bold text-primary text-no-wrap">Comb-bot</span></h2>
      <q-form
        @submit.prevent="handleSubmit()"
        greedy
        class="q-gutter-lg q-ma-lg flex column flex-center no-margin q-pa-xl text-color-white login-register-form" style="width: clamp(20rem, 80%, 32rem)">
      
      <h1 class=" text-h4 q-ml-none q-mt-none q-mb-lg" style="font-size: clamp(1.5rem, 3vw, 2rem)">Login Form</h1>

      <q-input dark v-model="login" :rules="[requiredRule]" :error="!!loginError" :error-message="loginError" type="text" label="Login" placeholder="example: YourLogin" class="no-margin"/>
      <q-input dark v-model="password" :rules="[requiredRule]" :error="!!loginError" :error-message="passwordError" type="password" label="Password" placeholder="example: YourPassword" class="no-margin"/>
    
      <p v-if="registrationError" class=" text-center q-ma-none text-red"> Incorrect login and/or password</p>

      <q-btn class="button q-mx-auto" label="Submit" type="submit" color="primary"/>
      
      <router-link to="/register" class=" q-ml-none text-primary">Go to Registration Page</router-link>

      </q-form>
    </q-page>
  </template>
  
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router';
import axios from 'axios';
import callAxios from 'src/services/commandHandler';

const router = useRouter();

const login = ref<string>('')
const password = ref<string>('')

const loginError = ref<string>('')
const passwordError = ref<string>('')

const registrationError = ref<boolean>(false)

const requiredRule = (value: string) => !!value || 'This field is required.'

async function handleSubmit(){
  await axios.post('http://127.0.0.1:3333/auth/login', {
    login: login.value,
    password: password.value,
  }, {
    headers: {
      'Content-Type': 'application/json',
    }
  })
  .then(async response => {
    const token = response.data.token;
    const login = response.data.user.login;

    localStorage.setItem('login', login);
    localStorage.setItem('bearer', token.token);

    if (token){
      callAxios({},"friend/inform-friends-status");
      await router.push('/chatapp');
    }else{
      registrationError.value = true;
    }

  })
  .catch(error => {
    console.error('Error during registration:', error.response ? error.response.data : error.message);
    registrationError.value = true;
  });
}

defineOptions({
  name: 'MainLogin'
});

</script>

<style>
.button {
  border-radius: 20rem;
  width: 45%;
  transition: width 0.3s ease;
}

.q-input {
  width: 100%;
}

.login-register-form {
  width: 32rem;
  border: var(--q-primary) 3px solid;
  border-radius: 1.5rem;
  transition: all 0.3s ease;
}

.q-page {
    padding: 1rem;
    background-color: var(--q-dark-page);
    color: white;
  }

</style>
  