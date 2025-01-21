<template>
  <div class=" row chat-frame full-width bg-grey-10" style="gap: 0.5%">
    <div
      v-if="!mobileShowChat || $q.screen.gt.sm"
      class="channel-rooms rounded-borders bg-grey-9 shadow-7"
      :style="{ width: $q.screen.gt.sm ? '18%' : '99.5%' }"
    >
      <div v-if="showChannels">
        <q-btn flat push align="between" class="full-width">
          <div class="row items-center">
            <q-icon :name="activeServer.private ? 'lock' : 'public'" color="primary" size="1rem" />
            <p class="q-ma-sm text-subtitle1" style="text-transform: none;"> {{ activeServer.name }}</p>
          </div>
          <q-icon :name="true ? 'keyboard_arrow_down' : 'keyboard_arrow_up'" color="primary" size="1rem q-mr-xs"/>
        <q-menu dark fit auto-close class="bg-grey-9">
          <q-list style="min-width: 100px">
            <q-separator dark/>
            <q-item v-if="activeServer.role !== 'member'" clickable @click="cloneServer(), showServerSettings = true">
              <q-item-section avatar class="q-ma-auto">
                <q-icon name="settings" color="primary" size="1.3rem"/>
              </q-item-section>
              <q-item-section>Server Settings</q-item-section>
            </q-item>
            <q-item v-if="!activeServer.private || activeServer.role !== 'member'" clickable @click="showInviteFriend = true">
              <q-item-section avatar>
                <q-icon name="person_add" color="primary" size="1.3rem"/>
              </q-item-section>
              <q-item-section>Invite Friends</q-item-section>
            </q-item>
            <q-item clickable @click="getMemberList">
              <q-item-section avatar class="q-ma-auto">
                <q-icon name="groups" color="primary" size="1.3rem"/>
              </q-item-section>
              <q-item-section>Member List</q-item-section>
            </q-item>
            <q-item v-if="activeServer.role !== 'creator'" clickable :style="{ backgroundColor: `rgba(245, 49, 49, 0.4)`}" text-color="white" @click="leaveServer()">
              <q-item-section avatar >
                <q-icon name="reply" color="primary" size="1.3rem"/>
              </q-item-section>
              <q-item-section color="red">Leave Server</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <q-dialog v-model="showServerSettings">
            <q-card dark class="bg-grey-9 " style="border-radius: 0.3rem; width: 27rem;"  >
                <q-toolbar class="row justify-between items-center q-py-sm">
                  <div class="text-h6">Server Settings</div>   
                  <q-icon
                    flat
                    round
                    class="cursor-pointer"
                    name="close"
                    color="primary"
                    size="1.3rem"
                    @click="showServerSettings = false"></q-icon>
                  </q-toolbar>
                  <q-separator color="grey-8" class="q-mb-sm"/>
                  <q-card-section class="text-center">
                    <q-avatar size="5rem" class="file-avatar">
                      <img :src="`https://ui-avatars.com/api/?name=${editingServer.name}`" alt="Avatar"/>
                    </q-avatar>
                  </q-card-section>
                <q-card-section class="q-pt-none ">
                  

                  <div class="text-subtitle2 text-grey-6">Server name</div>
                  <q-input dark outlined v-model="editingServer.name" style="border-radius: 10rem;" class="q-my-sm">
                  </q-input>
                  <q-card-section class=" row items-center justify-between q-pb-none q-pt-sm q-px-xs">
                  <q-toggle
                  dark
                  keep-color
                  v-model="editingServer.private"
                  checked-icon="lock"
                  color="red"
                  unchecked-icon="public"
                  :label="editingServer.private ? 'Private Server' : 'Public Server'"
                  class="q-mt-sm"
                  />
                  <q-card-section class=" row items-center q-pa-none">
                  <q-btn
                        no-caps    
                        label="Delete"
                        color="red"
                        class="q-mt-sm"
                        style="border-radius: 0.8rem;"
                        @click="deleteServer(), showServerSettings = false"
                      />
                  <q-btn
                        no-caps    
                        label="Update"
                        color="grey-8"
                        class="q-mt-sm q-ml-md"
                        style="border-radius: 0.8rem;"
                        @click="updateServer(), showServerSettings = false"
                      />
                  </q-card-section>
                    </q-card-section>
                  </q-card-section>
              </q-card>
          </q-dialog>

      <q-dialog v-model="showInviteFriend">
            <q-card dark class="bg-grey-9 " style="border-radius: 0.3rem; width: 27rem;"  >
                <q-toolbar class="row justify-between items-center q-py-sm">
                  <div class="text-h6">Invite Friend</div>   
                  <q-icon
                    flat
                    round
                    class="cursor-pointer"
                    name="close"
                    color="primary"
                    size="1.3rem"
                    @click="showInviteFriend = false"></q-icon>
                  </q-toolbar>
                  <q-separator color="grey-8" class="q-mb-sm"/>
                <q-card-section class="q-pt-none ">
                  <div class="text-subtitle2 text-grey-6">Friends name</div>
                  <q-input dark outlined v-model="invitedFriendsName" style="border-radius: 10rem;" class="q-my-sm" placeholder="Nickname" @keyup.enter="inviteFriend">
                    <template v-slot:prepend>
                      <q-icon name="tag" />
                    </template>
                  </q-input>
                  <q-card-section class="row justify-end q-pb-none q-pt-sm q-pr-xs">
                  <q-btn
                        no-caps    
                        label="Invite"
                        color="grey-8"
                        class="q-mt-sm"
                        style="border-radius: 0.8rem;"
                        @click="inviteFriend(); showInviteFriend = false"
                      />
                    </q-card-section>
                  </q-card-section>
              </q-card>
          </q-dialog>

          <q-dialog v-model="showMemberList">
            <q-card dark class="bg-grey-9 " style="border-radius: 0.3rem; width: 27rem;"  >
                <q-toolbar class="row justify-between items-center q-py-sm">
                  <div class="text-h6">Member List</div>   
                  <q-icon
                    flat
                    round
                    class="cursor-pointer"
                    name="close"
                    color="primary"
                    size="1.3rem"
                    @click="showMemberList = false"></q-icon>
                  </q-toolbar>
                  <q-separator color="grey-8" class="q-mb-sm"/>
                  <q-list>
                    <q-card-section class=" scroll q-px-none" style="max-height: 25.5rem;">
                      <div v-for="{ role, members } in membersByRole" :key="role" class="q-mx-md">
                        <div class="text-subtitle2 text-grey-6 q-mt-sm">{{ roleDisplayNames[role] }}</div>
                        <q-item
                          v-for="member in members"
                          :key="member.id"
                          class="q-mt-xs q-px-xs row items-center"
                        >
                        <q-avatar size="2rem" class="q-mr-sm">
                          <img :src="member.avatar" alt="Friend Avatar" />
                          <q-badge rounded floating color="grey-9" class="q-pa-none">
                            <q-icon
                              :color="getStatusColor(member.status)"
                              :name="getStatusIcon(member.status)"
                              size="0.8rem"
                            />
                          </q-badge>
                          <q-img />
                        </q-avatar>
                          <q-item-section>
                            <q-item-label>{{ member.name }}</q-item-label>
                          </q-item-section >
                            <q-btn
                              v-if="activeServer.role !== 'member' && role !== 'creator' && member.id !== activeServer.userid"
                              flat
                              rounded
                              icon="logout"
                              color="orange"
                              class="q-px-sm"
                              @click="kickMember(member.id)"
                              size="sm"
                            ><q-tooltip anchor="bottom middle" self="top middle" class="bg-grey-8 text-caption">
                              Kick Member
                            </q-tooltip></q-btn>
                            <q-btn
                              v-if="activeServer.role !== 'member' && role !== 'creator' && member.id !== activeServer.userid"
                              flat
                              rounded
                              icon="block"
                              color="red"
                              class="q-px-sm"
                              @click="banMember(member.id)"
                              size="sm"
                            ><q-tooltip anchor="bottom middle" self="top middle" class="bg-grey-8 text-caption">
                              Ban Member
                            </q-tooltip></q-btn>
                            <q-btn
                              v-if="!member.isFriend && member.id !== activeServer.userid"
                              flat
                              rounded
                              icon="person_add"
                              class="q-px-sm"
                              color="primary"
                              @click="AddedFriend = member.name, addFriend()"
                              size="sm"
                            >
                            <q-tooltip anchor="bottom middle" self="top middle" class="bg-grey-8 text-caption">
                              Add Friend
                            </q-tooltip></q-btn>
                            <q-btn
                              v-else-if="member.id !== activeServer.userid"
                              flat
                              rounded
                              icon="person_remove"
                              color="primary"
                              class="q-px-sm"
                              @click="removeFriend(member.id)"
                              size="sm"
                            >
                            <q-tooltip anchor="bottom middle" self="top middle" class="bg-grey-8 text-caption">
                              Remove Friend
                            </q-tooltip></q-btn>
                        </q-item>
                      </div>
                  </q-card-section>
                </q-list>
              </q-card>
          </q-dialog>


        
         <div class="q-mx-md q-my-none row items-center justify-between">
        <h2 class="q-my-xs text-caption text-left color-grey">Text Channels</h2>
        <q-icon v-if="activeServer.role !== 'member'" center color="primary" name="add" class="cursor-pointer" size="1.25rem" style="padding-right: 2px;" @click="showCreateChannel = true">
          <q-tooltip anchor="bottom middle" self="top middle" class="bg-grey-8 text-caption">
            Create Channel
          </q-tooltip>
        </q-icon>
      </div>

      <q-dialog v-model="showCreateChannel">
            <q-card dark class="bg-grey-9 " style="border-radius: 0.3rem; width: 27rem;"  >
                <q-toolbar class="row justify-between items-center q-py-sm">
                  <div class="text-h6">Create Channel</div>   
                  <q-icon
                    flat
                    round
                    class="cursor-pointer"
                    name="close"
                    color="primary"
                    size="1.3rem"
                    @click="showCreateChannel = false"></q-icon>
                  </q-toolbar>
                  <q-separator color="grey-8" class="q-mb-sm"/>
                <q-card-section class="q-pt-none ">
                  <div class="text-subtitle2 text-grey-6">Channel name</div>
                  <q-input dark outlined v-model="newChannelName" style="border-radius: 10rem;" class="q-my-sm" placeholder="New Channel">
                    <template v-slot:prepend>
                      <q-icon name="tag" />
                    </template>
                  </q-input>
                  <q-card-section class="row justify-end q-pb-none q-pt-sm q-pr-xs">
                  <q-btn
                        no-caps    
                        label="Create"
                        color="grey-8"
                        class="q-mt-sm"
                        style="border-radius: 0.8rem;"
                        @click="createChannel(); showCreateChannel = false"
                      />
                    </q-card-section>
                  </q-card-section>
              </q-card>
          </q-dialog>

          <draggable
            v-model="channelList"
            item-key="id"
            class="full-width"
            :disabled="activeServer.role === 'member'"
            @end="updateChannelposition"
          >
            <template #item="{ element }">
              <q-item class="q-px-xs q-py-xs">
                <q-btn
                  rounded
                  flat
                  @click="mobileShowChat = true; loadChannel(element.name,element.id);"
                  align="between"
                  class="full-width"
                  style="border-radius: 0.7rem"
                  :class="{ 'selected-channel': currentChannel === element.name }">
                  <div class="row items-center ">
                    <q-icon name="tag" color="primary" size="1.2rem"/>
                    <p class="q-mx-sm q-my-none text-subtitle2" style="text-transform: none;"> {{ element.name }}</p>
                  </div>
                  <q-icon v-if="activeServer.role !== 'member'" name="settings" color="primary" size="1rem" class="cursor-pointer" @click.stop="openChannelSettings(element)">
                    <q-tooltip anchor="bottom middle" self="top middle" class="bg-grey-8 text-caption">
                      Channel Settings
                    </q-tooltip>
                  </q-icon>
              </q-btn>
              </q-item>
            </template>
          </draggable>

          <q-dialog v-model="showChannelSettings">
            <q-card dark class="bg-grey-9 " style="border-radius: 0.3rem; width: 27rem;"  >
                <q-toolbar class="row justify-between items-center q-py-sm">
                  <div class="text-h6">Channel Settings</div>   
                  <q-icon
                    flat
                    round
                    class="cursor-pointer"
                    name="close"
                    color="primary"
                    size="1.3rem"
                    @click="showChannelSettings = false"></q-icon>
                  </q-toolbar>
                  <q-separator color="grey-8" class="q-mb-sm"/>
                <q-card-section class="q-pt-none ">
                  <div class="text-subtitle2 text-grey-6">Channel name</div>
                  <q-input dark outlined v-model="selectedChannelSettings.name" style="border-radius: 10rem;" class="q-my-sm" placeholder="Channel name">
                    <template v-slot:prepend>
                      <q-icon name="tag" />
                    </template>
                  </q-input>
                  <q-card-section class="row justify-between q-pb-none q-pt-sm q-px-xs">
                    <q-btn
                        no-caps    
                        label="Delete"
                        color="red-8"
                        class="q-mt-sm"
                        style="border-radius: 0.8rem;"
                        @click="deleteChannel(); showChannelSettings = false"
                    />
                    <q-btn
                        no-caps    
                        label="Update"
                        color="grey-8"
                        class="q-mt-sm"
                        style="border-radius: 0.8rem;"
                        @click="updateChannel(); showChannelSettings = false"
                      />
                    </q-card-section>
                  </q-card-section>
                  
              </q-card>
          </q-dialog>

      </div>
      <div v-else>
        <div class="q-mx-md row items-center">
          <h2 class="q-ml-sm text-h6 text-left">Friends List</h2>

          <div class="row q-ml-auto" style="column-gap: 0.6rem">
            <q-icon
              center
              color="primary"
              name="playlist_add_circle"
              class="cursor-pointer"
              size="1.25rem"
              @click="getServerInvites(); showServerInvites = true"
            >
              <div v-if="serverinvites.length > 0" class="absolute bg-red text-white q-ml-md q-mb-md"
              style="width: 0.7rem; height: 0.7rem; font-size: 1rem; border-radius: 0.3rem;"></div>
              <q-tooltip
                anchor="bottom middle"
                self="top middle"
                class="bg-grey-8 text-caption"
              >
                Server Invites
              </q-tooltip>
            </q-icon>
            <q-dialog v-model="showServerInvites" position="top">
              <q-card dark class="bg-grey-9" style="border-radius: 1.1rem; height: 20rem; width: 22rem;" :style="{marginTop: $q.screen.gt.sm ? '4rem' : '10rem', marginLeft: $q.screen.gt.sm ? '-66vw' : '0'} " >
                <q-toolbar class="row justify-between items-center q-py-sm">
                  <div class="text-subtitle1" >Server Invites</div>   
                  <q-icon
                    flat
                    round
                    class="cursor-pointer"
                    name="close"
                    color="primary"
                    size="1.1rem"
                    @click="showServerInvites = false"></q-icon>
                  </q-toolbar>
                  <q-separator color="grey-8" class="q-mb-sm"/>
                  <q-card-section class=" scroll q-pa-none" style="max-height: 15.5rem;">
                <q-list v-if="serverinvites.length > 0">
                  <q-item v-for="invite in serverinvites" :key="invite.id" class="justify-in-between items-center q-mx-sm q-mb-sm">
                      <q-avatar size="2.5rem">
                         <img :src="`https://ui-avatars.com/api/?name=${invite.name}`" alt="Avatar" /> 
                         <q-badge rounded floating color="grey-9" class="q-pa-none">
                            <q-icon
                              color="primary"
                              :name="invite.private ? 'lock' : 'public'"
                              size="1.1rem"
                            />
                          </q-badge>
                      </q-avatar>
                      <div class="q-ml-sm">
                        <q-item-label>{{ invite.name }}</q-item-label>
                        <q-item-label caption class="text-grey-6">
                          Invited by: {{ invite.invitedby }}
                        </q-item-label>
                      </div>
                    <div class="q-ml-auto">
                        <q-btn round size="0.5rem" color="green-7" icon="done" class="q-mr-sm" @click="acceptServerInvite(invite.id)">
                        <q-tooltip anchor="center start" self="center end" class="bg-grey-8 text-caption">
                          Accept 
                        </q-tooltip>
                      </q-btn>
                        <q-btn round size="0.5rem" color="red-7" icon="close" @click="rejectServerInvite(invite.id)">
                        <q-tooltip anchor="center end" self="center start" class="bg-grey-8 text-caption">
                          Reject
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </q-item>
                </q-list>
              
                <q-card-section v-else style="margin-top: 4rem;">
                  <div class="text-subtitle2 text-center text-grey-6">Oooops... Looks like nobody wants you to be in their server</div>
                </q-card-section>
              </q-card-section>
              </q-card>
            </q-dialog>
            <q-icon
              center
              color="primary"
              name="supervised_user_circle"
              class="cursor-pointer"
              size="1.25rem"
              @click="getFriendRequests();showFriendRequests = true"
            >
              <div v-if="friendrequests.length > 0" class="absolute bg-red text-white q-ml-md q-mb-md"
              style="width: 0.7rem; height: 0.7rem; font-size: 1rem; border-radius: 0.3rem;"></div>
              <q-tooltip
                anchor="bottom middle"
                self="top middle"
                class="bg-grey-8 text-caption"
              >
                Friend Requests
              </q-tooltip>
            </q-icon>

            <q-dialog no-focus v-model="showFriendRequests" position="top">
              <q-card dark class="bg-grey-9" style="border-radius: 1.1rem; height: 20rem; width: 22rem;" :style="{marginTop: $q.screen.gt.sm ? '4rem' : '10rem', marginLeft: $q.screen.gt.sm ? '-63vw' : '0'} " >
                <q-toolbar class="row justify-between items-center q-py-sm">
                  <div class="text-subtitle1" >Friend Requests</div>   
                  <q-icon
                    flat
                    round
                    class="cursor-pointer"
                    name="close"
                    color="primary"
                    size="1.1rem"
                    @click="showFriendRequests = false"></q-icon>
                  </q-toolbar>
                  <q-separator color="grey-8" class="q-mb-sm"/>
                  <q-card-section class=" scroll q-pa-none" style="max-height: 15.5rem;">
                <q-list v-if="friendrequests.length > 0">
                  <q-item v-for="request in friendrequests" :key="request.id" class="justify-in-between items-center q-mx-sm q-mb-sm">
                      <q-avatar size="2.5rem">
                         <img :src="`https://ui-avatars.com/api/?name=${request.name}`" alt="Avatar" /> 
                      </q-avatar>
                      <q-item-label class="q-ml-sm q-mr-xl">{{ request.name }}</q-item-label>
                    <div class="q-ml-auto">
                        <q-btn round size="0.5rem" color="green-7" icon="done" class="q-mr-sm" @click="acceptFriendRequest(request.id)">
                        <q-tooltip anchor="center start" self="center end" class="bg-grey-8 text-caption">
                          Accept 
                        </q-tooltip>
                      </q-btn>
                        <q-btn round size="0.5rem" color="red-7" icon="close" @click="rejectFriendRequest(request.id)">
                        <q-tooltip anchor="center end" self="center start" class="bg-grey-8 text-caption">
                          Reject
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </q-item>
                </q-list>
              
                <q-card-section v-else style="margin-top: 4rem;">
                  <div class="text-subtitle2 text-center text-grey-6">Oooops... Looks like nobody wants to be your friend</div>
                </q-card-section>
              </q-card-section>
              </q-card>
            </q-dialog>

            <q-icon
              center
              color="primary"
              name="add_circle"
              class="cursor-pointer"
              size="1.25rem"
              @click="showAddFriend = true"
            >
              <q-tooltip
                anchor="bottom middle"
                self="top middle"
                class="bg-grey-8 text-caption"
              >
                Add Friend
              </q-tooltip>
            </q-icon>
          </div>
        </div>

        <q-dialog v-model="showAddFriend" position="top">
              <q-card dark class="bg-grey-9" style="border-radius: 1.1rem; height: 14rem; width: 25rem; " :style="{marginTop: $q.screen.gt.sm ? '4rem' : '10rem', marginLeft: $q.screen.gt.sm ? '-60vw' : '0'} " >
                <q-toolbar class="row justify-between items-center q-py-sm">
                  <div class="text-subtitle1" >Add Friend</div>   
                  <q-icon
                    flat
                    round
                    class="cursor-pointer"
                    name="close"
                    color="primary"
                    size="1.1rem"
                    @click="showAddFriend = false"></q-icon>
                  </q-toolbar>
                  <q-separator color="grey-8" class="q-mb-sm"/>
                <q-card-section>
                  <q-input dark outlined v-model="AddedFriend" placeholder="You can add friends with their nickname" style="border-radius: 10rem;" class="q-my-sm" @keyup.enter="addFriend">
                  </q-input>
                  <q-card-section class="row justify-end q-pb-none q-pt-sm q-pr-xs">
                  <q-btn
                        no-caps    
                        label="Add"
                        color="grey-8"
                        class="q-mt-sm"
                        style="border-radius: 0.8rem;"
                        @click="addFriend()"
                      />
                    </q-card-section>
                </q-card-section>
                  
              </q-card>
            </q-dialog>

        <div class="scrollable">
          <q-list v-if="friendsList.length > 0" class="q-pt-sm">
            <q-item
              v-for="friend in friendsList"
              :key="friend.id"
              class="q-px-xs q-py-xs"
            >
              <q-btn
                rounded
                flat
                align="left"
                class="full-width q-py-sm"
                style="border-radius: 0.7rem"
                @click="selectFriend(friend.id)"
                :class="{ 'selected-channel': currentChannel === friend.name }"
              >
              <q-menu touch-position context-menu auto-close class="bg-red text-white" style="border-radius: 1rem">
                <q-list>
                  <q-item class="q-px-sm" v-close-popup clickable @click="removeFriend(friend.id)">
                    <q-item-section>Remove Friend</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
                <div
                  class="row justify-in-between items-center full-width q-pl-sm"
                  style="max-width: 80%"
                >
                  <q-avatar size="1.7rem" class="q-mr-sm q-ml-sm">
                    <q-img :src="friend.avatar" alt="Friend Avatar" />
                    <q-badge rounded floating color="grey-9" class="q-pa-none">
                      <q-icon
                        :color="getStatusColor(friend.status)"
                        :name="getStatusIcon(friend.status)"
                        size="0.8rem"
                      />
                    </q-badge>
                  </q-avatar>
                  <p class="q-ma-none" style="text-transform: none">{{ friend.name }}</p>
                </div>                
              </q-btn>
            </q-item>
          </q-list>
          <div v-else class="text-subtitle2 text-center text-grey-6 q-pa-md">You don't have any friends yet. 
            <br>
            <span class="text-primary cursor-pointer" @click="showAddFriend = true">
              Try Adding a friend
            </span>
          </div>
        </div>
      </div>
    </div>

    <div
    v-if="$q.screen.gt.sm || mobileShowChat"
    class="chat-window rounded-borders bg-grey-9 q-pa-md column no-wrap shadow-7"
      :style="{ width: $q.screen.gt.sm ? '81%' : '100%'}"
    >
      <div class="message-holder" style="height: fit-content;">
        <div class="row items-center q-mb-lg">
          <q-btn
            v-if="!$q.screen.gt.sm"
            icon="arrow_back"
            round
            flat
            @click=" mobileShowChat = false"
            class=" q-mr-sm">
          </q-btn>
          <h6 class=" q-ma-none">{{ currentChannel }}</h6>
        </div>
      </div>

      <div >
          <SingleMessage
            class=" overflow-auto"
            :receiverId="receiverId"
            :friendship-id="friendshipId"
            :serverId="activeServer.id"
          />
      </div>

      <div class="q-mt-auto" style="height: fit-content;">
        <q-form
          class="full-width row bg-dark relative-position rounded-borders "
          style="margin-bottom: 3rem;"
          v-if="showComponent"
        >
          <q-list dark class="full-width command-list z-top bg-dark rounded-borders">
            <q-item
              v-for="(value, key) in filteredCommands"
              :key="key"
              dark
              class="hover-fill"
            >
              <q-item-section
                v-ripple
                class="command cursor-pointer"
                @click="pickCommand(key)"
              >
                <q-item-label>{{ key }}</q-item-label>
                <q-item-label caption class="text-grey-9">{{
                  value
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
      </q-form>

      <div
          class="someone-typing absolute z-top cursor-pointer"
          style=" height: fit-content; width: fit-content;"
        >
        <div class="full-width bg-grey-9 block q-mb-lg">
          <span v-for="(message, index) in someIsTypingMsg" :key="index"
          :class="{ 'hover-effect': index !== someIsTypingMsg.length - 1 }"
          class = " q-pa-xs "
          @click="showTypedMessage(index,message), showWhatIsTyping()"
          >
            {{ message }}
          </span>
        </div>
        </div>


        <div class="cli bg-grey rounded-borders q-px-sm">
          <q-form
            class="full-height full-width row no-wrap items-center"
            @submit.prevent="sendMessage"
          >
            <q-input
              ref="inputCli"
              v-model="inputValue"
              borderless
              color="transparent"
              autofocus
              hide-bottom-space
              dense
              placeholder="Type your message here"
              @update:model-value="checkCommand"
              @keyup.enter="sendMessage"
              autocomplete="off"
              style="width: 100%;"
            />
            <q-btn icon="send" type="submit" flat unelevated color="black" style="width: fit-content;"/>
          </q-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SingleMessage from './SingleMessage.vue';
import {commandHandler, showMemberListExternal, callAxios} from '../services/commandHandler';
import { ref, defineProps, watch, reactive, computed, onMounted, onBeforeUnmount} from 'vue';
import { useQuasar } from 'quasar';
import axios from 'axios';
import draggable from "vuedraggable";
import { Transmit } from '@adonisjs/transmit-client';

// Refs and State
const inputValue = ref<string>('');
const inputCli = ref<null | any>(null);
const showComponent = ref<boolean>(true);
const currentChannel = ref<string>('');
const channelList = ref<ServerChannel[]>([]);
const mobileShowChat = ref<boolean>(false);
const showChannels = ref<boolean>(false);
const showCreateChannel = ref<boolean>(false);
const showChannelSettings = ref<boolean>(false);
const showMemberList = ref<boolean>(false);
const showServerSettings = ref<boolean>(false);
const showInviteFriend = ref<boolean>(false);
const showServerInvites = ref<boolean>(false);
const newChannelName = ref<string>('');
const invitedFriendsName = ref<string>('');
const showFriendRequests = ref<boolean>(false);
const showAddFriend = ref<boolean>(false);
const AddedFriend = ref<string>('');
const someIsTypingMsg = ref<string[]>(['']);
const filteredCommands = ref({});
const receiverId = ref<number>(-1);
const friendChatStatus = ref<boolean>(true);
const main_user_status = ref<string>('');
const main_user_id = ref<number>(0);
const friendrequests = ref<FriendRequest[]>([]); 
const serverinvites = ref<ServerInvite[]>([]); 
const friendsList = ref<Friend[]>([]);
const memberList = ref<ServerMember[]>([]);
const friendshipId = ref<number>(0);
const showTypedMessageData = ref<string | null>(null);
let allActivateChats  = [];
let activeSubscription : any = null;
let activeChattingOn : boolean = false;

let subCollector : any[] = [];

const $q = useQuasar();

const transmit = new Transmit({
    baseUrl: 'http://127.0.0.1:3333',
});



// Props
const props = defineProps<{
  receivedServerId: number;
  receivedShowFriends: boolean;
  lastUpdate: Date;
}>();

// Emit events
const emit = defineEmits(['emit-mobileShowChat']);

// Commands and Options
const commands = {
  '/cancel' : 'Leave the server (if you are creator delete the server)',
  '/list' : 'List all the server users',
  '/revoke' : 'Revoke a user from the server',
  '/invite' : 'Invite a user to the server',
  '/kick' : 'Kick a user from the server',
  '/quit' : 'Quit the server',
  '/join' : 'Join the server / create a new one',
};

const roleDisplayNames: Record<string, string> = {
  creator: 'Creator',
  admin: 'Admins',
  member: 'Members',
};

// Interfaces
interface Friend {
  id: number;
  friendId: number;
  name: string;
  avatar: string;
  status: string;
}

interface FriendRequest {
  id: number;
  name: string;
  avatar: string;
}

interface ServerInvite {
  id: number;
  name: string;
  avatar: string;
  private: boolean;
  invitedby: string;
}

interface ServerChannel {
  id: number;
  name: string;
  position: number;
}

interface Server {
  id: number;
  name: string;
  avatar: string;
  private: boolean;
  role: string;
  userid: number;
}

interface ServerMember {
  id: number;
  name: string;
  avatar: string;
  status: string;
  role: string;
  isFriend: boolean;
}

interface RealTimeChat{
  login: string;
  message: string;
}

const activeServer = reactive<Server>({
  id: -1,
  name: "",
  avatar: "",
  private: false,
  role: "",
  userid: -1
});

const editingServer = reactive<Server>({
  id: -1,
  name: "",
  avatar: "",
  private: false,
  role: "",
  userid: 0,
});

const selectedChannelSettings = reactive<ServerChannel>({
  id: -1,
  name: '',
  position: 0,
});

// Functions
const membersByRole = computed(() => {
  const roles = ['creator', 'admin', 'member'];
  return roles
    .map((role) => ({
      role,
      members: memberList.value.filter((member) => member.role === role),
    }))
    .filter((entry) => entry.members.length > 0); 
});

const openChannelSettings = (channel: ServerChannel) => {
  Object.assign(selectedChannelSettings, channel); 
  showChannelSettings.value = true;
};

const requestNotificationPermission = () => {
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
};

requestNotificationPermission();


function cloneServer(){
  editingServer.id = activeServer.id;
  editingServer.name = activeServer.name;
  editingServer.avatar = activeServer.avatar;
  editingServer.private = activeServer.private;
  editingServer.role = activeServer.role;
  editingServer.userid = activeServer.userid;
}


const selectFriend = (id: number) => {
  activeServer.id = -1;

  friendsList.value = friendsList.value.map((friend) => {
    mobileShowChat.value = true;

    if (friend.id === id) {
      currentChannel.value = friend.name;
      friendChatStatus.value = props.receivedShowFriends;
      loadMessages(id);
    }
    return friend;
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Online':
      return 'green';
    case 'Do Not Disturb':
      return 'red';
    case 'Offline':
      return 'grey';
    default:
      return 'primary';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Online':
      return 'circle';
    case 'Do Not Disturb':
      return 'remove_circle';
    case 'Offline':
      return 'trip_origin';
    default:
      return 'circle';
  }
};

async function loadMessages (messagePullId : number){
  receiverId.value = messagePullId;
  await getFriendshipId(messagePullId);

  if (someIsTypingMsg.value.length > 0){
    someIsTypingMsg.value = [''];
  }

  if (showChannels.value){
    await activateSubscriptionChatting(messagePullId,0);
  }else{
    if(friendshipId.value !== undefined){
    await activateSubscriptionChatting(friendshipId.value,0.1);
  }
  }
};

const getMainUser = async () => {
  try {
    const response = await axios.post('http://127.0.0.1:3333/user/get-main-user', {}, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
        'Content-Type': 'application/json'
      }
    });
    
    const mainUserData = response.data.formattedMainUser;  

    main_user_status.value = mainUserData.status;
    main_user_id.value = mainUserData.id;
    
  } catch (error : any) {
    console.error('Error during fetching main user:', error.response ? error.response.data : error.message);
  }
};

const sendMessage = async () => {
  await getMainUser();

  const isItCommand = await commandHandler(inputValue.value, activeServer);


  if (isItCommand){
    const showMemberListBoolean = showMemberListExternal(inputValue.value)


    if (showMemberListBoolean){
      getMemberList();
    }
  }

  if (inputValue.value.length > 0 && !isItCommand && main_user_status.value !== 'Offline') {
    let endpoint = ''

    if (activeServer.id != -1){
      endpoint = 'messages/add-server-message';
    }else{
      endpoint = 'messages/add-personal-message'
    }
    
    await callAxios({
      receiverId: receiverId.value,
      content: inputValue.value,
      friendshipId: friendshipId.value
    },endpoint)
  }

  inputValue.value = '';
  checkCommand();
};

const showWhatIsTyping = () => {
  activeChattingOn = !activeChattingOn;
};

const checkCommand = async() => {
  showComponent.value = false;
  let channelSocket = 0

  filteredCommands.value = Object.fromEntries(
    Object.entries(commands).filter(
      ([key]) => key.startsWith(inputValue.value) && inputValue.value.length > 0
    )
  );

  if (Object.keys(filteredCommands).length > 0) {
    showComponent.value = true;
  } else {
    showComponent.value = false;
  }

  if (showChannels.value){
    channelSocket = receiverId.value;
  }else{
    channelSocket = friendshipId.value+0.1;
  }

  const body = {
    channelId : channelSocket,
    message: inputValue.value
  }

  await callAxios(body,'messages/current-chatting')

};

const loadChannel = (channelName: string, messagePullId: number) => {
  currentChannel.value = channelName;
  loadMessages(messagePullId);
};

const pickCommand = (command: string) => {
  inputValue.value = command + ' ';
  showComponent.value = false;

  if (inputValue.value) {
    inputCli.value.focus();
  }
};

// Backend Calls
async function addFriend(){

  axios.post('http://127.0.0.1:3333/friend/create-friend-request',{
    receiverLogin: AddedFriend.value
  },{
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
      'Content-Type': 'application/json'
    }
  }).then(response => {
    AddedFriend.value = '';
    $q.notify({
        type: 'positive',
        message: 'Friend request sent',
        timeout: 5000, 
        position: 'bottom' 
      });
    
  }).catch(error => {
      const message = error.response?.data?.message || 'An error occurred';
      AddedFriend.value = '';
      $q.notify({
        type: 'negative',
        message: message,
        timeout: 5000, 
        position: 'bottom' 
      });
    });

}

