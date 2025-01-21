import { BaseSchema } from '@adonisjs/lucid/schema'

export default class ServerInvites extends BaseSchema {
  protected tableName = 'server_invites'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('server_id').unsigned().references('id').inTable('servers').onDelete('CASCADE')
      table.integer('invited_by_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('invited_user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.enu('serverinvite_status', ['accepted', 'rejected', 'floating']).defaultTo('floating').notNullable()
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
