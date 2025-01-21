import { BaseSchema } from '@adonisjs/lucid/schema'

export default class ServerUser extends BaseSchema {
  protected tableName = 'server_user'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('server_id').unsigned().notNullable()
        .references('servers.id').onDelete('CASCADE')

      table.integer('user_id').unsigned().notNullable()
        .references('users.id').onDelete('CASCADE')
        
      table.enum('role', ['creator', 'admin', 'member']).notNullable().defaultTo('member')
      table.integer('position').notNullable().defaultTo(0)
      table.integer('kick_counter').defaultTo(0) 
      table.boolean('ban').defaultTo(false) 
      table.boolean('inServer').defaultTo(true) 
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())

      table.primary(['server_id', 'user_id'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}