async function acceptFriendRequest(requestId: number){

  axios.post('http://127.0.0.1:3333/friend/accept-friend-request',{
    friendRequestId: requestId
  },{
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
      'Content-Type': 'application/json'
    }
  }).then(response => {
    deleteFriendRequest(requestId);
    getFriendsList();
  }).catch(error => {
    console.error('Error during accepting friendrequest:', error.response ? error.response.data : error.message);
  });
}

const deleteFriendRequest = (requestId: number) => {
  const index = friendrequests.value.findIndex(request => request.id === requestId);
  if (index > -1) {
    friendrequests.value.splice(index, 1);
  }
};

async function rejectFriendRequest(requestId: number){

  axios.post('http://127.0.0.1:3333/friend/reject-friend-request',{
    friendRequestId: requestId
  },{
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
      'Content-Type': 'application/json'
    }
  }).then(response => {
    deleteFriendRequest(requestId);
  }).catch(error => {
    console.error('Error during rejecting friendrequest:', error.response ? error.response.data : error.message);
  });

}

const getFriendRequests = () => {

  friendrequests.value = [];

  axios.post('http://127.0.0.1:3333/friend/list-friend-requests',{},{
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
      'Content-Type': 'application/json'
    }
  }).then(response => {

    response.data.mappedRequests.forEach((element : any) => {

      friendrequests.value.push({
        id: element.friendRequestId,
        name: element.senderName,
        avatar: element.senderAvatar,
      });

    })

  }).catch(error => {
    console.error('Error during fetching friend requests:', error.response ? error.response.data :  error.message);
  });

};

