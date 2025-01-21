<template>
<q-page padding class="fullscreen flex flex-center">
  <div v-if="$q.screen.gt.sm" class="q-mr-xl" style="max-width: 35%;">
    <h2 class="text-center" style="width: fit-content; margin: 0 auto;">
      Welcome to 
    </h2>
    <h2 class="text-bold text-primary text-center" style="width: fit-content; margin: 0 auto;">Comb-bot</h2>
    <p class=" text-h5 q-mt-xl text-center" >
      Our comb is your comb as well, where you can meet your friends, family and colleagues.<br>
      The biggest advantage of our comb is that you can meet people from all over the world. 
    </p>
  </div>

  <q-form
    @submit.prevent="handleSubmit()"
    greedy
    class="q-gutter-lg q-ma-lg flex column flex-center no-margin q-pa-xl login-register-form"
  >
    <h1 class="text-h4 q-ml-none q-mt-none q-mb-lg">Register Form</h1>

    <q-input dark v-model="firstName" :rules="[requiredRule]" :error="!!loginError" :error-message="firstNameError" type="text" label="First Name" placeholder="example: Joe" class="no-margin"/>
    <q-input dark v-model="lastName" :rules="[requiredRule]" :error="!!loginError" :error-message="lastNameError" type="text" label="Last Name" placeholder="example: Doe" class="no-margin"/>
    <q-input dark v-model="email" :rules="[requiredRule,emailRule]" :error="!!loginError" :error-message="emailError" type="text" label="E-mail" placeholder="example: joe.deo@domain.eu" class="no-margin"/>
    <q-input dark v-model="login" :rules="[requiredRule]" :error="!!loginError" :error-message="loginError" type="text" label="Login" placeholder="example: YourLogin" class="no-margin"/>
    <q-input dark v-model="password" :rules="[requiredRule,passwordRule]" :error="!!loginError" :error-message="passwordError" type="password" label="Password" placeholder="example: YourPassword@" class="no-margin"/>

    <q-btn class="button q-mx-auto" label="Register" type="submit" color="primary"/>

    <router-link to="/login" class="q-ml-none text-primary">I am already logged-in</router-link>
  </q-form>
</q-page>

</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';


const login = ref<string>('')
const password = ref<string>('')
const firstName = ref<string>('')
const lastName = ref<string>('')
const email = ref<string>('')

const loginError = ref<string>('')
const passwordError = ref<string>('')
const firstNameError = ref<string>('')
const lastNameError = ref<string>('')
const emailError = ref<string>('')

axios.defaults.withCredentials = true;
const router = useRouter();


const requiredRule = (value: string) => !!value || 'This field is required.'
const emailRule = (value: string) => /.+@.+\..+/.test(value) || 'E-mail must be valid.'
const passwordRule = (value: string) => {
  const hasMinLength = value.length > 6;
  const hasUpperCase = /[A-Z]/.test(value);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

  if (!hasMinLength) {
    return 'Password must be at least 7 characters long.';
  }
  if (!hasUpperCase) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!hasSpecialChar) {
    return 'Password must contain at least one special character.';
  }
  return true; 
};

async function handleSubmit() {

  await axios.post('http://127.0.0.1:3333/auth/register', {
    login: login.value,
    password: password.value,
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value
  }, {
    headers: {
      'Content-Type': 'application/json',
    }
  })
  .then(async response => {
    const token = response.data.token;
    localStorage.setItem('bearer', token.token);

    if (token){
      await router.push('/login');
    }

  })
  .catch(error => {
    console.error('Error during registration:', error.response ? error.response.data : error.message);
  });

}


defineOptions({
name: 'MainLogin'
});

</script>

<style>
  .button {
    border-radius: 20rem;
    -webkit-border-radius: 20rem;
    -moz-border-radius: 20rem;
    -ms-border-radius: 20rem;
    -o-border-radius: 20rem;
    width: 45%;
  }

  body{
    font-family: 'Manrope', sans-serif;
  }

  .button-div{
      margin-left: 0;
      width: 100%;
  }

  .q-input{
      width: 100%;
  }

  .login-register-form{
      width: 32rem;
      border: var(--q-primary) 3px solid;
      border-radius: 1.5rem;
      -webkit-border-radius: 1.5rem;
      -moz-border-radius: 1.5rem;
      -ms-border-radius: 1.5rem;
      -o-border-radius: 1.5rem;
  }

  .q-page{
      background-color: var(--q-dark-page);
      color: white;
  }
</style>

