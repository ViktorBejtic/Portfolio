import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class DirectMessage extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare senderUserId: number

  @column()
  declare receiverUserId: number

  @column()
  declare message: string

  @column.dateTime()
  declare timeSent: DateTime

  @belongsTo(() => User, {
    foreignKey: 'senderUserId',
  })
  declare sender: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'receiverUserId',
  })
  declare receiver: BelongsTo<typeof User>
}
