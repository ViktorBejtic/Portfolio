import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('login', 64).notNullable().unique()
      table.binary('password').notNullable()
      table.string('first_name', 35).notNullable()
      table.string('last_name', 35).notNullable()
      table.string('email', 254).notNullable().unique()
      table.boolean('allnotifications').defaultTo(true).notNullable()
      table.enu('user_status', ['Online', 'Offline', 'Do Not Disturb']).defaultTo('online').notNullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
