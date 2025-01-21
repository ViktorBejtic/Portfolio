import { HttpContext } from '@adonisjs/core/http'
import User from '../models/user.js'
import transmit from "@adonisjs/transmit/services/main"


export default class UserController {

async getMainUser(ctx: HttpContext) {
    const user = ctx.auth.user!

    const mainUser = await User.query()
      .where('id', user.id)
      .firstOrFail()

    if (!mainUser) {
        return ctx.response.status(404).json({ message: 'User not found' })
      }

    const formattedMainUser = {
        id: mainUser.id,
        nickname: mainUser.login,
        name: mainUser.firstName,
        surname: mainUser.lastName,
        email: mainUser.email,
        avatar: `https://ui-avatars.com/api/?name=${mainUser.login}`,
        allnotifications: mainUser.allnotifications,
        status: mainUser.user_status,
    }


    return {
        formattedMainUser,
    }
}

async updateMainUser(ctx: HttpContext) {
    const user = ctx.auth.user!

    const { nickname, name, surname, email, allnotifications, status } = ctx.request.all()

    const mainUser = await User.query()
      .where('id', user.id)
      .firstOrFail()

    if (!mainUser) {
        return ctx.response.status(404).json({ message: 'User not found' })
      }

    const existingUser = await User.query()
        .where('login', nickname)
        .whereNot('id', user.id) 
        .first();

    if (existingUser) {
      return ctx.response.status(400).json({
        message: 'Nickname is already taken',
      });
    }
    
    mainUser.login = nickname
    mainUser.firstName = name
    mainUser.lastName = surname
    mainUser.email = email
    mainUser.allnotifications = allnotifications
    mainUser.user_status = status

    await mainUser.save()

    console.log('User updated:', mainUser.login)
  
    transmit.broadcast(`updatedUser:${mainUser.login}`, {
      userStatus: status,
    }); 
}




}