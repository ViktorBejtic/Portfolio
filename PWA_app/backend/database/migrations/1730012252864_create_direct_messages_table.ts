import { BaseSchema } from '@adonisjs/lucid/schema'

export default class DirectMessages extends BaseSchema {
  protected tableName = 'direct_messages'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('sender_user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').notNullable()
      table.integer('receiver_user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').notNullable()
      table.string('message', 300).notNullable()
      table.timestamp('time_sent', { useTz: true }).defaultTo(this.now())
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