const getFriendsList = async () => {

  await axios.post('http://127.0.0.1:3333/friend/list-friends',{},{
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
      'Content-Type': 'application/json'
    }
  }).then(response => {


    friendsList.value = [];

    response.data.mappedFriends.forEach((friend : any) => {

      friendsList.value.push({
        id: friend.friendId,
        friendId: friend.id,
        name: friend.friendName,
        avatar: friend.friendAvatar,
        status: friend.friendStatus,
      });

    })

  }).catch(error => {
    console.error('Error during fetching friend requests:', error.response ? error.response.data :  error.message);
  });

}


const removeFriend = (friendId: number) => {

  axios.post('http://127.0.0.1:3333/friend/remove-friend',{
    friendId: friendId
  },{
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
      'Content-Type': 'application/json'
    }
  }).then(response => {
    if(showChannels.value){
      getMemberList();
    } else {
      getFriendsList();
    }
  }).catch(error => {
    console.error('Error during fetching friend requests:', error.response ? error.response.data :  error.message);
  });

}

const getActiveServer = async (serverId: number) => {
  try {
    const response = await axios.post('http://127.0.0.1:3333/server/get-active-server', {
      serverId: serverId
    }, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
        'Content-Type': 'application/json'
      }
    });
    
    const activeServerData = response.data.formattedActiveServer;  

    activeServer.id = activeServerData.id;
    activeServer.name = activeServerData.name;
    activeServer.avatar = activeServerData.avatar;
    activeServer.private = activeServerData.privacy;
    activeServer.role = activeServerData.role;
    activeServer.userid = activeServerData.userid;

  } catch (error : any) {
    console.error('Error during fetching active server:', error.response ? error.response.data : error.message);
  }
};

