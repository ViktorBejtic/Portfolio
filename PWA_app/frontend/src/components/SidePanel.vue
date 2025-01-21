<template>
  <div 
  v-if="!showMobileChat || $q.screen.gt.md"
  class="sidepannel column no-wrap q-pt-lg bg-grey-9 shadow-7"
  :style="{ paddingTop : $q.screen.gt.sm ? '1rem' : '0' }">
    <q-list style=" height: fit-content">
      <q-item>
        <q-btn round unelevated :color="showaccount ? 'grey-8' : 'grey-9'" @click="ShowAccount">
          <q-icon center size="1.7rem" color="primary" name="account_circle" />
          <q-badge rounded floating color="transparent" class="q-pa-none">
            <q-icon :color="statusColor" :name="statusIcon" />
          </q-badge>
          <q-tooltip anchor="center end" self="center start" class="bg-grey-8 text-body2">
            Account
          </q-tooltip>
        </q-btn>
      </q-item>

      <q-item>
        <q-btn round unelevated :color="showfriends ? 'grey-8' : 'grey-9'" @click="ShowFriends">
          <q-icon center size="1.7rem" color="primary" name="group" />
          <q-tooltip anchor="center end" self="center start" class="bg-grey-8 text-body2">
            Friends
          </q-tooltip>
        </q-btn>
      </q-item>

      <q-item>
        <q-btn round unelevated :color="showservers ? 'grey-8' : 'grey-9'" @click="ShowServers">
          <q-icon center size="1.7rem" color="primary" name="dns" />
          <q-tooltip anchor="center end" self="center start" class="bg-grey-8 text-body2">
            Servers
          </q-tooltip>
        </q-btn>
      </q-item>
    </q-list>

    <div class="content-center"  style=" height: 1%">
      <q-separator inset color="primary"/>
    </div>
      
    <div  :style="{ height: $q.screen.gt.sm ? '78%' : '68%' }" class=" ">
      <div v-if="showservers" class=" full-height">
        <q-list class="scrollable full-height">
            <q-item>
            <q-btn round flat @click="showCreateServer = true" class="q-my-sm">
                <q-icon center name="add" size="2.6rem" color="primary"/>
              <q-tooltip anchor="center end" self="center start" class="bg-grey-8 text-body2">
                Create Server
              </q-tooltip>
            </q-btn>
          </q-item>

          <q-dialog v-model="showCreateServer">
            <q-card dark class="bg-grey-9" style="border-radius: 0.3rem; width: 27rem;">
              <q-toolbar class="row justify-between items-center q-py-sm">
                <div class="text-h6">Create/Join Server</div>
                <q-icon
                  flat
                  round
                  class="cursor-pointer"
                  name="close"
                  color="primary"
                  size="1.3rem"
                  @click="showCreateServer = false"
                ></q-icon>
              </q-toolbar>
              <q-separator color="grey-8" class="q-mb-sm" />
              <q-tabs v-model="selectedTab" dense class="text-primary">
                <q-tab name="create" label="Create Server" />
                <q-tab name="join" label="Join Server" />
              </q-tabs>
              <q-separator color="grey-8" />
            
              <q-tab-panels dark v-model="selectedTab" animated>
                <q-tab-panel class="bg-grey-9" name="create">
                  <q-card-section>
                    <div class="text-subtitle2 text-center text-grey-6">
                      Give your new server a personality with a name and an icon. You can always change it          later.
                    </div>
                  </q-card-section>
                  <q-card-section class="text-center">
                    <q-avatar size="5rem" class="file-avatar">
                      <img :src="`https://ui-avatars.com/api/?name=${newServerName}`" alt="Avatar"/>
                    </q-avatar>
                  </q-card-section>
                  <q-card-section class="q-pt-none">
                    <div class="text-subtitle2 text-grey-6">Server name</div>
                    <q-input dark outlined v-model="newServerName" style="border-radius: 10rem;"   class="q-my-sm" @keyup.enter="CreateServer"/>
                    <q-card-section class="row items-center justify-between q-pb-none q-pt-sm q-pl-xs">
                      <q-toggle
                        dark
                        keep-color
                        v-model="privateserver"
                        checked-icon="lock"
                        color="red"
                        unchecked-icon="public"
                        :label="privateserver ? 'Private Server' : 'Public Server'"
                        class="q-mt-sm"
                      />
                      <q-btn
                        no-caps
                        label="Create"
                        color="grey-8"
                        class="q-mt-sm"
                        style="border-radius: 0.8rem;"
                        @click="CreateServer(), showCreateServer = false"
                      />
                    </q-card-section>
                  </q-card-section>
                </q-tab-panel>
              
                <q-tab-panel class="bg-grey-9" name="join">
                  <q-card-section>
                    <div class="text-subtitle2 text-center text-grey-6 q-mb-xl q-mt-md">
                      Enter the server name to join an existing public server.
                    </div>
                    <div class="text-subtitle2 text-grey-6">
                      Server Name
                    </div>
                    <q-input dark outlined v-model="servertojoin" style="border-radius: 10rem;"    class="q-my-sm" placeholder="Enter server name" @keyup.enter="JoinServer"/>
                    <q-btn
                      no-caps
                      label="Join"
                      color="grey-8"
                      class="q-mt-sm"
                      style="border-radius: 0.8rem;"
                      @click="JoinServer(), showCreateServer = false"
                    />
                  </q-card-section>
                </q-tab-panel>
              </q-tab-panels>
            </q-card>
          </q-dialog>

          <draggable 
            v-model="serverList" 
            item-key="id" 
            @end="UpdateServerPositions">
            <template #item="{ element }">
              <q-item>
                <q-btn round elevated @click="selectServer(element.id)">
                  <div v-if="selectedServerId === element.id && showselectedserver" class="server-dot"></div>
                  <q-avatar size="2.6rem">
                    <img :src="`https://ui-avatars.com/api/?name=${element.name}`" alt="Server Avatar" />
                  </q-avatar>
                  <q-tooltip
                    anchor="center end"
                    self="center start"
                    class="bg-grey-8 text-body2"
                  >
                    {{ element.name }}
                  </q-tooltip>
                </q-btn>
              </q-item>
            </template>
          </draggable>
        </q-list>
    </div>
  
    <div v-else-if="selectedServer != null && !showservers && showselectedserver">
      <q-item>
        <q-btn round elevated @click="selectServer(selectedServer.id)">
          <div class="server-dot"></div>
          <q-avatar size="2.6rem">
            <img :src="`https://ui-avatars.com/api/?name=${selectedServer.name}`" alt="Server Avatar" />
          </q-avatar>
          <q-tooltip anchor="center end" self="center start" class="bg-grey-8 text-body2">
            {{ selectedServer.name }}
          </q-tooltip>
        </q-btn>
      </q-item>
    </div>
  </div>


    <q-dialog v-model="showaccount">
      <div class="popup bg-dark column">
        <div class="text-h6 text-white q-mt-md">Account Information</div>
        <q-card elevated dark class="account-card bg-grey-9 ">
          <q-card-section class="text-center">
            <q-avatar size="5rem" class="file-avatar">
              <img :src="`https://ui-avatars.com/api/?name=${Mainuser.nickname}`" alt="Avatar" />
            </q-avatar>
          </q-card-section>

          <q-card-section>
            <div class="column q-mt-md justify-between">
            <div class="row">
              <strong>Nickname:</strong>
                <div class="q-pl-sm cursor-pointer">
                  {{ Mainuser.nickname }}
                  <q-popup-edit dark v-model="Mainuser.nickname" :validate="val => val.length > 0" v-slot="scope">
                    <q-input
                      dark
                      autofocus
                      dense
                      v-model="scope.value"
                      hint="Your nickname"
                      :rules="[
                        val => scope.validate(val) || 'More than 5 chars required'
                      ]"
                    >
                      <template v-slot:after>
                        <q-btn
                          flat dense color="negative" icon="cancel"
                          @click.stop.prevent="scope.cancel"
                        />
                      
                        <q-btn
                          flat dense color="positive" icon="check_circle"
                          @click.stop.prevent="scope.set"
                          :disable="scope.validate(scope.value) === false || scope.initialValue === scope.value"
                        />
                      </template>
                    </q-input>
                  </q-popup-edit>
                  <q-tooltip anchor="center end" self="center left" class="bg-grey-8 text-caption">
                    Change your nickname
                  </q-tooltip>
              </div>
            </div>
            <div class="row q-mt-sm">
              <strong>Name:</strong>
                <div class="q-pl-sm cursor-pointer">
                  {{ Mainuser.name }}
                  <q-popup-edit dark v-model="Mainuser.name" :validate="val => val.length > 0" v-slot="scope">
                    <q-input
                      dark
                      autofocus
                      dense
                      v-model="scope.value"
                      hint="Your name"
                      :rules="[
                        val => scope.validate(val) || 'More than 5 chars required'
                      ]"
                    >
                      <template v-slot:after>
                        <q-btn
                          flat dense color="negative" icon="cancel"
                          @click.stop.prevent="scope.cancel"
                        />
                      
                        <q-btn
                          flat dense color="positive" icon="check_circle"
                          @click.stop.prevent="scope.set"
                          :disable="scope.validate(scope.value) === false || scope.initialValue === scope.value"
                        />
                      </template>
                    </q-input>
                  </q-popup-edit>
                  <q-tooltip anchor="center end" self="center left" class="bg-grey-8 text-caption">
                    Change your name
                  </q-tooltip>
              </div>
            </div>
            <div class="row q-mt-sm">
              <strong>Surname:</strong>
                <div class="q-pl-sm cursor-pointer">
                  {{ Mainuser.surname }}
                  <q-popup-edit dark v-model="Mainuser.surname" :validate="val => val.length > 0" v-slot="scope">
                    <q-input
                      dark
                      autofocus
                      dense
                      v-model="scope.value"
                      hint="Your surname"
                      :rules="[
                        val => scope.validate(val) || 'More than 5 chars required'
                      ]"
                    >
                      <template v-slot:after>
                        <q-btn
                          flat dense color="negative" icon="cancel"
                          @click.stop.prevent="scope.cancel"
                        />
                      
                        <q-btn
                          flat dense color="positive" icon="check_circle"
                          @click.stop.prevent="scope.set"
                          :disable="scope.validate(scope.value) === false || scope.initialValue === scope.value"
                        />
                      </template>
                    </q-input>
                  </q-popup-edit>
                  <q-tooltip anchor="center end" self="center left" class="bg-grey-8 text-caption">
                    Change your surname
                  </q-tooltip>
              </div>
            </div>
            <div class="row q-mt-sm">
              <strong>Email:</strong>
                <div class="q-pl-sm cursor-pointer">
                  {{ Mainuser.email }}
                  <q-popup-edit dark v-model="Mainuser.email" :validate="val => val.length > 0" v-slot="scope">
                    <q-input
                      dark
                      autofocus
                      dense
                      v-model="scope.value"
                      hint="Your email"
                      :rules="[
                        val => scope.validate(val) || 'More than 5 chars required'
                      ]"
                    >
                      <template v-slot:after>
                        <q-btn
                          flat dense color="negative" icon="cancel"
                          @click.stop.prevent="scope.cancel"
                        />
                      
                        <q-btn
                          flat dense color="positive" icon="check_circle"
                          @click.stop.prevent="scope.set"
                          :disable="scope.validate(scope.value) === false || scope.initialValue === scope.value"
                        />
                      </template>
                    </q-input>
                  </q-popup-edit>
                  <q-tooltip anchor="center end" self="center left" class="bg-grey-8 text-caption">
                    Change your email
                  </q-tooltip>
              </div>
            </div>
            <div class="row q-mt-sm">
               <q-toggle
                dark
                keep-color
                v-model="Mainuser.allnotifications"
                checked-icon="notifications"
                color="green"
                unchecked-icon="notification_important"
                :label="Mainuser.allnotifications ? 'Receive all notifications' : 'Receive only mentions'"
                class="q-mt-sm"
              />
            </div>
          </div>
          </q-card-section>
          <q-card-section>
          <p><strong>Status:</strong></p>
          <q-select v-model="Mainuser.status" :options="options" emit-value rounded standout dark bg-color="grey-8"
          popup-content-class="bg-grey-9 popup-status" >
            <template v-slot:prepend>
              <q-icon :color="statusColor" :name="statusIcon" />
             </template>
            <template v-slot:option="scope"> 
              <q-item v-bind="scope.itemProps" class="q-ml-sm"> 
                <q-icon :name="scope.opt.icon" :color="scope.opt.color" class="q-mr-xs">
                </q-icon>
                  <q-item-section> 
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                    <q-item-label style="max-width: 60%" caption>{{ scope.opt.description }}</q-item-label>
                  </q-item-section> 
              </q-item> 
            </template> 
          </q-select>
          </q-card-section>

        </q-card>
        <div class="q-mt-md">
          <q-btn rounded label="Log Out" color="red-9" @click="LogOut()"/>
          <q-btn flat rounded class="q-ml-md" label="Close" color="primary" @click="showaccount = false"/>
        </div>

      </div>
    </q-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import axios from 'axios';
