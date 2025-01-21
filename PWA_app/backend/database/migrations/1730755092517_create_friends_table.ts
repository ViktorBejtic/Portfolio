import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Friends extends BaseSchema {
  protected tableName = 'friends'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user_1_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('user_2_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}