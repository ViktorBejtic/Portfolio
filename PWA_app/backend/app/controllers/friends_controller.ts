import { HttpContext } from '@adonisjs/core/http'
import User from '../models/user.js'
import FriendRequest from '../models/friend_request.js'
import Friend from '../models/friend.js'
import transmit from "@adonisjs/transmit/services/main"


export default class FriendsController {
    async createFriendRequest(ctx: HttpContext) {
        const user = ctx.auth.user!; 
      
        const receiverLogin = ctx.request.input('receiverLogin'); 

        if(receiverLogin === user.login) {
            return ctx.response.badRequest({ message: 'You cannot send a friend request to yourself' });
        }
      
        try {
          const receiver = await User.findBy('login', receiverLogin);
          if (!receiver) {
            return ctx.response.status(404).json({ message: 'User not found' });
          }
      
          const existingFriendship = await Friend.query()
            .where(function (query) {
              query
                .where('user_1_id', user.id)
                .andWhere('user_2_id', receiver.id);
            })
            .orWhere(function (query) {
              query
                .where('user_1_id', receiver.id)
                .andWhere('user_2_id', user.id);
            })
            .first();

      
          if (existingFriendship) {
            return ctx.response.badRequest({ message: 'You are already friends' });
          }
      
          const existingRequest = await FriendRequest.query()
            .where('sender_id', user.id)
            .andWhere('receiver_id', receiver.id)
            .first();
      
          if (existingRequest) {
            if (existingRequest.friendrequest_status === 'rejected') {
              existingRequest.friendrequest_status = 'floating';
              await existingRequest.save();

              transmit.broadcast(`friend-request-change:${receiver.id}`,{
                message: 'Friend requests changed',
              })

              return ctx.response.json({ message: 'Friend request sent' });
            }
          }
      
          const friendRequest = await FriendRequest.create({
            senderId: user.id,
            receiverId: receiver.id,
            friendrequest_status: 'floating',
          });

          const friendRequestBody = {
            friendRequestId: friendRequest.id,
            senderId: friendRequest.senderId,
            receiverId: friendRequest.receiverId,
            friendrequest_status: friendRequest.friendrequest_status
          }
      

          transmit.broadcast(`channel-current-chatting:${receiver.id}}`, {
            friendRequest: friendRequestBody,
          });


          transmit.broadcast(`friend-request-change:${receiver.id}`,{
            message: 'Friend requests changed',
          })
         
        } catch (error) {
          console.error(error);
          return ctx.response.status(500).json({
            message: 'Failed to send friend request',
            error: error.message || 'An unexpected error occurred',
          });
        }
      }

    async acceptFriendRequest(ctx: HttpContext) {
        const user = ctx.auth.user!

        const friendRequestId = ctx.request.input('friendRequestId')


        const friendRequest = await FriendRequest.findOrFail(friendRequestId)

        if (friendRequest.receiverId !== user.id) {
            return ctx.response.badRequest({ message: 'You are not the receiver of this request' })
        }

        if (friendRequest.friendrequest_status === 'accepted') {
            return ctx.response.badRequest({ message: 'Friend request already accepted' })
        }

        friendRequest.friendrequest_status = 'accepted'

        const sender = await User.find(friendRequest.senderId)
        const receiver = await User.find(friendRequest.receiverId)

        if (!sender || !receiver) {
            return ctx.response.badRequest({ message: 'Invalid sender or receiver ID'})
        }
    
        const existingFriendship = await Friend.query()
          .where('user1Id', friendRequest.senderId)
          .where('user2Id', friendRequest.receiverId)
          .orWhere('user1Id', friendRequest.receiverId)
          .where('user2Id', friendRequest.senderId)
          .first()
    
        if (existingFriendship) {
          return ctx.response.badRequest({ message: 'Friendship already exists'})
        }
    
        const user1Id = Math.min(friendRequest.senderId, friendRequest.receiverId)
        const user2Id = Math.max(friendRequest.senderId, friendRequest.receiverId)
    
        await Friend.create({
          user1Id : user1Id,
          user2Id : user2Id,
        })

        await friendRequest.save()

        transmit.broadcast(`friend-request-change:${user.id}`,{
          message: 'Friend requests changed',
        })

        transmit.broadcast(`friend-list-change:${sender.id}`,{
          message: 'Friend list changed',
        })

        transmit.broadcast(`friend-list-change:${receiver.id}`,{
          message: 'Friend list changed',
        })
    }

