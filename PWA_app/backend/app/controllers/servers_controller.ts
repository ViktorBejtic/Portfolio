import { HttpContext } from '@adonisjs/core/http'
import Server from '../models/server.js'
import User from '../models/user.js'
import Channel from '../models/channel.js'
import Friend from '../models/friend.js'
import transmit from "@adonisjs/transmit/services/main"


export default class ServersController {
    async getServerList(ctx: HttpContext) {
        const user = ctx.auth.user!
    
        const servers = await user.related('servers')
            .query()
            .wherePivot('ban', false) 
            .andWhere('inServer', true)
        

        const result = servers.map((server) => ({
            id: server.id,
            name: server.name,
            avatar: `https://ui-avatars.com/api/?name=${server.name}`,
            privacy: server.privacy,  
            role: server.$extras.pivot_role, 
            position: server.$extras.pivot_position, 
        }))
        
        return {
            servers: result,
        }
    }

    async createServer(ctx: HttpContext) {

        const user = ctx.auth.user! 
    
        const {name,privacy} = ctx.request.only(['name','privacy'])
    
        const existingServer = await Server.query().where('name', name).first()
        if (existingServer) {
          return ctx.response.status(400).json({
            message: 'Server with this name already exists',
          })
        }
    
        try {
          const server = await Server.create({
            name,
            privacy,
          })

          const userServers = await user.related('servers').query()
          .wherePivot('ban', false)
          .andWhere('inServer', true)
          .orderBy('pivot_position')

          let position = 2;
          for (const userServer of userServers) {
          await user.related('servers').query()
              .wherePivot('server_id', userServer.id)
              .update({ position: position++ });
          }
    
          await server.related('users').attach({
            [user.id]: {
              role: 'creator', 
              position: 1, 
              ban: false, 
              inServer: true,
              kick_counter: 0, 
            },
          })

            await Channel.create({
                name: 'general',
                serverId: server.id,
                position: 1,
            })
    
        transmit.broadcast(`server-list:${user.id}`, {
            message:{"ServerId":server.id,"Action":"join"}
        })

        return{
            server: server
        }
        } catch (error) {
          console.error(error)
          return ctx.response.status(500).json({
            message: 'Failed to create server',
          })
        }
      }

    async leaveServer(ctx: HttpContext) {
        const user = ctx.auth.user!
        const server_id = ctx.request.input('serverId')

    
        const pivot = await user.related('servers')
            .query()
            .where('server_id', server_id)
            .first()
    
        if (!pivot) {
            return ctx.response.status(403).json({ message: `User does not have access to server with ID ${server_id}` })
        }
    
        if (pivot.$extras.pivot_role === 'creator') {
            return ctx.response.status(403).json({ message: 'Creators cannot leave their own servers' })
        }
    
        try {
            await user.related('servers')
                .query()
                .where('server_id', server_id)
                .update({ inServer: false });

                transmit.broadcast(`server-list:${user.id}`, {
                    message: "Successfully deleted server",
                    action: "showFriends",
                    serverId: server_id
                })   
                
                return {
                    message: 'Successfully left server'
                }
            
            } catch (error) {
            console.error('Error leaving server:', error)
            return ctx.response.status(500).json({ message: 'Failed to leave server', error })
        }
    }

    async updateServer(ctx: HttpContext) {
        const user = ctx.auth.user!
        const { serverId, name, privacy } = ctx.request.only(['serverId', 'name', 'privacy'])

        const server = await Server.findByOrFail('id', serverId)

        if (!server) {
            return ctx.response.status(404).json({ message: 'Server not found' });
        }

        const userServerPivot = await user.related('servers')
            .query()
            .where('server_id', serverId)
            .first();

        if (!userServerPivot) {
            return ctx.response.status(403).json({ message: 'You are not associated with this server' });
        }

        if (userServerPivot.$extras.pivot_ban) {
            return ctx.response.status(403).json({ message: 'You are banned from this server' });
        }

        try {
            await Server.query()
                .where('id', serverId)
                .update({ name, privacy })

            transmit.createStream

            transmit.broadcast(`server-list:${user.id}`, {
                message: "Successfully updated the server"
            })   

            return {
                message: 'Server updated successfully'
            }
        } catch (error) {
            console.error(error)
            return ctx.response.status(500).json({
                message: 'Failed to update server',
            })
        }
    }