import draggable from 'vuedraggable';
import { debounce } from 'lodash';
import { Transmit } from '@adonisjs/transmit-client';
import callAxios from '../services/commandHandler.ts';
import { onMounted } from 'vue';
import { onBeforeUnmount } from 'vue';

const router = useRouter();
const $q = useQuasar();

(() => {
  page.value = 'ChatApp';
});

// Interfaces
interface User {
  id: number;
  nickname: string;
  name: string;
  surname: string;
  email: string;
  status: string;
  allnotifications: boolean;
}

interface Server {
  id: number;
  name: string;
  privacy: boolean;
  role: string;
  position: number;
}

// Refs and State
const page = ref('');
const serverList = ref<Server[]>([]);
const servertojoin = ref<string>('');
const showservers = ref(false);
const showfriends = ref(true);
const showaccount = ref(false);
const showCreateServer = ref(false);
const showselectedserver = ref(false);
const selectedServerId = ref<number>(-1);
const showMobileChat = ref<boolean>(false);
const privateserver = ref<boolean>(false);
const selectedTab = ref<'create' | 'join'>('create');
let subCollectorChannels: any[] = [];
let subCollector : any[] = [];

const transmit = new Transmit({
  baseUrl: 'http://127.0.0.1:3333',
});

const Mainuser = reactive<User>({
  id: 0,
  nickname: "",
  name: "",
  surname: "",
  email: "",
  status: "",
  allnotifications: true
});

