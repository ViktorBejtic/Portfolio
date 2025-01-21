import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Friend from '../../app/models/friend.js'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await Friend.createMany([
      {
        user1Id: 1,
        user2Id: 2,
      },
      {
        user1Id: 1,
        user2Id: 3,
      },
      {
        user1Id: 1,
        user2Id: 4,
      },

    ])
  }
}