import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_kicks'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('server_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('servers')
        .onDelete('CASCADE') 
      table.integer('kicked_user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE') 
      table.integer('kicked_by_user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE') 
    
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())

      table.primary(['server_id', 'kicked_user_id', 'kicked_by_user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}