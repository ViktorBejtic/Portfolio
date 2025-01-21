import { HttpContext } from '@adonisjs/core/http'
import User from '../models/user.js'

export default class AuthController {
  async register(ctx: HttpContext) {
    const { login, password, firstName, lastName, email } = ctx.request.only([
      'login',
      'password',
      'firstName',
      'lastName',
      'email',
    ])


    try {
      const user = await User.create({ login, password, firstName, lastName, email, user_status: 'Offline' })

      const token = await User.accessTokens.create(user)


      return {
        user,
        token,
      }
    } catch (error) {
      return ctx.response.badRequest({ message: 'Registration failed', error })
    }
  }

  async login(ctx: HttpContext) {
    const { login, password } = ctx.request.only(['login', 'password'])


    try {
      const user = await User.findByOrFail('login', login)

      if (!(await user.verifyPassword(user, password))) {
        return ctx.response.unauthorized({ message: 'Invalid login or password' })
      }

      user.user_status = 'Online'

      user.save()

      const token = await User.accessTokens.create(user)

      return ctx.response.ok({
        user,
        token,
       })
    } catch {
      return ctx.response.unauthorized({ message: 'Invalid login or password' })
    }
  }

  async logout(ctx: HttpContext) {
    try {
      const user = ctx.auth.user!

      user.user_status = 'Offline'
      await user.save()

      await User.accessTokens.delete(user, user.currentAccessToken.identifier)

      return ctx.response.ok({ message: 'Logged out successfully' })

    } catch (error) {
      return ctx.response.internalServerError({ message: 'Logout failed', error })
    }
  }

  async check(ctx: HttpContext) {
    const user = ctx.auth.user!

    const check = await ctx.auth.check()


    if (!check) {
      return ctx.response.unauthorized({ message: 'Unauthorized' })
    }else{
      return ctx.response.ok({ user })
    }
  }
}