    async deleteServer(ctx: HttpContext) {
        const user = ctx.auth.user!
        const server_id = ctx.request.input('serverId')                   
    
        const pivot = await user.related('servers')
            .query()
            .where('server_id', server_id)
            .first()
    
        if (!pivot) {
            return ctx.response.status(403).json({ message: `User does not have access to server with ID ${server_id}` })
        }
    
        if (pivot.$extras.pivot_role === 'member') {
            return ctx.response.status(403).json({ message: 'You are not the creator of this server' })
        }

        const server = await Server.find(server_id);

        if (!server) {
          return ctx.response.status(404).json({ message: 'Server not found' });
        }

        const allMembers = await server.related('users').query()
            .where('server_id', server_id)
        
        try {
            await server.delete();

            allMembers.forEach((member) => {
                transmit.broadcast(`server-list:${member.$extras.pivot_user_id}`, {
                    message: "Successfully deleted server",
                    action: "showFriends",
                    serverId: server_id
                })           
            })
    
        } catch (error) {
            console.error('Error deleting server:', error)
            return ctx.response.status(500).json({ message: 'Failed to delete server', error })
        }
    }

    async updateServerPositons(ctx: HttpContext) {
        const user = ctx.auth.user!
        const servers = ctx.request.input('servers')
        let banned = 0;

        if (!Array.isArray(servers)) {
            return ctx.response.status(400).json({ message: 'Invalid input format. Expected an array of servers.' })
          }
    
        if (!servers || !Array.isArray(servers)) {
          return ctx.response.status(400).json({ message: 'Invalid input format. Expected an array of servers.' })
        }

    
        try {
          for (const server of servers) {
            const { id, position } = server
            const pos = Number(position) - banned

    
            const pivot = await user.related('servers')
                .query()
                .where('server_id', id)
                .first()
    
            if (!pivot) {
              return ctx.response.status(403).json({ message: `User does not have access to server with ID ${id}` })
            }

            const isBanned = pivot.$extras.pivot_ban || !pivot.$extras.pivot_inServer;

            if (isBanned) {
                banned++;
                continue; 
              }
    
            await user.related('servers')
                .query()
                .where('server_id', id)
                .update({ position: pos })
          }
    
          return ctx.response.status(200).json({ message: 'Server positions updated successfully' })
        } catch (error) {
          console.error('Error updating server positions:', error)
          return ctx.response.status(500).json({ message: 'Failed to update server positions', error })
        }
      }    


    async getActiveServer(ctx: HttpContext) {
        const user = ctx.auth.user!

        const server_id = ctx.request.input('serverId')
        
        if (!server_id || typeof server_id !== 'number') {
            return ctx.response.status(400).json({ message: 'Invalid server ID' });
        }
        
        const activeServer = await Server.findByOrFail('id', server_id)
        
        if (!activeServer) {
            return ctx.response.status(404).json({ message: 'Server not found' });
        }
    
        const userServerPivot = await user.related('servers')
            .query()
            .where('server_id', server_id)
            .first();

        if (!userServerPivot) {
            return ctx.response.status(403).json({ message: 'You are not associated with this server' });
        }
        
        if (userServerPivot.$extras.pivot_ban) {
            return ctx.response.status(403).json({ message: 'You are banned from this server' });
        }

        

        const formattedActiveServer = {
            id: activeServer.id,
            name: activeServer.name,
            avatar: `https://ui-avatars.com/api/?name=${activeServer.name}`,
            privacy: activeServer.privacy,
            role: userServerPivot.$extras.pivot_role,
            userid: user.id,
        }
    
        return {
            formattedActiveServer,
        }
    }