const getServerChannels = async (serverId: number) => {
  channelList.value = [];
  try {
    const response = await axios.post('http://127.0.0.1:3333/server/get-server-channels',{
      serverId: serverId
    },{
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
        'Content-Type': 'application/json',
      },
    })

    response.data.serverChannels.forEach((channel: any) => {

      channelList.value.push({
        id: channel.id,
        name: channel.name,
        position: channel.position,
      })

    })
    channelList.value.sort((a, b) => a.position - b.position)
    loadChannel(channelList.value[0].name, channelList.value[0].id);
  } catch (error) {
    console.error('Error fetching channel list:', error.response?.data || error.message)
  }
}

const leaveServer = async () => {
  axios.post('http://127.0.0.1:3333/server/leave-server',{
    serverId: activeServer.id
  },{
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
      'Content-Type': 'application/json'
    }
  }).then(response => {
    getFriendsList();
    showChannels.value = false;
    currentChannel.value = ''; 
    loadMessages(-1);
  }).catch(error => {
    console.error('Error during updating channel:', error.response ? error.response.data :  error.message);
  });
}

const updateServer = async () => {
  axios.post('http://127.0.0.1:3333/server/update-server',{
    serverId: activeServer.id,
    name: editingServer.name,
    privacy: editingServer.private,
  },{
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
      'Content-Type': 'application/json'
    }
  }).then(async (response) => {
    await getActiveServer(activeServer.id);
  }).catch(error => {
    console.error('Error during leaving server:', error.response ? error.response.data :  error.message);
  });
}

