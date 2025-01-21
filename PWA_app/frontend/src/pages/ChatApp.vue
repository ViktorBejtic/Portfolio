<template>
  <q-page padding class=" row q-pa-sm no-wrap" style="gap: 0.5%">
    <SidePanel class="menu" @emit-friends="ReceiveShowFriends" @emit-server-id="ReceiveServerId" :receivedShowMobileChat = "showMobileChat"/>
    <ChatWindow class="chat-compo" @emit-mobileShowChat="ReceiveMobileShowChat" :receivedShowFriends="showFriends" :receivedServerId="ServerId" :lastUpdate="lastUpdate"/>
  </q-page>
</template>

<script setup lang="ts">
import SidePanel from '../components/SidePanel.vue'
import ChatWindow from '../components/ChatWindow.vue'
import axios from 'axios'

import { ref,onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const showFriends = ref<boolean>(false);
const ServerId = ref<number>(-1);
const lastUpdate = ref<Date>(new Date());
const showMobileChat = ref<boolean>(false);

onBeforeMount(async() => {
  await axios.post('http://127.0.0.1:3333/auth/check',{

  }, {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
    'Content-Type': 'application/json'
  }
  }).then(response => {
  }).catch(async () => {
    await router.push('/login');
  });
});


const ReceiveShowFriends = () => {
  showFriends.value = !showFriends.value
}

const ReceiveServerId = (id:number) => {
  ServerId.value = id;
  lastUpdate.value = new Date();
}

const ReceiveMobileShowChat = (showMobileChatValue : boolean) => {
  showMobileChat.value = showMobileChatValue;
}


</script >

<style scoped>
  .q-page {
    background-color: var(--q-dark);
  }

  .chat-compo{
    width: 94.25%;
  }

  .menu{
    width: 75px;
  }
</style>
