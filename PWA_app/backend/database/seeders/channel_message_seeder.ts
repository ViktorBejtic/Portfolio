import {BaseSeeder} from '@adonisjs/lucid/seeders'
import ChannelMessage from '../../app/models/channel_message.js'

export default class ChannelMessageSeeder extends BaseSeeder {
  public async run () {
    await ChannelMessage.createMany([
      {
        channelId: 1, // Assuming channel ID 1 exists
        userId: 1, // Assuming user ID 1 exists
        message: 'Hello everyone!',
      },
      {
        channelId: 1, // Assuming channel ID 1 exists
        userId: 2, // Assuming user ID 2 exists
        message: 'Welcome to the chat!',
      },
    ])
  }
}
