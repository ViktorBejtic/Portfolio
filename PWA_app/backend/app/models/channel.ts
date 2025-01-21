import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Server from './server.js'
import ChannelMessage from './channel_message.js'

export default class Channel extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare serverId: number

  @column()
  declare name: string

  @column()
  declare position: number

  @column.dateTime()
  declare lastActivity: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationship with the Server model
  @belongsTo(() => Server, {
    foreignKey: 'serverId',
  })
  declare server: BelongsTo<typeof Server>

  // Relationship with the ChannelMessage model
  @hasMany(() => ChannelMessage, {
    foreignKey: 'channelId',
  })
  declare messages: HasMany<typeof ChannelMessage>
}
