import {BaseSeeder} from '@adonisjs/lucid/seeders'
import FriendRequest from '../../app/models/friend_request.js'

export default class FriendRequestSeeder extends BaseSeeder {
  public async run () {
    await FriendRequest.createMany([
      {
        senderId: 2, // Assuming user ID 2 exists
        receiverId: 1, // Assuming user ID 1 exists
        friendrequest_status: 'floating',
      },
      {
        senderId: 3, // Assuming user ID 1 exists
        receiverId: 1, // Assuming user ID 2 exists
        friendrequest_status: 'floating',
      },
      {
        senderId: 4, // Assuming user ID 2 exists
        receiverId: 1, // Assuming user ID 1 exists
        friendrequest_status: 'floating',
      },
      {
        senderId: 5, // Assuming user ID 2 exists
        receiverId: 1, // Assuming user ID 1 exists
        friendrequest_status: 'floating',
      },
    ])
  }
}