const deleteServer = async () => {
  axios.post('http://127.0.0.1:3333/server/delete-server',{
    serverId: activeServer.id
  },{
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
      'Content-Type': 'application/json'
    }
  }).then(response => {
    getFriendsList();
    showChannels.value = false;
    currentChannel.value = ''; 
    loadMessages(-1);
  }).catch(error => {
    console.error('Error during deleting server:', error.response ? error.response.data :  error.message);
  });
}

const getMemberList = async () => {
  showMemberList.value = true;
  memberList.value = [];
  axios.post('http://127.0.0.1:3333/server/get-member-list',{
    serverId: activeServer.id,
  },{
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
      'Content-Type': 'application/json'
    }
  }).then(response => {

    response.data.members.forEach((member : any) => {

      memberList.value.push({
        id: member.id,
        name: member.username,
        avatar: member.avatar,
        status: member.status,
        role: member.role,
        isFriend: member.isFriend,
      });

    })

  }).catch(error => {
    console.error('Error during fetching friend requests:', error.response ? error.response.data :  error.message);
  });

}

const kickMember = async (memberId: number) => {
  axios.post('http://127.0.0.1:3333/server/kick-server-member',{
    memberId: memberId,
    serverId: activeServer.id,
    command: false
  },{
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
      'Content-Type': 'application/json'
    }
  }).then(response => {
    getMemberList();
  }).catch(error => {
    console.error('Error creating channel:', error.response ? error.response.data :  error.message);
  });
}

