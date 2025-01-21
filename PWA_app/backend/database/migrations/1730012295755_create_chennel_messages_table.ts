import { BaseSchema } from '@adonisjs/lucid/schema'

export default class ChannelMessages extends BaseSchema {
  protected tableName = 'channel_messages'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('channel_id').unsigned().references('id').inTable('channels').onDelete('CASCADE').notNullable()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').notNullable()
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