const newServerName = ref<string>(`${Mainuser.name}'s Server`);

// Emit events
const emit = defineEmits(['emit-friends', 'emit-server-id']);

emit('emit-friends', true);

// Props
const props = defineProps<{
  receivedShowMobileChat: boolean;
}>();

// Watchers
watch(
  () => props.receivedShowMobileChat,
  () => {
    showMobileChat.value = props.receivedShowMobileChat;
  }
);

watch(
  () => showCreateServer.value,
  () => {
    newServerName.value = `${Mainuser.nickname}'s Server`;

    if (serverList.value.find((server) => server.name === newServerName.value)) {
      let counter = 1;

      while (serverList.value.find((server) => server.name === `${newServerName.value} ${counter}`)) {
        counter++;
      }

      newServerName.value = `${newServerName.value} ${counter}`;
    }
  }
);

watch(
  () => Mainuser, 
  (newValue, oldValue) => {
    debouncedUpdateMainUser();
  },
  { deep: true } 
);


// Data

const options = [
  {
    label: 'Online',
    value: 'Online',
    icon: 'circle',
    color: 'green'
  },
  {
    label: 'Do Not Disturb',
    value: 'Do Not Disturb',
    description: 'You will not receive any notifications.',
    icon: 'remove_circle',
    color: 'red'
  },
  {
    label: 'Offline',
    value: 'Offline',
    description: 'You will not appear online, but will have full access to all of Discord.',
    icon: 'trip_origin',
    color: 'grey'
  },
];