    async getMemberList(ctx: HttpContext) {
        const user = ctx.auth.user!

        const server_id = ctx.request.input('serverId')
        
        if (!server_id || typeof server_id !== 'number') {
            return ctx.response.status(400).json({ message: 'Invalid server ID' });
        }
        
        const activeServer = await Server.findByOrFail('id', server_id)
        
        if (!activeServer) {
            return ctx.response.status(404).json({ message: 'Server not found' });
        }
    
        const userServerPivot = await user.related('servers')
            .query()
            .where('server_id', server_id)
            .first();

        if (!userServerPivot) {
            return ctx.response.status(403).json({ message: 'You are not associated with this server' });
        }
        
        if (userServerPivot.$extras.pivot_ban) {
            return ctx.response.status(403).json({ message: 'You are banned from this server' });
        }

        const members = await activeServer
            .related('users')
            .query()
            .wherePivot('ban', false) 
            .andWhere('inServer', true)
        
            const friendships = await Friend.query()
            .whereIn('user_1_id', [user.id])
            .whereIn('user_2_id', members.map((m) => m.id))
            .orWhereIn('user_1_id', members.map((m) => m.id))
            .whereIn('user_2_id', [user.id]);
          
          const friendIds = new Set(
            friendships.map((friend) =>
              friend.user1Id === user.id ? friend.user2Id : friend.user1Id
            )
          );
        
        const formattedMembers = members.map((member) => ({
            id: member.id,
            username: member.login,
            avatar: `https://ui-avatars.com/api/?name=${member.login}`,
            status: member.user_status,
            role: member.$extras.pivot_role,
            isFriend: friendIds.has(member.id),
        }))
    
        return {
            members: formattedMembers,
        }
    }

    async joinServer(ctx: HttpContext) {
        const user = ctx.auth.user!
        const servername = ctx.request.input('servername')


        const server = await Server.findBy('name', servername)

        if (!server) {
            this.createServer(ctx)
            return ctx.response.status(404).json({ message: `Server "${servername}" doesn't exist` });
        }else if (server && server.privacy){
            return ctx.response.status(404).json({ message: `Server "${servername}" doesn't exist` });
        }

        const userServerPivot = await user.related('servers')
            .query()
            .where('server_id', server.id)
            .first();

        if (userServerPivot ) {            
            if (userServerPivot.$extras.pivot_ban) {
                return ctx.response.status(403).json({ message: `You are banned from "${servername}"` });
            }
        }

        const userServer = await user.related('servers')
            .query()
            .where('server_id', server.id)
            .andWhere('inServer', true)
            .first();

        if (userServer) {
            return ctx.response.status(400).json({ message: `You are already a member of "${servername}"` });
        }

        const wasInServer = await server.related('users')
            .query()
            .where('user_id', user.id)
            .where('inServer', false)
            .first()


        try {

            const userServers = await user.related('servers').query()
                .andWhere('inServer', true)
                .orderBy('pivot_position')

            let position = 2;
            for (const userServer of userServers) {
            await user.related('servers').query()
                .wherePivot('server_id', userServer.id)
                .update({ position: position++ });
            }

            if (wasInServer) {
                await server.related('users')
                    .query()
                    .where('user_id', user.id)
                    .update({
                        inServer: true,
                        position: 1,
                    })
            }else {
                await server.related('users')
                    .attach({
                        [user.id]: {
                            role: 'member',
                            position: 1,
                            ban: false,
                            inServer: true,
                            kick_counter: 0,
                        }
                    })
            }

            transmit.broadcast(`server-list:${user.id}`, {
                message:{"ServerId":server.id,"Action":"join"}
            })

            return {
                serverId: server.id,
            }
        } catch (error) {
            console.error(error)
            return ctx.response.status(500).json({
                message: 'Failed to add user to server',
            })
        }
    }

