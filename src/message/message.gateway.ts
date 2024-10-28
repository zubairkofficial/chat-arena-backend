import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Cron } from '@nestjs/schedule';
import { MessageService } from './message.service';
import { UserService } from '../user/user.service';
import { ArenaService } from '../arena/arena.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Message } from './entities/message.entity';
import { LangChainService } from '../langchain/langchain.service';
import { UserArenaService } from '../user-arena/user-arena.service';
require('dotenv').config();
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['*'],
    credentials: true,
  },
})
export class MessageGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private activeRooms: Map<string, { expiry: number; users: Set<string> }> = new Map();
  private connectedUsers: Map<string, { socketId: string; rooms: Set<string> }> = new Map();
  private activeConversations: Set<string> = new Set(); // Track active conversations
  private lastMessageTimestamps: Map<string, number> = new Map(); // Track last message times


  constructor(
    private readonly messageService: MessageService,
    private readonly userService: UserService,
    private readonly arenaService: ArenaService,
    private readonly langchainService: LangChainService,
    private readonly userArenaService: UserArenaService,
    
  ) {
    
  }

  afterInit(server: Server) {
    console.log('WebSocket initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedUsers.forEach(({ socketId, rooms }, userId) => {
      if (socketId === client.id) {
        rooms.forEach(room => this.server.to(room).emit('userLeft', userId));
        this.connectedUsers.delete(userId);
      }
    });
  }




  @SubscribeMessage('leaveRoom')
async handleLeaveRoom(client: Socket, { userId, arenaId }: { userId: string; arenaId: string }) {
  try {
    // Ensure the user is leaving the correct room
    const userArena = await this.userArenaService.getUserAndArena(arenaId, userId);
    
    if (userArena) {
      // Remove user from the arena
      client.leave(arenaId);
      this.server.to(arenaId).emit('userLeft', { userId });
      
      // Optionally, remove the user-arena association
      await this.userArenaService.removeUserArena(userId, arenaId);
    }
  } catch (error) {
    console.error('Error leaving room:', error);
    client.emit('error', error.message || 'Failed to leave room');
  }
}




  @SubscribeMessage('joinRoom')
async handleJoinRoom(client: Socket, { userId, arenaId }: { userId: string; arenaId: string }) {
  try {
    const existUser = await this.userService.getUserById(userId);
    if (!existUser) throw new NotFoundException('Invalid user specified');

    const arena = await this.arenaService.getArenaById(arenaId);
    if (!arena) throw new BadRequestException(`Arena with ID ${arenaId} does not exist`);

    const userArena=await this.userArenaService.getUserAndArena(arenaId,userId)
    const room = this.activeRooms.get(arenaId);
    if (!room) {
      // Set room expiry for 1 hour from joining time
      this.activeRooms.set(arenaId, { expiry: Date.now() + 120000, users: new Set([userId]) });
    } else {
      room.users.add(userId);
      room.expiry = Date.now() + 120000; // Extend expiry on reactivation
    }
this.arenaService.joinArena(arenaId,userId)
    // Check if the user is already in the arena
    if ( userArena) {
      // Emit an event indicating the user has rejoined
      client.emit('userRejoined', { userId });
    } else {
      await this.userArenaService.createUserArena(arena,existUser)

      // User is not in the room, so they can join
      client.join(arenaId);
      this.server.to(arenaId).emit('userJoined', { userId });
      
      // Add to activeConversations and initialize last message timestamp
      this.addActiveConversation(arenaId);
    }

  } catch (error) {
    console.error('Error joining room:', error);
    client.emit('error', error.message || 'Failed to join room');
  }
}


  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, { userId, arenaId, content }: { userId: string; arenaId: string; content: string }) {
    try {
      const message = await this.messageService.createMessage({
        senderId: userId,
        arenaId,
        content: content,
        senderType: 'user',
      });

      this.server.to(arenaId).emit('receiveMessage', message);

      // Update last message timestamp for the arena
      this.lastMessageTimestamps.set(arenaId, Date.now());
      this.addActiveConversation(arenaId);
    } catch (error) {
      console.error('Error handling sendMessage:', error);
      client.emit('error', error.message || 'Failed to send message');
    }
  }

  @Cron('*/10 * * * * *') // Checks every minute
  handleExpiryCron() {
    const now = Date.now();
    this.activeRooms.forEach((room, arenaId) => {
      if (now > room.expiry) {
        console.log(`Expiring room: ${arenaId}`);
        this.arenaService.deleteArena(arenaId)
        this.server.to(arenaId).emit('roomExpired', { arenaId });
        this.activeRooms.delete(arenaId);
      }
    });
  }

  @Cron(process.env.CRON_SCHEDULE || '*/20 * * * * *')
  async handleCron() {
    console.log('Cron job triggered with activeConversations:', Array.from(this.activeConversations));

    for (const arenaId of this.activeConversations) {
      const lastMessageTime = this.lastMessageTimestamps.get(arenaId);

      // Check if a message was received within the last 20 seconds
      if (lastMessageTime && Date.now() - lastMessageTime <= 20000) {
        try {
          const arena = await this.arenaService.getArenaWithAIFigure(arenaId);
          const previousMessages = await this.messageService.getPreviousMessages(arenaId, process.env.NUMBER_OF_Previous_Messages?+process.env.NUMBER_OF_Previous_Messages:7);

          if (Array.isArray(arena.arenaAIFigures)) {
            for (const arenaAiFigure of arena.arenaAIFigures) {
              const aiFigure = arenaAiFigure.aiFigure;
              if (aiFigure) {
                const aiResponse = await this.generateAIResponse(arena.name, previousMessages,arenaId, aiFigure.prompt);

                const aiMessage = await this.messageService.createMessage({
                  senderId: aiFigure.id,
                  content: aiResponse,
                  arenaId,
                  senderType: 'ai',
                });

                console.log(`Sending AI message from ${aiFigure.name} in arena: ${arenaId}`);
                this.server.to(arenaId).emit('receiveMessage', aiMessage);
              }
            }
          }
        } catch (error) {
          console.error(`Error processing conversation for arena ${arenaId}:`, error);
        }
      } else {
        // If no recent message, remove arena from active conversations
        console.log(`No recent messages in arena ${arenaId}; skipping AI response.`);
        this.activeConversations.delete(arenaId);
      }
    }
  }

  addActiveConversation(arenaId: string) {
    if (!this.activeConversations.has(arenaId)) {
      this.activeConversations.add(arenaId);
      console.log(`Added arena ${arenaId} to activeConversations. Current state:`, Array.from(this.activeConversations));
    }
  }

  async generateAIResponse(
    topic: string,
    previousMessages: Message[],
    arenaId: string,
    prompt: string
  ): Promise<string> {
      // Concatenate previous messages to form the conversation context
      const context = previousMessages.map((msg) => `${msg.senderType}: ${msg.content}`).join('\n');
  
      // Pass all relevant data to langchainService's processMessage method
      return this.langchainService.processMessage( topic, arenaId, prompt, context);
  }
  
}








