import { BaseSchema } from '@adonisjs/lucid/schema'

export default class FriendRequests extends BaseSchema {
  protected tableName = 'friend_requests'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('sender_id').unsigned().references('id').inTable('users').onDelete('CASCADE').notNullable()
      table.integer('receiver_id').unsigned().references('id').inTable('users').onDelete('CASCADE').notNullable()
      table.enu('friendrequest_status', ['accepted', 'rejected', 'floating']).defaultTo('floating').notNullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