    async kickServerMember(ctx: HttpContext) {
        const user = ctx.auth.user!
        const { serverId, memberId, command } = ctx.request.only(['serverId', 'memberId', 'command'])

        const server = await Server.findByOrFail('id', serverId)

        if (!server) {
            return ctx.response.status(404).json({ message: 'Server not found' });
        }

        const userServerPivot = await user.related('servers')
            .query()
            .where('server_id', serverId)
            .first();

        if (!userServerPivot) {
            return ctx.response.status(403).json({ message: 'You are not associated with this server' });
        }

        if (userServerPivot.$extras.pivot_ban) {
            return ctx.response.status(403).json({ message: 'You are banned from this server' });
        }

        let userToKick = null

        if(typeof memberId === 'number'){
            userToKick = await User.findByOrFail('id', memberId)
        }else{
            userToKick = await User.findByOrFail('login', memberId)
        }
        

        if (!userToKick) {
            return ctx.response.status(404).json({ message: 'User not found' });
        }

        const userToKickServerPivot = await userToKick.related('servers')
            .query()
            .where('server_id', serverId)
            .first();

        if (!userToKickServerPivot) {
            return ctx.response.status(400).json({ message: 'User is not a member of this server' });
        }

        try {
            const ownerOfServer = await server.related('users')
            .query()
            .where('role', 'creator')
            .first();

            const kickedUser = await userToKick.related('kickedUsers')
            .query()
            .where('server_id', serverId)
            .where('kicked_by_user_id', user.id)
            .first();

            if(!kickedUser){
                await userToKick.related('kickedUsers')
                .attach({
                    [serverId]: {
                        kicked_by_user_id: user.id
                    }
                })

                await server.related('users')
                .query()
                .where('user_id', userToKick.id)
                .update({ kick_counter: userToKickServerPivot.$extras.pivot_kick_counter + 1 })
                .update({ inServer: false })
            }else{
                await server.related('users')
                .query()
                .where('user_id', userToKick.id)
                .update({ inServer: false })
            }

            console.log("command: ", command)

            if (userToKickServerPivot.$extras.pivot_kick_counter + 1 >= 3) {
            
                await server
                  .related('users')
                  .query()
                  .where('user_id', userToKick.id)
                  .update({ ban: true });

            }else if (ownerOfServer && command && (user.id === ownerOfServer.id)){
                console.log("Banned user from server: ", userToKick.id, memberId)
                await server
                 .related('users')
                 .query()
                 .where('user_id', userToKick.id)
                 .update({ ban: true });
            }

            console.log("Kicked user from server: ", userToKick.id, memberId)

            transmit.broadcast(`server-list:${userToKick.id}`, {
                message: "User kicked from the server successfully",
                action: "showFriends",
                serverId: server.id
            })

        } catch (error) {
            console.error(error)
            return ctx.response.status(500).json({
                message: 'Failed to kick user from server',
            })
        }
    }

    async revokeUser(ctx: HttpContext) {    
        const user = ctx.auth.user!
        const {serverId, memberLogin} = ctx.request.only(['serverId', 'memberLogin'])


        try{

            const server = await Server.findByOrFail('id', serverId)
            
            const creator = await server.related('users').query().where('user_id',user.id).where('role', 'creator').first()
            
            if (!creator) {
                return ctx.response.status(403).json({ message: 'You are not the creator of this server' });
            }
            
            const member = await User.findByOrFail('login', memberLogin)
            
            await server.related('users').query().where('user_id', member.id).delete()

            transmit.broadcast(`server-list:${member.id}`, {
                message: "User kicked from the server successfully",
                action: "showFriends",
                serverId: serverId
            }) 

        }catch(err){
            return ctx.response.status(500).json({ message: 'Failed to revoke user from server' });
        }
    }

    async banServerMember(ctx: HttpContext) {
        const user = ctx.auth.user!
        const { serverId, memberId } = ctx.request.only(['serverId', 'memberId'])

        const server = await Server.findByOrFail('id', serverId)

        if (!server) {
            return ctx.response.status(404).json({ message: 'Server not found' });
        }

        const userServerPivot = await user.related('servers')
            .query()
            .where('server_id', serverId)
            .first();

        if (!userServerPivot) {
            return ctx.response.status(403).json({ message: 'You are not associated with this server' });
        }

        if (userServerPivot.$extras.pivot_ban) {
            return ctx.response.status(403).json({ message: 'You are banned from this server' });
        }

        if (userServerPivot.$extras.pivot_role === 'member') {
            return ctx.response.status(403).json({ message: 'You are not the creator/admin of this server' });
        }

        let userToBan = null

        try{
            userToBan = await User.findByOrFail('id', memberId);
        }catch{
            userToBan = await User.findByOrFail('login', memberId);
        }

        if (!userToBan) {
            return ctx.response.status(404).json({ message: 'User not found' });
        }

        const userToBanServerPivot = await userToBan.related('servers')
            .query()
            .where('server_id', serverId)
            .first();

        if (!userToBanServerPivot) {
            return ctx.response.status(400).json({ message: 'User is not a member of this server' });
        }

        try {
            await server.related('users')
            .query()
            .where('user_id', userToBan.id)
            .update({ ban: true , inServer: false})

            const userServers = await userToBan
              .related('servers')
              .query()
              .wherePivot('ban', false) 
              .orderBy('pivot_position');
                
            let position = 1;
            for (const userServer of userServers) {
              await userToBan
                .related('servers')
                .query()
                .wherePivot('server_id', userServer.id)
                .update({ position: position++ });
            }

            transmit.broadcast(`server-list:${memberId}`, {
                message: "User banned from the server successfully",
                action: "showFriends",
                serverId: server.id
            })   
        } catch (error) {
            console.error(error)
            return ctx.response.status(500).json({
                message: 'Failed to ban user from server',
            })
        }
    }