// Computed Properties
const statusColor = computed(() => {
  switch (Mainuser.status) {
    case 'Online': return 'green';
    case 'Do Not Disturb': return 'red';
    case 'Offline': return 'grey';
    default: return 'primary';
  }
});

const statusIcon = computed(() => {
  switch (Mainuser.status) {
    case 'Online': return 'circle';
    case 'Do Not Disturb': return 'remove_circle';
    case 'Offline': return 'trip_origin';
    default: return 'circle';
  }
});

const selectedServer = computed(() => {
  return serverList.value.find((server) => server.id === selectedServerId.value) || null;
});

// Functions
const debouncedUpdateMainUser = debounce(async () => {
  await updateMainUser();
}, 300);

function selectServer(serverId: number) {
  if (selectedServerId.value != serverId) {
    emit('emit-server-id', serverId);
  }
  selectedServerId.value = serverId;
  showselectedserver.value = true;
  showfriends.value = false;
  showaccount.value = false;
  page.value = '';
}

async function ShowServers() {
  showservers.value = !showservers.value;
  if(showservers.value){
    await getServerList();
  }
}

function ShowFriends() {
  if (!showfriends.value) {
    emit('emit-friends', true);
    showfriends.value = true;
    selectedServerId.value = -1;
  }
}

function ShowAccount() {
  showaccount.value = !showaccount.value;
}

