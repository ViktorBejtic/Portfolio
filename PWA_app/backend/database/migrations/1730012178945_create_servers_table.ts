import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Servers extends BaseSchema {
  protected tableName = 'servers'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name', 64).notNullable()
      table.boolean('privacy').defaultTo(false) 
      table.timestamp('last_activity', { useTz: true }).defaultTo(this.now())
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