    async unbanServerMember(ctx: HttpContext) {
        const user = ctx.auth.user!
        const { serverId, membername } = ctx.request.only(['serverId', 'membername'])

        const server = await Server.findByOrFail('id', serverId)
        
        if (!server) {
            return ctx.response.status(404).json({ message: 'Server not found' });
        }

        const userServerPivot = user.related('servers')
            .query()
            .where('server_id', serverId)
            .first();

        if (!userServerPivot) {
            return ctx.response.status(403).json({ message: 'You are not associated with this server' });
        }

        const userToUnban = await User.findBy('login', membername)

        if (!userToUnban) {
            return ctx.response.status(404).json({ message: '${membername} doesnt exit / changed his name' });
        }

        const userToUnbanServerPivot = userToUnban.related('servers')
            .query()
            .where('server_id', serverId)
            .first();

        if (!userToUnbanServerPivot) {
            return ctx.response.status(400).json({ message: 'User is not a member of this server' });
        }

        try {
            await server.related('users')
            .query()
            .where('user_id', userToUnban.id)
            .update({ ban: false, kick_counter: 0 })

            await userToUnban.related('kickedUsers')
            .query()
            .delete()

            return {
                message: 'User unbanned from server successfully'
            }
        } catch (error) {
            console.error(error)
            return ctx.response.status(500).json({
                message: 'Failed to unban user from server',
            })
        }
    }


    async getServerChannels(ctx: HttpContext) {
        const user = ctx.auth.user!

        const server_id = ctx.request.input('serverId')
        
        const userServerPivot = await user.related('servers')
            .query()
            .where('server_id', server_id)
            .first();

        if (!userServerPivot) {
            return ctx.response.status(403).json({ message: 'You are not associated with this server' });
        }

        if (userServerPivot.$extras.pivot_ban) {
            return ctx.response.status(403).json({ message: 'You are banned from this server' });
        }

        if (!server_id || typeof server_id !== 'number') {
            return ctx.response.status(400).json({ message: 'Invalid server ID' });
        }

        const server = await Server.findByOrFail('id', server_id)

        if (!server) {
            return ctx.response.status(404).json({ message: 'Server not found' });
        }

        const serverChannls = await server.related('channels').query()

        const formattedChannels = serverChannls.map((channel) => ({
            id: channel.id,
            name: channel.name,
            position: channel.position,
        }))

        return {
            serverChannels: formattedChannels,
        }
    }

    async createChannel(ctx: HttpContext) {
        const user = ctx.auth.user!
        const { name, serverId } = ctx.request.only(['name', 'serverId'])

        const server = await Server.findByOrFail('id', serverId)

        if (!server) {
            return ctx.response.status(404).json({ message: 'Server not found' });
        }

        const userServerPivot = await user.related('servers')
            .query()
            .where('server_id', serverId)
            .first();

        if (!userServerPivot) {
            return ctx.response.status(403).json({ message: 'You are not associated with this server' });
        }

        if (userServerPivot.$extras.pivot_ban) {
            return ctx.response.status(403).json({ message: 'You are banned from this server' });
        }

        const existingChannel = await Channel.query()
            .where('name', name)
            .where('server_id', serverId)
            .first()

        if (existingChannel) {
            return ctx.response.status(400).json({
                message: 'Channel with this name already exists',
            })
        }

        const channelCount = await Channel.query()
            .where('serverId', serverId)
            .count('* as totalChannels')
            .first();

        const position = Number(channelCount?.$extras?.totalChannels) + 1;

        try {
            await Channel.create({
                name,
                serverId,
                position,
            })
            

            transmit.broadcast(`channel-list:${serverId}`, {
                
            })
        } catch (error) {
            console.error(error)
            return ctx.response.status(500).json({
                message: 'Failed to create channel',
            })
        }
    }


