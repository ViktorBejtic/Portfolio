import { BaseModel, beforeSave, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import hash from '@adonisjs/core/services/hash'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { DateTime } from 'luxon'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Server from './server.js'
import ChannelMessage from './channel_message.js'
import DirectMessage from './direct_message.js'
import FriendRequest from './friend_request.js'
import Friend from './friend.js'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare login: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare email: string

  @column()
  declare allnotifications: boolean

  @column()
  declare user_status: 'Online' | 'Offline' | 'Do Not Disturb'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @hasMany(() => ChannelMessage, {
    foreignKey: 'userId',
  })
  declare messages: HasMany<typeof ChannelMessage>

  @manyToMany(() => Server, {
    pivotTimestamps: true,
    pivotTable: 'server_user',
    localKey: 'id',
    pivotForeignKey: 'user_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'server_id',
    pivotColumns: ['kick_counter', 'ban', 'inServer', 'role', 'position'], 
  })
  declare servers: ManyToMany<typeof Server>

  @manyToMany(() => Server, {
    pivotTimestamps: true,
    pivotTable: 'user_kicks',
    localKey: 'id',
    pivotForeignKey: 'kicked_user_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'server_id',
    pivotColumns: ['kicked_by_user_id'],
  })
  declare kickedUsers: ManyToMany<typeof Server>

  @manyToMany(() => Server, {
    pivotTimestamps: true,
    pivotTable: 'user_kicks',
    localKey: 'id',
    pivotForeignKey: 'kicked_by_user_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'server_id',
    pivotColumns: ['kicked_user_id'],
  })
  declare kicksGiven: ManyToMany<typeof Server>

  @hasMany(() => DirectMessage, {
    foreignKey: 'senderUserId',
  })
  declare directMessages: HasMany<typeof DirectMessage>

  @hasMany(() => FriendRequest, {
    foreignKey: 'senderId',
  })
  declare friendRequests: HasMany<typeof FriendRequest>

  @hasMany(() => Friend, {
    foreignKey: 'user1Id',
  })
  declare friends1: HasMany<typeof Friend>
  
  @hasMany(() => Friend, {
    foreignKey: 'user2Id',
  })
  declare friends2: HasMany<typeof Friend>

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      
      user.password = await hash.make(user.password)
    }
  }

  static accessTokens = DbAccessTokensProvider.forModel(User,{
    expiresIn: '12h'
  })

  public async verifyPassword(user : User,plainText: string): Promise<boolean> {
    const passwordHash = Buffer.isBuffer(user.password)
    ? user.password.toString('utf-8')
    : user.password;

  return hash.verify(passwordHash, plainText);  }
}
