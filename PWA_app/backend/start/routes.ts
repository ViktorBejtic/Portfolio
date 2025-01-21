/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import {middleware} from '#start/kernel'
import transmit from '@adonisjs/transmit/services/main'

const AuthController = () => import('#controllers/auth_controller')
const FriendController = () => import('#controllers/friends_controller')
const UserController = () => import('#controllers/user_controller')
const ServersController = () => import('#controllers/servers_controller')
const MessagesController = () => import('#controllers/messages_controller')
const ServerInvitesController = () => import('#controllers/server_invites_controller')

// transmits

// Register WebSocket routes
transmit.registerRoutes((route) => {
    // Ensure you are authenticated to register your client
    if (route.getPattern() === '__transmit/subscribe') {
        // route.middleware(middleware.logRequest())
        return
    }
})

// routes

router.get('/csrf-secret', async ({ response, request }) => {
    const csrfToken = request.csrfToken
    return response.json({ csrfToken })
})

router.get

router.group(()=>{
    router.post('register',[AuthController,'register']);
    router.post('login',[AuthController,'login']);
    router.post('logout',[AuthController,'logout']).use(middleware.auth());
    router.post('check',[AuthController,'check'])
}).prefix('auth')

router.group(()=>{
    router.post('create-friend-request',[FriendController,'createFriendRequest']).use(middleware.auth());
    router.post('accept-friend-request',[FriendController,'acceptFriendRequest']).use(middleware.auth());
    router.post('reject-friend-request',[FriendController,'rejectFriendRequest']).use(middleware.auth());
    router.post('list-friend-requests',[FriendController,'getFriendRequests']).use(middleware.auth());
    router.post('list-friends',[FriendController,'getFriendslist']).use(middleware.auth());
    router.post('remove-friend',[FriendController,'removeFriend']).use(middleware.auth());
    router.post('get-friendship-id',[FriendController,'getFriendshipId']).use(middleware.auth());
    router.post('inform-friends-status',[FriendController,'informFriendsAboutStatusChange']).use(middleware.auth());
}).prefix('friend');


router.group(()=>{
    router.post('get-main-user', [UserController,'getMainUser']).use(middleware.auth());
    router.post('update-main-user', [UserController,'updateMainUser']).use(middleware.auth());
}).prefix('user');

router.group(()=>{
    router.post('get-server-list', [ServersController,'getServerList']).use(middleware.auth());
    router.post('get-active-server', [ServersController,'getActiveServer']).use(middleware.auth());
    router.post('create-server', [ServersController,'createServer']).use(middleware.auth());
    router.post('join-server', [ServersController,'joinServer']).use(middleware.auth());
    router.post('leave-server', [ServersController,'leaveServer']).use(middleware.auth());
    router.post('update-server', [ServersController,'updateServer']).use(middleware.auth());
    router.post('delete-server', [ServersController,'deleteServer']).use(middleware.auth());
    router.post('update-server-positions', [ServersController,'updateServerPositons']).use(middleware.auth());
    router.post('create-channel', [ServersController,'createChannel']).use(middleware.auth());
    router.post('update-channel', [ServersController,'updateChannel']).use(middleware.auth());
    router.post('delete-channel', [ServersController,'deleteChannel']).use(middleware.auth());
    router.post('get-server-channels', [ServersController,'getServerChannels']).use(middleware.auth());
    router.post('update-channel-positions', [ServersController,'updateChannelPositons']).use(middleware.auth());
    router.post('get-member-list', [ServersController,'getMemberList']).use(middleware.auth());
    router.post('kick-server-member', [ServersController,'kickServerMember']).use(middleware.auth());
    router.post('ban-server-member', [ServersController,'banServerMember']).use(middleware.auth());
    router.post('revoke-user', [ServersController,'revokeUser']).use(middleware.auth());
}).prefix('server');


router.group(()=>{
    router.post('get-personal-messages', [MessagesController,'getPersonalMessages']).use(middleware.auth());
    router.post('get-server-messages', [MessagesController,'getServerMessages']).use(middleware.auth());
    router.post('add-personal-message', [MessagesController,'addPersonalMessage']).use(middleware.auth());
    router.post('add-server-message', [MessagesController,'addServerMessage']).use(middleware.auth());
    router.post('current-chatting', [MessagesController,'currentChatting']).use(middleware.auth());
}).prefix('messages');

router.group(()=>{
    router.post('create-server-invite',[ServerInvitesController,'createServerInvite']).use(middleware.auth());
    router.post('accept-server-invite',[ServerInvitesController,'acceptServerInvite']).use(middleware.auth());
    router.post('reject-server-invite',[ServerInvitesController,'rejectServerInvite']).use(middleware.auth());
    router.post('get-server-invites',[ServerInvitesController,'getServerInvites']).use(middleware.auth());
}).prefix('server-invite');