    async rejectFriendRequest(ctx: HttpContext) {
        const user = ctx.auth.user!

        const friendRequestId = ctx.request.input('friendRequestId')


        const friendRequest = await FriendRequest.findOrFail(friendRequestId)

        if (friendRequest.receiverId !== user.id) {
            return ctx.response.badRequest({ message: 'You are not the receiver of this request' })
        }

        if (friendRequest.friendrequest_status === 'rejected') {
            return ctx.response.badRequest({ message: 'Friend request already rejected' })
        }

        friendRequest.friendrequest_status = 'rejected'

        await friendRequest.save()


        transmit.broadcast(`friend-request-change:${user.id}`,{
          message: 'Friend requests changed',
        })
    }

    async getFriendRequests(ctx: HttpContext) {
        const user = ctx.auth.user!
    
        const friendRequests = await FriendRequest.query()
          .where('receiverId', user.id)
          .where('friendrequest_status', 'floating')
          .preload('sender')
          .preload('receiver')
        
          const mappedRequests = friendRequests.map((request) => ({
            friendRequestId: request.id,
            senderAvatar: `https://ui-avatars.com/api/?name=${request.sender.login}`,
            senderName: request.sender.login,
          }))

    
        return {
          mappedRequests,
        }
      }

    async getFriendslist(ctx: HttpContext) {
        const user = ctx.auth.user!

        const friends = await Friend.query()
          .where('user1Id', user.id)
          .orWhere('user2Id', user.id)
          .preload('user1')
          .preload('user2')
        
        const mappedFriends = friends.map((friend) => ({
            id : friend.id,
            friendId: friend.user1.id === user.id ? friend.user2.id : friend.user1.id,
            friendName: friend.user1.id === user.id ? friend.user2.login : friend.user1.login,
            friendAvatar: `https://ui-avatars.com/api/?name=${friend.user1.id === user.id ? friend.user2.login : friend.user1.login}`,
            friendStatus: friend.user1.id === user.id ? friend.user2.user_status : friend.user1.user_status,
        }))
    
        return {
          mappedFriends,
        }
    }

    async removeFriend(ctx: HttpContext) {
        const user = ctx.auth.user!
    
        const friendId = ctx.request.input('friendId')
    
        const friendship = await Friend.query()
          .where('user1Id', user.id)
          .where('user2Id', friendId)
          .orWhere('user1Id', friendId)
          .where('user2Id', user.id)
          .first()


        if (!friendship) {
          return ctx.response.status(404).json({ message: 'Friendship not found' });
        }
    
        await friendship.delete()
    
        transmit.broadcast(`friend-list-change:${user.id}`,{
          message: 'Friend list changed',
        })

        transmit.broadcast(`friend-list-change:${friendId}`,{
          message: 'Friend list changed',
        })
      }
    
    async getFriendshipId(ctx: HttpContext) {
        const user = ctx.auth.user!
    
        const friendId = ctx.request.input('friendId')
    
        const friend = await Friend.query()
        .select('id')
        .where((query) => {
          query
          .where(function (query) {
            query
              .where('user_1_id', user.id)
              .andWhere('user_2_id', friendId);
          })
          .orWhere(function (query) {
            query
              .where('user_1_id', friendId)
              .andWhere('user_2_id', user.id);
          })
          
        }).first()

        return{
          friendshipId: friend?.id
        }
  }

  async informFriendsAboutStatusChange(ctx: HttpContext) {
    const user = ctx.auth.user!
  
    const allFriends = await Friend.query()
      .where('user1Id', user.id)
      .orWhere('user2Id', user.id)
      .preload('user1')
      .preload('user2')

    console.log("Informing about change of user: ", user.login)
      
    allFriends.forEach((friend) => {
      const friendId = friend.user1.id === user.id ? friend.user2.id : friend.user1.id
      transmit.broadcast(`friend-list-change:${friendId}`)
      console.log("Informed user: ", friend.user1.id === user.id ? friend.user2.id : friend.user1.id)
    })
  }
}