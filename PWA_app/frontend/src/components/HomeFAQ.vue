<template>
    <div class="q-pa-md text-body1 container full-window column  justify-center" style="max-width: 1200px">
      <h3 class="text-regular text-center q-ma-none q-mb-xl">FAQ</h3>
      <q-list bordered class="rounded-borders faq-list">
        <q-expansion-item
          expand-separator
          class="overflow-hidden"
          style="border-radius: 15px;"
          label="What is Comb-bot?"
        >
          <q-card>
            <q-card-section >
              Comb-bot is a platform for connecting with friends and sharing information.
            </q-card-section>
          </q-card>
        </q-expansion-item>
  
        <q-expansion-item
          expand-separator
          class="overflow-hidden"
          style="border-radius: 15px;"
          label="How do I register?"
        >
          <q-card>
            <q-card-section>
              Simply click the registration button on the homepage.
            </q-card-section>
          </q-card>
        </q-expansion-item>
  
        <q-expansion-item
          expand-separator
          class="overflow-hidden"
          style="border-radius: 15px;"
          label="What user information is required for registration?"
        >
          <q-card>
            <q-card-section>
              Users must provide their full name, nickname, and email address.
            </q-card-section>
          </q-card>
        </q-expansion-item>
  
        <q-expansion-item
          expand-separator
          class="overflow-hidden"
          style="border-radius: 15px;"
          label="How can I manage channels?"
        >
          <q-card>
            <q-card-section>
              Users can view their channel list, create new channels, leave channels, and, if they are channel administrators, delete channels.
            </q-card-section>
          </q-card>
        </q-expansion-item>
  
        <q-expansion-item
          expand-separator
          class="overflow-hidden"
          style="border-radius: 15px;"
          label="What types of channels are available?"
        >
          <q-card>
            <q-card-section>
              There are two types of channels: private channels and public channels.
            </q-card-section>
          </q-card>
        </q-expansion-item>
  
        <q-expansion-item
          expand-separator
          class="overflow-hidden"
          style="border-radius: 15px;"
          label="What commands can I use to manage channels?"
        >
          <q-card>
            <q-card-section>
              Users can use commands like /join, /invite, /kick, and /quit to manage channels.
            </q-card-section>
          </q-card>
        </q-expansion-item>
  
        <q-expansion-item
          expand-separator
          class="overflow-hidden"
          style="border-radius: 15px;"
          label="How can I address specific users in my messages?"
        >
          <q-card>
            <q-card-section>
              You can address a specific user in your message by using the @nickname command.
            </q-card-section>
          </q-card>
        </q-expansion-item>
  
        <q-expansion-item
          expand-separator
          class="overflow-hidden"
          style="border-radius: 15px;"
          label="Can I view the message history?"
        >
          <q-card>
            <q-card-section>
              Yes, users can view the complete message history with efficient infinite scroll.
            </q-card-section>
          </q-card>
        </q-expansion-item>
  
        <q-expansion-item
          expand-separator
          class="overflow-hidden"
          style="border-radius: 15px;"
          label="How are notifications handled in Comb-bot?"
        >
          <q-card>
            <q-card-section>
              Users receive notifications for new messages only when the app is not visible. Notifications contain a snippet of the message and the sender's name.
            </q-card-section>
          </q-card>
        </q-expansion-item>
  
        <q-expansion-item
          expand-separator
          class="overflow-hidden"
          style="border-radius: 15px;"
          label="How can I change my status?"
        >
          <q-card>
            <q-card-section>
              Users can set their status to online, DND, or offline, and this status is visible to other users.
            </q-card-section>
          </q-card>
        </q-expansion-item>
  
        <q-expansion-item
          expand-separator
          class="overflow-hidden"
          style="border-radius: 15px;"
          label="Can I cancel my account?"
        >
          <q-card>
            <q-card-section>
              Yes, you can cancel your account in the Settings section under 'Account Management'.
            </q-card-section>
          </q-card>
        </q-expansion-item>
  
        <q-expansion-item
          expand-separator
          class="overflow-hidden"
          style="border-radius: 15px;"
          label="What happens if I leave a channel?"
        >
          <q-card>
            <q-card-section>
              If you leave a channel, it will be removed from your list of channels. If you are removed by the admin, you will also lose access to that channel.
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
    </div>
  </template>
  
  <style>

   .container {
       margin: 0 auto;
       padding: 20px;
       width: 100%;
   }

  .faq-list {
    background-color: #1e2021;
    border-radius: 10px;
    padding: 10px;
    width: 100%;
  }

  .q-card {
    background-color: var(--q-dark-page)    ;
  }

  </style>
  