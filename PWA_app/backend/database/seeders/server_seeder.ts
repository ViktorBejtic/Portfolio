import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Server from '../../app/models/server.js'
export default class ServerSeeder extends BaseSeeder {
  public async run() {
    await Server.createMany([
      {
        name: 'General Chat',
        privacy: false,
      },
      {
        name: 'Private Discussions',
        privacy: true,
      },
      {
        name: 'Gaming Zone',
        privacy: false,
      },
      {
        name: 'Workplace Collaboration',
        privacy: true,
      },
      {
        name: 'Hobby Talks',
        privacy: false,
      },
    ])
  }
}