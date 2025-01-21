import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Channels extends BaseSchema {
  protected tableName = 'channels'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('server_id').unsigned().references('id').inTable('servers').onDelete('CASCADE').notNullable()
      table.string('name', 64).notNullable()
      table.integer('position').notNullable()
      table.timestamp('last_activity', { useTz: true }).defaultTo(this.now())
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
