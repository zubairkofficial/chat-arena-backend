import { AIFigureService } from './../aifigure/aifigure.service';
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
import { ArenaAIFigure } from '../arena-ai-figure/entities/arena-ai-figure.entity';
import { Arena } from '../arena/entities/arena.entity';
import { TooManyRequestsException } from '../errors/exceptions';
import { UserTier } from '../common/enums';
import { LlmModelService } from '../llm-model/llm-model.service';
import { LlmModel } from '../llm-model/entities/llm-model.entity';
require('dotenv').config();
@WebSocketGateway({
  // namespace: '/api/v1/socket',
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
    private readonly aiFigureService: AIFigureService,
    private readonly llmModelService: LlmModelService,
    
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
    await this.userArenaService.removeUserArena(userId, arenaId);
    const leftArena= await this.arenaService.joinArena(arenaId,userId)
    
    if (userArena) {
      // Remove user from the arena
      client.leave(arenaId);
      this.server.to(arenaId).emit('userLeft', { userId, leftArena});
      
      // Optionally, remove the user-arena association
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
      const arenaExpiryInMillisecond=new Date(arena.expiryTime).getTime()
      // Set room expiry for 1 hour from joining time
      this.activeRooms.set(arenaId, { expiry: arenaExpiryInMillisecond, users: new Set([userId]) });
    } 
  
    // Check if the user is already in the arena
    if ( userArena) {
 const joinArena= await this.arenaService.joinArena(arenaId,userId)

      // Emit an event indicating the user has rejoined
      client.emit('userRejoined', { userId ,joinArena});
    } else {
      await this.userArenaService.createUserArena(arena,existUser)

      // User is not in the room, so they can join
      client.join(arenaId);
      const joinArena= await this.arenaService.joinArena(arenaId,userId)

      this.server.to(arenaId).emit('userJoined', { userId,joinArena });
      
      // Add to activeConversations and initialize last message timestamp
      // this.addActiveConversation(arenaId);
    }

  } catch (error) {
    console.error('Error joining room:', error);
    client.emit('error', error || 'Failed to join room');
  }
}


  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, { userId, arenaId, content }: { userId: string; arenaId: string; content: string }) {
    try {

      const existUser = await this.userService.getUserById(userId);
     if (!existUser) throw new NotFoundException('Invalid user specified');
     if(existUser.availableCoins<=0)throw new TooManyRequestsException('limit exceded'); 
      await this.userService.updateUserSubtractCoins(Number(existUser.availableCoins)-Number(process.env.DEDUCTION_COINS),existUser)
      const message = await this.messageService.createMessage({
        senderId: userId,
        arenaId,
        content: content,
        senderType: 'user',
      });

      this.server.to(arenaId).emit('receiveMessage', {message,user: {...existUser}});

      // Update last message timestamp for the arena
      this.lastMessageTimestamps.set(arenaId, Date.now());
      this.addActiveConversation(arenaId);
    } catch (error) {
      console.error('Error handling sendMessage:', error);
      client.emit('error', error.message || 'Failed to send message');
    }
  }

  @Cron(process.env.ARENA_ROOM_EXPIRY || '*/60 * * * * *') // Checks every minute
  async handleExpiryCron() {
      const now = new Date();
      const arenas = await this.arenaService.getAllArenas();
  
      arenas.forEach(async (room) => {
          try {
              // Check if expiryTime exists, then parse it to a Date object
              const expiryTimeString = room.expiryTime;
  
              // If expiryTimeString is null or undefined, skip this room
              if (!expiryTimeString) {
                  return;
              }
  
              // Parse expiry time from the stored string (assuming it is in ISO format or a compatible format)
              const expiryTime = new Date(expiryTimeString);
              
              // Compare current time with expiry time
              const currentTimeISo=now.toISOString()
              const expiryTimeISO=expiryTime.toISOString()
              console.log("expiryTime",currentTimeISo,"now",expiryTimeISO)
              if (currentTimeISo >= expiryTimeISO) {
                  console.log(`Expiring room: ${room.id}`);
                  await this.arenaService.deleteArena(room.id);
                  this.server.to(room.id).emit('roomExpired', { roomId: room.id });
                  this.activeRooms.delete(room.id);
              }
          } catch (error) {
              console.error(`Error processing room ${room.id}:`, error);
          }
      });
  }
  




 
  @Cron( process.env.DAILY_CRON_JOB ?? '0 0 * * *')
  async dailyFreeCoins() {
  const users= await this.userService.getAllUser()
  const freeToken = await Promise.all(
    users?.map(async (item) => {
      if (item.tier === UserTier.FREE) {
        await this.userService.updateUserSubtractCoins(100, item);
        return item;  // Return updated user data
      }
      return null;  // For non-FREE users, you can return null or skip
    })
  );
   console.log("free",freeToken) 
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
          const previousMessages = await this.messageService.getPreviousMessages(arenaId, process.env.NUMBER_OF_Previous_Messages ? +process.env.NUMBER_OF_Previous_Messages : 7);
          const modelIds = arena?.arenaModel?.map(item => JSON.parse(item).value);
          let models = await fetchModelsConcurrently(modelIds, this.llmModelService);
          const llmModels=  await this.llmModelService.getLlmModelByName()
     
          if (Array.isArray(arena.arenaAIFigures)) {
            // Send one message after 20 seconds
            for (const arenaAiFigure of arena.arenaAIFigures) {
              const aiFigure = arenaAiFigure.aiFigure;
              if (aiFigure) {
                // Introduce a delay before sending the AI response
           
                  try {
                    const aiResponse = await this.generateAIResponse(arena,models.length>0?models:[llmModels], previousMessages, arenaAiFigure);
                    const message = await this.messageService.createMessage({
                      senderId: aiFigure.id,
                      content: aiResponse,
                      arenaId,
                      senderType: 'ai',
                    });
                   const aiFigureRes=await this.aiFigureService.getAIFigureById(aiFigure.id)
                    console.log(`Sending AI message from ${aiFigure.name} in arena: ${arenaId}`);
                    this.server.to(arenaId).emit('receiveMessage', {message,user:{...aiFigureRes}});
                  } catch (responseError) {
                    console.error(`Error generating AI response for ${aiFigure.name} in arena ${arenaId}:`, responseError);
                  }
              
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
    arena,
    models: LlmModel[],
    previousMessages: Message[],
    arenaAiFigure: ArenaAIFigure
  ): Promise<string> {
      // Concatenate previous messages to form the conversation context
      const context = previousMessages.map((msg) => `${msg.senderType}: ${msg.content}`).join('\n');
      const userMessage = previousMessages.length > 0 ? previousMessages[previousMessages.length - 1].content : '';

      // Pass all relevant data to langchainService's processMessage method
      return this.langchainService.processMessage(arena, models[0],  arenaAiFigure, context,userMessage);
  }
   
}

const fetchModelsConcurrently = async (modelIds: string[], llmModelService: LlmModelService): Promise<any[]> => {
  try {
    const fetchPromises = modelIds.map(id => llmModelService.findOne(id));
    const models = await Promise.all(fetchPromises);
    console.log(models); // Log the models (or process them as needed)
    return models; // Return the array of models
  } catch (error) {
    console.error("Error fetching models:", error);
    return []; // Return an empty array or handle the error as needed
  }
};







