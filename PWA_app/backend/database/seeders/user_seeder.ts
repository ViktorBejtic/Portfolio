import {BaseSeeder} from '@adonisjs/lucid/seeders'
import User from '../../app/models/user.js'

export default class UserSeeder extends BaseSeeder {
  public async run () {
    await User.createMany([
      {
        login: 'admin',
        password: 'admin',
        firstName: 'admin',
        lastName: 'admin',
        email: 'admin@example.com',
        allnotifications: true,
        user_status: 'Online',
      },
      {
        login: 'john_doe',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        allnotifications: true,
        user_status: 'Online',
      },
      {
        login: 'jane_smith',
        password: 'password456',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        allnotifications: true,
        user_status: 'Offline',
      },
      {
        login: 'joe_bloggs',
        password: 'password789',
        firstName: 'Joe',
        lastName: 'Bloggs',
        email: 'joe_bloggs@example.com',
        allnotifications: true,
        user_status: 'Do Not Disturb',
      },
      {
        login: 'jane_doe',
        password : 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'janedoe@example.com',
        allnotifications: true,
        user_status: 'Online',
      }
    ])
  }
}
