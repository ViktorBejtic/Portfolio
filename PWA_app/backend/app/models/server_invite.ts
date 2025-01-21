import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Server from './server.js'
import { DateTime } from 'luxon'

export default class ServerInvite extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare serverId: number

  @column()
  declare invitedById: number

  @column()
  declare invitedUserId: number

  @belongsTo(() => Server)
  declare server: BelongsTo<typeof Server>

  @belongsTo(() => User, { foreignKey: 'invitedById' })
  declare invitedBy: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'invitedUserId' })
  declare invitedUser: BelongsTo<typeof User>

  @column()
  declare serverinvite_status: 'accepted' | 'rejected' | 'floating'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}