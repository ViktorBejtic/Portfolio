import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Channel from './channel.js'
import ServerInvite from './server_invite.js'

export default class Server extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare privacy: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare lastActivity: DateTime

  @manyToMany(() => User, {
    pivotTimestamps: true,
    pivotTable: 'server_user',
    localKey: 'id',
    pivotForeignKey: 'server_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'user_id',
    pivotColumns: ['kick_counter', 'ban','inServer', 'role', 'position'], 
  })
  declare users: ManyToMany<typeof User>

  @manyToMany(() => User, {
    pivotTimestamps: true,
    pivotTable: 'user_kicks',
    localKey: 'id',
    pivotForeignKey: 'server_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'kicked_user_id',
    pivotColumns: ['kicked_by_user_id'],
  })
  declare kickedUsers: ManyToMany<typeof User>

  @manyToMany(() => User, {
    pivotTimestamps: true,
    pivotTable: 'user_kicks',
    localKey: 'id',
    pivotForeignKey: 'server_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'kicked_by_user_id',
    pivotColumns: ['kicked_user_id'],
  })
  declare kicksGiven: ManyToMany<typeof User>

  @hasMany(() => ServerInvite)
  declare invites: HasMany<typeof ServerInvite>

  @hasMany(() => Channel, {
    foreignKey: 'serverId',
  })
  declare channels: HasMany<typeof Channel>
}
