import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class FriendRequest extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare senderId: number

  @column()
  declare receiverId: number

  @column()
  declare friendrequest_status: 'accepted' | 'rejected' | 'floating'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'senderId',
  })
  declare sender: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'receiverId',
  })
  declare receiver: BelongsTo<typeof User>
}