async function LogOut() {
  
  await callAxios({},'friend/inform-friends-status');
  await callAxios({},'auth/logout');

  router.push('/login');
}

const getMainUser = async () => {
  try {
    const response = await axios.post('http://127.0.0.1:3333/user/get-main-user', {}, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
        'Content-Type': 'application/json'
      }
    });
    
    const mainUserData = response.data.formattedMainUser;  

    Mainuser.id = mainUserData.id;
    Mainuser.nickname = mainUserData.nickname;
    Mainuser.name = mainUserData.name;
    Mainuser.surname = mainUserData.surname;
    Mainuser.email = mainUserData.email;
    Mainuser.status = mainUserData.status;
    Mainuser.allnotifications = mainUserData.allnotifications;

  } catch (error : any) {
    console.error('Error during fetching main user:', error.response ? error.response.data : error.message);
  }
};


const updateMainUser = async () => {
    axios.post('http://127.0.0.1:3333/user/update-main-user', {
      name: Mainuser.name,
      surname: Mainuser.surname,
      nickname: Mainuser.nickname,
      email: Mainuser.email,
      status: Mainuser.status,
      allnotifications: Mainuser.allnotifications
    }, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
        'Content-Type': 'application/json'
      }
    }).then(response => {
    }).catch(error => {
      const message = error.response?.data?.message || 'An error occurred';

      $q.notify({
        type: 'negative',
        message: message,
        timeout: 5000, 
        position: 'bottom' 
      });
      getMainUser();
    });

    await callAxios({},'friend/inform-friends-status');
};

const getServerList = async () => {
  serverList.value = [];

  subCollectorChannels.forEach(async(unsub) => {
    try
    {
      unsub();
    }catch(e){
      await unsub.delete();
    }
  });

  try {
    const response = await axios.post('http://127.0.0.1:3333/server/get-server-list',{},{
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
        'Content-Type': 'application/json',
      },
    })

    response.data.servers.forEach(async (server: any) => {

      serverList.value.push({
        id: server.id,
        name: server.name,
        privacy: server.privacy,
        role: server.role,
        position: server.position,
      })

      await getServerChannels(server.id);

    })
    serverList.value.sort((a, b) => a.position - b.position)
  } catch (error : any) {
    console.error('Error fetching server list:', error.response?.data || error.message)
  }
}

const getServerChannels = async (serverId: number) => {
  try {
    const response = await axios.post('http://127.0.0.1:3333/server/get-server-channels',{
      serverId: serverId
    },{
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
        'Content-Type': 'application/json',
      },
    })

    response.data.serverChannels.forEach(async (channel: any) => {

      await addChannelSubscription(channel.id);

    })
  } catch (error) {
    console.error('Error fetching channel list:', error.response?.data || error.message)
  }
}

async function addChannelSubscription(channelId: number){
  await getMainUser();

  let activeSubscription = transmit.subscription(`channel:${channelId}`); // Create a subscription to the channel
  await activeSubscription.create();

  const unsub = activeSubscription.onMessage(async (message: any) => {
    if(Mainuser.status !== "Offline"){
      try{
        await showNotification( message.message.content , message.message.login );
      }catch(e){
        console.log(e);
      }
    }
  });

  subCollectorChannels.push(unsub, activeSubscription);
}

