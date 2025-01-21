import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Channel from './channel.js'
import User from './user.js'

export default class ChannelMessage extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare channelId: number

  @column()
  declare userId: number

  @column()
  declare message: string

  @column.dateTime()
  declare timeSent: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationship with the Channel model
  @belongsTo(() => Channel, {
    foreignKey: 'channelId',
  })
  declare channel: BelongsTo<typeof Channel>

  // Relationship with the User model
  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>
}
