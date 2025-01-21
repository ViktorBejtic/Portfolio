import Ws from '@adonisjs/websocket'

Ws.channel('chat', 'ChatController')