const banMember = async (memberId: number) => {
  axios.post('http://127.0.0.1:3333/server/ban-server-member',{
    serverId: activeServer.id,
    memberId: memberId
  },{
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
      'Content-Type': 'application/json'
    }
  }).then(response => {
    getMemberList();
  }).catch(error => {
    console.error('Error creating channel:', error.response ? error.response.data :  error.message);
  });
}

const inviteFriend = async () => {
  axios.post('http://127.0.0.1:3333/server-invite/create-server-invite',{
    serverId: activeServer.id,
    invitedusername: invitedFriendsName.value
  },{
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
      'Content-Type': 'application/json'
    }
  }).then(response => {
    invitedFriendsName.value = '';
    $q.notify({
        type: 'positive',
        message: 'Server Invite sent',
        timeout: 5000, 
        position: 'bottom' 
      });
    
  }).catch(error => {
      const message = error.response?.data?.message || 'An error occurred';
      AddedFriend.value = '';
      $q.notify({
        type: 'negative',
        message: message,
        timeout: 5000, 
        position: 'bottom' 
      });
    });
}

const acceptServerInvite = async (inviteId: number) => {
  axios.post('http://127.0.0.1:3333/server-invite/accept-server-invite',{
    serverInviteId: inviteId
  },{
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
      'Content-Type': 'application/json'
    }
  }).then(response => {
    getServerInvites();
  }).catch(error => {
    console.error('Error during accepting friendrequest:', error.response ? error.response.data : error.message);
  });
}

