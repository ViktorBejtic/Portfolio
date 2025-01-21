import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class IndexSeeder extends BaseSeeder {
  private async seed(Seeder: { default: typeof BaseSeeder }) {
    await new Seeder.default(this.client).run()
  }

  async run() {
    await this.seed(await import('../user_seeder.js'))
    await this.seed(await import('../server_seeder.js'))
    await this.seed(await import('../channel_seeder.js'))
    await this.seed(await import('../channel_message_seeder.js'))
    await this.seed(await import('../friend_request_seeder.js'))
    // await this.seed(await import('../friend_seeder.js'))
  }
}