const showNotification = async (text: string, currentChannel: string) => {
  
  const visibility = $q.appVisible

  if(visibility){
    return;
  }

  if(Mainuser.status == 'Do Not Disturb'){
    return;
  }

  if(!Mainuser.allnotifications && !text.includes('@'+ Mainuser.nickname)){
    return;
    
  }
    console.log('Notification:', text, currentChannel);

    const notification = new Notification('Comb Bot', {
      body: `${currentChannel}:\t ${text}`,
    });

    notification.onclick = () => {
      window.focus();
    };
   
};

const CreateServer = async () => {
  axios.post('http://127.0.0.1:3333/server/create-server',{
    name: newServerName.value,
    privacy: privateserver.value,
  },{
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
      'Content-Type': 'application/json'
    }
  }).then(response => {
    selectServer(response.data.server.id);
  }).catch(error => {
    console.error('Error during fetching friend requests:', error.response ? error.response.data :  error.message);
  });

}

const JoinServer = async () => {
  axios.post('http://127.0.0.1:3333/server/join-server',{
    servername: servertojoin.value,
  },{
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
      'Content-Type': 'application/json'
    }
  }).then(response => {
    selectServer(response.data.serverId);
    servertojoin.value = '';
    $q.notify({
        type: 'positive',
        message: 'Server joined successfully',
        timeout: 5000, 
        position: 'bottom' 
      });
  }).catch(error => {
    console.error('Error during fetching friend requests:', error.response ? error.response.data :  error.message);
    servertojoin.value = '';
    const message = error.response?.data?.message || 'An error occurred';
    $q.notify({
        type: 'negative',
        message: message,
        timeout: 5000, 
        position: 'bottom' 
      });
  });
}

const UpdateServerPositions = async () => {
  const serverPositions = serverList.value.map((server, index) => {
    return {
      id: server.id,
      position: index + 1
    }
  })


  axios.post('http://127.0.0.1:3333/server/update-server-positions',{
    servers: serverPositions,
  },{
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
      'Content-Type': 'application/json'
    }
  }).then(response => {
  }).catch(error => {
    console.error('Error during updating server positions:', error.response ? error.response.data :  error.message);
  });
}

async function CreateSubscribe() {
  await getMainUser();

  await getMainUser();

  let activeSubscription = transmit.subscription(`server-list:${Mainuser.id}`); // Create a subscription to the channel
  const output= await activeSubscription.create();

  const unsub = activeSubscription.onMessage(async (message: any) => {
    console.log("Selected server is active server")
    try{
      if (message.serverId === selectedServerId.value ){
        ShowFriends();
      }
    }catch(e){
      console.log(e);
    }

    await getServerList();
  });

  subCollector.push(unsub, activeSubscription);
}

onMounted(async ()=>{
  await CreateSubscribe();
});

onBeforeUnmount(async() => {
  page.value = "Chatapp";
  subCollector.forEach(async(unsub) => {
          try
          {
            unsub();
          }catch(e){
            await unsub.delete();
          }
    });
  
  subCollectorChannels.forEach(async(unsub) => {
    try
    {
      unsub();
    }catch(e){
      await unsub.delete();
    }
  });

    subCollectorChannels = [];
    subCollector = [];

    transmit.close();
  
});

</script>


<style scoped>
.sidepannel {
  max-height: 97.5vh !important;
  max-width: 75px;
  border-radius: 1rem;
  color: grey;
}

.scrollable {
  overflow: auto !important;
}

.server-dot {
  position: absolute;
  left: -9px;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 15px;
  background-color: var(--q-primary);
  border-radius: 25%;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.popup {
  width: 350px;
  height: 570px;
  border-radius: 20px;
  display: flex;
  align-items: center;
}

.account-card {
  background-color: var(--q-grey-7);
  border-radius: 20px;
  width: 90%;
  margin-top: 2%;
}

.popup-status {
  max-width: 30px !important;
  border-radius: 20px !important; 
}

::-webkit-scrollbar {
  display: none;
}
</style>