const rejectServerInvite = async (inviteId: number) => {
  axios.post('http://127.0.0.1:3333/server-invite/reject-server-invite',{
    serverInviteId: inviteId
  },{
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
      'Content-Type': 'application/json'
    }
  }).then(response => {
    getServerInvites();
  }).catch(error => {
    console.error('Error during rejecting friendrequest:', error.response ? error.response.data : error.message);
  });

}

const getServerInvites = () => {

  serverinvites.value = [];

  axios.post('http://127.0.0.1:3333/server-invite/get-server-invites',{},{
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
      'Content-Type': 'application/json'
    }
  }).then(response => {

    response.data.mappedInvites.forEach((invite: any) => {

      serverinvites.value.push({
        id: invite.id,
        name: invite.servername,
        avatar: invite.serveravatar,
        private: invite.serverprivacy,
        invitedby: invite.invitedBy
      });

      serverinvites.value.sort((a, b) => b.id - a.id);

    })

  }).catch(error => {
    console.error('Error during fetching friend requests:', error.response ? error.response.data :  error.message);
  });

};

const createChannel = async () => {
  axios.post('http://127.0.0.1:3333/server/create-channel',{
    name: newChannelName.value,
    serverId: activeServer.id,
  },{
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
      'Content-Type': 'application/json'
    }
  }).then(response => {
    currentChannel.value = newChannelName.value;
    newChannelName.value = '';
  }).catch(error => {
    console.error('Error creating channel:', error.response ? error.response.data :  error.message);
  });
}

const updateChannelposition = async () => {
  const channelPositions = channelList.value.map((channel, index) => {
    return {
      id: channel.id,
      position: index + 1
    }
  })

  axios.post('http://127.0.0.1:3333/server/update-channel-positions',{
    channels: channelPositions,
    serverId: activeServer.id
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

const updateChannel = async () => {
  axios.post('http://127.0.0.1:3333/server/update-channel',{
    channelId: selectedChannelSettings.id,
    name: selectedChannelSettings.name,
    serverId: activeServer.id
  },{
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
      'Content-Type': 'application/json'
    }
  }).then(response => {
  }).catch(error => {
    console.error('Error during updating channel:', error.response ? error.response.data :  error.message);
  });
}

const deleteChannel = async () => {
  axios.post('http://127.0.0.1:3333/server/delete-channel',{
    channelId: selectedChannelSettings.id,
    serverId: activeServer.id
  },{
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
      'Content-Type': 'application/json'
    }
  }).then(response => {
  }).catch(error => {
    console.error('Error during updating channel:', error.response ? error.response.data :  error.message);
  });
}

const getFriendshipId = async (friendId: number) => {
  try {
    await axios.post('http://127.0.0.1:3333/friend/get-friendship-id', {
      friendId: friendId
    }, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('bearer'),
        'Content-Type': 'application/json'
      }
    }).then(response => {
      friendshipId.value = response.data.friendshipId;
    });
  }
    catch (error : any) {
      console.error('Error during fetching friendship id:', error.response ? error.response.data : error.message);
    }
};

