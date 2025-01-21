import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Database from '@adonisjs/Lucid/Database'

export default class ServerUserSeeder extends BaseSeeder {
  public async run() {
    await Database.table('server_user').insert([
      {
        server_id: 1, // ID servera
        user_id: 1, // ID používateľa
        role: 'admin', // Rola používateľa
        position: 1, // Poradie
        ban: false, // Či je zabanovaný
        kick_counter: 0, // Počet vykopnutí
      },
      {
        server_id: 1,
        user_id: 2,
        role: 'member',
        position: 2,
        ban: false,
        kick_counter: 1,
      },
      {
        server_id: 2,
        user_id: 3,
        role: 'moderator',
        position: 1,
        ban: false,
        kick_counter: 0,
      },
      {
        server_id: 2,
        user_id: 4,
        role: 'member',
        position: 2,
        ban: true,
        kick_counter: 3,
      },
      {
        server_id: 3,
        user_id: 5,
        role: 'admin',
        position: 1,
        ban: false,
        kick_counter: 0,
      },
    ])
  }
}