    async updateChannelPositons(ctx: HttpContext) {
        const user = ctx.auth.user!
        const { channels, serverId } = ctx.request.only(['channels', 'serverId'])
        let deleted = 0;

        if (!Array.isArray(channels)) {
            return ctx.response.status(400).json({ message: 'Invalid input format. Expected an array of servers.' })
          }
    
        if (!channels || !Array.isArray(channels)) {
          return ctx.response.status(400).json({ message: 'Invalid input format. Expected an array of servers.' })
        }


        const pivot = await user.related('servers')
                .query()
                .where('server_id', serverId)
                .first()
    
            if (!pivot) {
              return ctx.response.status(403).json({ message: `User does not have access to server with ID ${serverId}` })
            }
    
        try {
          for (const channel of channels) {
            const { id, position } = channel
            const pos = Number(position) - deleted


            const isDeleted = !(await Channel.query()
                .where('serverId', serverId)
                .where('id', id)
                .first());

            if (isDeleted) {
                deleted++;
                continue; 
              }
    
              await Channel.query()
              .where('serverId', serverId)
              .where('id', id)
              .update({ position: pos });
          }
    
          transmit.broadcast(`channel-list:${serverId}`, {})

        } catch (error) {
          console.error('Error updating server positions:', error)
          return ctx.response.status(500).json({ message: 'Failed to update server positions', error })
        }
      }  
      
    
    async updateChannel(ctx: HttpContext) {
        const user = ctx.auth.user!
        const { channelId, name, serverId } = ctx.request.only(['channelId', 'name', 'serverId'])

        const server = await Server.findByOrFail('id', serverId)

        if (!server) {
            return ctx.response.status(404).json({ message: 'Server not found' });
        }

        const userServerPivot = await user.related('servers')
            .query()
            .where('server_id', serverId)
            .first();

        if (!userServerPivot) {
            return ctx.response.status(403).json({ message: 'You are not associated with this server' });
        }

        if (userServerPivot.$extras.pivot_ban) {
            return ctx.response.status(403).json({ message: 'You are banned from this server' });
        }

        const channel = await Channel.query()
            .where('id', channelId)
            .where('serverId', serverId)
            .first()

        if (!channel) {
            return ctx.response.status(404).json({ message: 'Channel not found' });
        }

        try {
            await Channel.query()
                .where('id', channelId)
                .where('serverId', serverId)
                .update({ name })

            transmit.broadcast(`channel-list:${serverId}`, {})

        } catch (error) {
            console.error(error)
            return ctx.response.status(500).json({
                message: 'Failed to update channel',
            })
        }
    }

    async deleteChannel(ctx: HttpContext) {
        const user = ctx.auth.user!
        const { channelId, serverId } = ctx.request.only(['channelId', 'serverId'])

        const server = await Server.findByOrFail('id', serverId)

        if (!server) {
            return ctx.response.status(404).json({ message: 'Server not found' });
        }

        const userServerPivot = await user.related('servers')
            .query()
            .where('server_id', serverId)
            .first();

        if (!userServerPivot) {
            return ctx.response.status(403).json({ message: 'You are not associated with this server' });
        }

        if (userServerPivot.$extras.pivot_ban) {
            return ctx.response.status(403).json({ message: 'You are banned from this server' });
        }

        const channel = await Channel.query()
            .where('id', channelId)
            .where('serverId', serverId)
            .first()

        if (!channel) {
            return ctx.response.status(404).json({ message: 'Channel not found' });
        }

        try {
            await Channel.query()
                .where('id', channelId)
                .where('serverId', serverId)
                .delete()

            const channels = await Channel.query()
                .where('serverId', serverId)
                .orderBy('position')
            
            for (let i = 0; i < channels.length; i++) {
                const channel = channels[i]
                await Channel.query()
                    .where('id', channel.id)
                    .update({ position: i + 1 })
            }

            transmit.broadcast(`channel-list:${serverId}`, {})

        } catch (error) {
            console.error(error)
            return ctx.response.status(500).json({
                message: 'Failed to delete channel',
            })
        }
    }








}