const showTypedMessage = (index: number, text: string) => {  
  if(index < someIsTypingMsg.value.length - 1){
    showTypedMessageData.value = text.replace('is typing ...', '').replace(',','').trim();
  }
};

const activateSubscriptionChatting =async (channelId : number, addition : number) => {

  if(Number.isNaN(channelId+addition)){
    return;
  }

  let activeSubscription = transmit.subscription(`channel-current-chatting:${channelId+addition}`);
  await activeSubscription.create();

  let unsub = activeSubscription.onMessage(async (message: any) => {    
    await getMainUser();

    console.log("Message:",message);

    if(activeChattingOn && message.message.length > 1){
      if(showTypedMessageData.value === message.login ){
        someIsTypingMsg.value = [message.login + ": " + message.message];
        return;
      }
    }else{

      activeChattingOn = false;

      if (main_user_status.value === 'Offline'){
        return;
      }

      someIsTypingMsg.value = [];
      
      const newTypingMessage : RealTimeChat = {
        login: message.login,
        message: message.message
      }
      
      let found = false;

      if (allActivateChats.length === 0){
        allActivateChats.push(newTypingMessage);
      };

      allActivateChats.forEach((element : any) => {
        if (element.login === newTypingMessage.login){
          element.message = newTypingMessage.message;
          found = true;
          
          if (!newTypingMessage.message){
            allActivateChats = allActivateChats.filter((item) => item.login !== element.login);
          }

        }
      });

      if (!found){
        allActivateChats.push(newTypingMessage);
      }

      allActivateChats.forEach((element : any) => {
        if (element.message.length > 0){
          someIsTypingMsg.value.push(element.login + ', ');
        }
      });

      if (someIsTypingMsg.value.length < 1){
        someIsTypingMsg.value = [''];
      }else{
        someIsTypingMsg.value[someIsTypingMsg.value.length] = "is typing ...";
      }
      
    }
  });

  subCollector.push(unsub, activeSubscription)
}

const updateChannelOnChange = async () => {

  let activeSubscription = transmit.subscription(`channel-list:${activeServer.id}`);
console.log(activeSubscription.isCreated, activeSubscription.handlerCount); 
  await activeSubscription.create();

  

  let unsub = activeSubscription.onMessage((message: any) => {
    getServerChannels(activeServer.id);
  });

  
  subCollector.push(unsub, activeSubscription);
};

const updateFriendsRequestsOnChange = async () => {
  await getMainUser();

  let activeSubscription = transmit.subscription(`friend-request-change:${main_user_id.value}`);
console.log(activeSubscription.isCreated, activeSubscription.handlerCount); 
  await activeSubscription.create();
  

  

  let unsub = activeSubscription.onMessage((message: any) => {
    getFriendRequests();
  });

  

  subCollector.push( unsub, activeSubscription);
  
};

const updateServerRequestsOnChange = async () => {
  await getMainUser();

  let activeSubscription = transmit.subscription(`server-request-change:${main_user_id.value}`);
console.log(activeSubscription.isCreated, activeSubscription.handlerCount); 
  await activeSubscription.create();

  

  let unsub = activeSubscription.onMessage((message: any) => {
    getServerInvites();
  });

  

  subCollector.push( unsub,activeSubscription);
}

const updateFriendListOnChange = async () => {
  await getMainUser();

  let activeSubscription = transmit.subscription(`friend-list-change:${main_user_id.value}`);
  await activeSubscription.create();

  let unsub = activeSubscription.onMessage((message: any) => {
    console.log("Friend list change:",message);
    getFriendsList();
  });

  console.log(activeSubscription.isCreated, "user id:",main_user_id.value, unsub);

  subCollector.push(unsub,activeSubscription);
}

// Watchers
watch(
  () => [props.receivedServerId, props.lastUpdate],
  async ([newId]) => {
    if (newId !== undefined && newId !== null) {
      await getActiveServer(props.receivedServerId);
      getServerChannels(props.receivedServerId);
      showChannels.value = true;
      if (channelList.value.length > 0) {
        currentChannel.value = channelList.value[0].name;
      }

      if (newId !== -1) {
        friendChatStatus.value = false;
      }

    }

    await updateChannelOnChange();
  },
  { immediate: false }
);

watch(
  () => props.receivedShowFriends,
  (newVal) => {
    if (newVal !== undefined) {
      showChannels.value = false;
      getFriendsList();
      if(currentChannel.value != ''){
        currentChannel.value = '';
        loadMessages(0);
      }
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

watch(
  () => mobileShowChat.value,
  (newVal) => {
    emit('emit-mobileShowChat', newVal);
  },
  {
    immediate: true,
    deep: true,
  }
);

// Initial load
getFriendsList()
getFriendRequests();
getServerInvites();

onMounted(async () => {
  await updateFriendsRequestsOnChange();
  await updateServerRequestsOnChange();
  await updateFriendListOnChange();
});

onBeforeUnmount(async() => {
  subCollector.forEach(async(unsub) => {
    console.log("Unsubscribing:",unsub);
          try
          {
            unsub();
          }catch(e){
            await unsub.delete();
          }
    });

    subCollector = [];

    transmit.close();  
  });


</script>


<style>

.file-avatar {
  position: relative;
  border-radius: 50%; 
  overflow: hidden;   
}

.chat-window,
.channel-rooms {
  border-radius: 1rem;
  max-height: 97.5
  vh !important;
}

.scrollable {
  overflow: auto !important;
  max-height: calc(100vh - 105px) !important;
}

.cli {
  max-height: 40px !important;
}

.hover-fill:hover {
  background-color: var(--q-primary);
  border-radius: 0.35rem;
}

.command-list {
  position: absolute;
  bottom: 10%;
}

.fr-badge {
  font-size: 0.001rem !important;
  margin-top: -0.2rem;
  margin-right: -0.3rem;
}

.shadows {
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
}

.someone-typing {
  bottom: 6% !important;
}

.selected-channel {
  background-color: rgba(247, 182, 2, 0.2);
}

.server-name {
  border-radius: 1rem 1rem 0 0 !important;
}

.setting-row:hover {
  background-color: var(--q-primary);
}

.last-item-style {
  background-color: #ff0000;
}

.scrollable::-webkit-scrollbar {
  display: none;
}

.hover-effect:hover {
  background-color: var(--q-primary);
  border-radius: 0.35rem;
}
</style>
