import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';
import { UserService } from '../user/user.service';
import { ArenaService } from '../arena/arena.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserArenaService } from '../user-arena/user-arena.service';
import { ArenaRepository } from '../arena/arena.repository';
import { Cron } from '@nestjs/schedule';
import { Message } from './entities/message.entity';
import { ConversationService } from '../conversation/conversation.service';
import { LangChainService } from '../langchain/langchain.service';
import { AIFigure } from '../aifigure/entities/aifigure.entity';
import { AIFigureService } from '../aifigure/aifigure.service';

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
  private activeRooms: Set<string> = new Set();
  private connectedUsers: Map<string, { socketId: string; rooms: Set<string> }> = new Map();
  private activeConversations: Set<string> = new Set(); // Track active conversations

  constructor(
    private readonly messageService: MessageService,
    private readonly userService: UserService,
    private readonly arenaService: ArenaService,
    private readonly userArenaService: UserArenaService,
    private readonly arenaRepository: ArenaRepository,
    private readonly conversationService: ConversationService,
    private readonly langchainService: LangChainService,
    private readonly aiFigureService: AIFigureService,



  ) {}

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

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, { userId, arenaId }: { userId: string; arenaId: string }) {
    try {
      // Validate User
      const existUser = await this.userService.getUserById(userId);
      if (!existUser) throw new NotFoundException('Invalid user specified');
  
      // Validate Arena
      const arena = await this.arenaService.getArenaById(arenaId);
      if (!arena) {
        throw new BadRequestException(`Arena with ID ${arenaId} does not exist`);
      }
  
      // Check if the user is already connected to the arena
      const arenaUser = await this.userArenaService.getUserAndArena(arenaId, userId);
      const userArenaList = await this.arenaRepository.getUserArenaList(arenaId).getOne();

      if (arenaUser) {
        // User is already connected, reuse existing connection
        client.join(arenaId);
        console.log(`User ${userId} rejoined room: ${arenaId}`);
        this.server.to(arenaId).emit('userRejoined', { userId, ...userArenaList });
        return; // Exit early as user is already connected
      }
  
      const getArenaUsers = await this.arenaService.getUsersByArenaId(arenaId);
      const numberOfUsers = getArenaUsers.userArenas.length;
  
      if (arena.maxParticipants <= numberOfUsers) {
        throw new BadRequestException(`Cannot join Arena ${arena.name}. Maximum participants reached`);
      }
  
      await this.userArenaService.createUserArena(arena, existUser);
  
      // Proceed to join room
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, { socketId: client.id, rooms: new Set() });
      }
  
      const userInfo = this.connectedUsers.get(userId);
      userInfo.rooms.add(arenaId);
      client.join(arenaId);
      console.log(`User ${userId} joined room: ${arenaId}`);
      this.server.to(arenaId).emit('userJoined', { userId, userArenaList });
      this.activeConversations.add(arenaId);
    } catch (error) {
      console.error('Error joining room:', error);
      client.emit('error', error.message || 'Failed to join room');
    }
  }
  

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, { userId, arenaId }: { userId: string; arenaId: string }) {
    const userInfo = this.connectedUsers.get(userId);
    if (userInfo) {
      userInfo.rooms.delete(arenaId);
      client.leave(arenaId);
      console.log(`User ${userId} left room: ${arenaId}`);
      this.server.to(arenaId).emit('userLeft', userId);
      if (userInfo.rooms.size === 0) {
        this.activeConversations.delete(arenaId);
      }
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, { userId, arenaId, content }: { userId: string; arenaId: string; content: string }) {
    try {
      const message = await this.messageService.createMessage({
        senderId: userId,
        content: content,
        senderType: 'user',
      });

      // Emit the message to the specific room
      this.server.to(arenaId).emit('receiveMessage', message);
    } catch (error) {
      console.error('Error handling sendMessage:', error);
      client.emit('error', error.message || 'Failed to send message');
    }
  }
  @Cron('*/20 * * * * *')
  // Runs every 20 seconds
    async handleCron() {
      console.log('Cron job triggered');
  
      for (const arenaId of this.activeConversations) {
        const previousMessages = await this.messageService.getPreviousMessages(arenaId, 7);
        const aiFigureId = '1d2695db-5607-4f77-b951-fb7c539497dd'; // Example AI figure ID
        const aiFigure = await this.getAIFigure(aiFigureId);
  
        const aiResponse = await this.generateAIResponse(arenaId, previousMessages, aiFigure.prompt);
  
        // Create and emit the AI response
        const aiMessage = await this.messageService.createMessage({
          senderId: aiFigure.id,
          content: aiResponse,
          senderType: 'ai',
        });
  
        console.log(`Sending AI message to conversation: ${arenaId}`);
        this.server.to(arenaId).emit('receiveMessage', aiMessage);
      }
    }
  
  

    async generateAIResponse(
          arenaId: string,
          previousMessages: Message[],
          prompt: string,
        ): Promise<string> {
          // Fetch conversation topic from the database
          const arena = await this.arenaService.getArenaById(
            arenaId,
          );
          const conversationTopic = arena.name || 'No specific topic'; // Fallback if no topic is found
      
          // Build the context from previous messages
          const context = previousMessages
            .map((msg) => `${msg.senderType}: ${msg.content}`)
            .join('\n');
      
          return this.langchainService.processMessage(
            context,
            conversationTopic,
            prompt,
          );
        }
        async getAIFigure(aiFigureId: string): Promise<AIFigure> {
              const aiFigure = await this.aiFigureService.getAIFigureById(aiFigureId);
              if (!aiFigure) {
                throw new Error(`AIFigure with ID ${aiFigureId} not found`);
              }
              return aiFigure;
            }

           

}







// import {
//   WebSocketGateway,
//   WebSocketServer,
//   SubscribeMessage,
//   OnGatewayInit,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { MessageService } from './message.service';
// import { AIFigureService } from '../aifigure/aifigure.service';
// import { AIFigure } from '../aifigure/entities/aifigure.entity';
// import { Message } from './entities/message.entity';
// import { Cron } from '@nestjs/schedule';

// import { ConversationService } from '../conversation/conversation.service';
// import { LangChainService } from '../langchain/langchain.service';





// @WebSocketGateway({
//   cors: {
//     origin: '*',
//     methods: ['GET', 'POST'],
//     allowedHeaders: ['*'],
//     credentials: true,
//   },
// })
// export class MessageGateway implements OnGatewayInit {
//   @WebSocketServer() server: Server;
//   private activeConversations: Set<string> = new Set(); // Track active conversations for AI responses
//   constructor(
//     private readonly messageService: MessageService,
//     private readonly aiFigureService: AIFigureService,
//     private readonly conversationService: ConversationService,
//     private readonly langchainService: LangChainService,
//   ) {
   
//   }

//   afterInit(server: Server) {
//     console.log('WebSocket initialized');
//   }

//   handleConnection(client: Socket) {
//     console.log(`Client connected: ${client.id}`);
//   }
//   async generateAIResponse(conversationId: string, previousMessages: Message[], prompt: string): Promise<string> {
//     // Initialize OpenAI instance
    

//     // Fetch conversation topic from the database
//     const conversation = await this.conversationService.getConversationById(conversationId);
//     const conversationTopic = conversation.topic || 'No specific topic'; // Fallback if no topic is found

//     // Build the context from previous messages
//     const context = previousMessages.map(msg => `${msg.senderType}: ${msg.content}`).join('\n');
// return this.langchainService.processMessage(context,conversationTopic,prompt)
    
//   }

//   async getAIFigure(aiFigureId: string): Promise<AIFigure> {
//     const aiFigure = await this.aiFigureService.getAIFigureById(aiFigureId);
//     if (!aiFigure) {
//       throw new Error(`AIFigure with ID ${aiFigureId} not found`);
//     }
//     return aiFigure;
//   }

//   // Method to add active conversations
//   addActiveConversation(conversationId: string) {
//     this.activeConversations.add(conversationId);
//   }

//  @Cron('0 0 */4 * * *')
// // Runs every 20 seconds
//   async handleCron() {
//     console.log('Cron job triggered');

//     for (const conversationId of this.activeConversations) {
//       const previousMessages = await this.messageService.getPreviousMessages(conversationId, 7);
//       const aiFigureId = '1d2695db-5607-4f77-b951-fb7c539497dd'; // Example AI figure ID
//       const aiFigure = await this.getAIFigure(aiFigureId);

//       const aiResponse = await this.generateAIResponse(conversationId, previousMessages, aiFigure.prompt);

//       // Create and emit the AI response
//       const aiMessage = await this.messageService.createMessage({
//         senderId: aiFigure.id,
//         content: aiResponse,
//         conversationId: conversationId,
//         senderType: 'ai',
//       });

//       console.log(`Sending AI message to conversation: ${conversationId}`);
//       this.server.to(conversationId).emit('receiveMessage', aiMessage);
//     }
//   }

//   @SubscribeMessage('sendMessage')
//   async handleSendMessage(client: Socket, input: string) {
//     try {
//       console.log('Received input:', input);
//       const convertInput = JSON.parse(input);

//       // Validate required fields
//       if (!convertInput.senderId || !convertInput.content || !convertInput.conversationId || !convertInput.senderType) {
//         client.emit('error', 'All fields are required: senderId, content, conversationId, senderType');
//         return;
//       }

//       // Create the message
//       const message = await this.messageService.createMessage({
//         senderId: convertInput.senderId,
//         content: convertInput.content,
//         conversationId: convertInput.conversationId,
//         senderType: convertInput.senderType,
//       });

//       // Emit the message to the conversation
//       this.server.to(convertInput.conversationId).emit('receiveMessage', message);

//       // Add conversation to active conversations for AI responses
//       this.addActiveConversation(convertInput.conversationId);
//     } catch (error) {
//       console.error('Error handling sendMessage:', error);
//       client.emit('error', 'Failed to send message');
//     }
//   }

  
// }





// src/message/message.gateway.ts

// import {
//   WebSocketGateway,
//   WebSocketServer,
//   SubscribeMessage,
//   OnGatewayInit,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { MessageService } from '../message/message.service';
// import { AIFigureService } from '../aifigure/aifigure.service';
// import { AIFigure } from '../aifigure/entities/aifigure.entity';
// import { Message } from '../message/entities/message.entity';
// import { Cron } from '@nestjs/schedule';

// import { ConversationService } from '../conversation/conversation.service';
// import { LangChainService } from '../langchain/langchain.service';
// import { NotFoundException } from '@nestjs/common';
// import { ArenaService } from '../arena/arena.service';

// @WebSocketGateway({
//   cors: {
//     origin: '*', // Adjust as needed for security
//     methods: ['GET', 'POST'],
//     allowedHeaders: ['*'],
//     credentials: true,
//   },
// })
// export class MessageGateway
//   implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
// {
//   @WebSocketServer() server: Server;
//   private activeConversations: Set<string> = new Set(); // Track active conversations for AI responses

//   constructor(
//     private readonly messageService: MessageService,
//     private readonly aiFigureService: AIFigureService,
//     private readonly conversationService: ConversationService,
//     private readonly langchainService: LangChainService,
//     private readonly arenaService: ArenaService, // Inject ArenaService to handle Arena-related operations
//   ) {}

//   afterInit(server: Server) {
//     console.log('WebSocket initialized');
//   }

//   handleConnection(client: Socket) {
//     console.log(`Client connected: ${client.id}`);
//     // Optional: Implement authentication here
//   }

//   handleDisconnect(client: Socket) {
//     console.log(`Client disconnected: ${client.id}`);
//     // Optional: Handle any cleanup if necessary
//   }

//   async generateAIResponse(
//     conversationId: string,
//     previousMessages: Message[],
//     prompt: string,
//   ): Promise<string> {
//     // Fetch conversation topic from the database
//     const conversation = await this.conversationService.getConversationById(
//       conversationId,
//     );
//     const conversationTopic = conversation.topic || 'No specific topic'; // Fallback if no topic is found

//     // Build the context from previous messages
//     const context = previousMessages
//       .map((msg) => `${msg.senderType}: ${msg.content}`)
//       .join('\n');

//     return this.langchainService.processMessage(
//       context,
//       conversationTopic,
//       prompt,
//     );
//   }

//   async getAIFigure(aiFigureId: string): Promise<AIFigure> {
//     const aiFigure = await this.aiFigureService.getAIFigureById(aiFigureId);
//     if (!aiFigure) {
//       throw new NotFoundException(`AIFigure with ID ${aiFigureId} not found`);
//     }
//     return aiFigure;
//   }

//   // Method to add active conversations
//   addActiveConversation(conversationId: string) {
//     this.activeConversations.add(conversationId);
//   }

//   // Method to remove active conversations
//   removeActiveConversation(conversationId: string) {
//     this.activeConversations.delete(conversationId);
//   }

//   @Cron('0 0 */4 * * *') // Adjust the cron expression as needed
//   async handleCron() {
//     console.log('Cron job triggered');

//     for (const conversationId of this.activeConversations) {
//       const previousMessages = await this.messageService.getPreviousMessages(
//         conversationId,
//         7,
//       );
//       const aiFigureId = '1d2695db-5607-4f77-b951-fb7c539497dd'; // Example AI figure ID
//       const aiFigure = await this.getAIFigure(aiFigureId);

//       const aiResponse = await this.generateAIResponse(
//         conversationId,
//         previousMessages,
//         aiFigure.prompt,
//       );

//       // Create and emit the AI response
//       const aiMessage = await this.messageService.createMessage({
//         senderId: aiFigure.id,
//         content: aiResponse,
//         conversationId: conversationId,
//         senderType: 'ai',
//       });

//       console.log(`Sending AI message to conversation: ${conversationId}`);
//       this.server.to(conversationId).emit('receiveMessage', aiMessage);
//     }
//   }

//   @SubscribeMessage('sendMessage')
//   async handleSendMessage(client: Socket, input: string) {
//     try {
//       console.log('Received input:', input);
//       const convertInput = JSON.parse(input);

//       // Validate required fields
//       if (
//         !convertInput.senderId ||
//         !convertInput.content ||
//         !convertInput.conversationId ||
//         !convertInput.senderType
//       ) {
//         client.emit(
//           'error',
//           'All fields are required: senderId, content, conversationId, senderType',
//         );
//         return;
//       }

//       // Create the message
//       const message = await this.messageService.createMessage({
//         senderId: convertInput.senderId,
//         content: convertInput.content,
//         conversationId: convertInput.conversationId,
//         senderType: convertInput.senderType,
//       });

//       // Emit the message to the conversation
//       this.server
//         .to(convertInput.conversationId)
//         .emit('receiveMessage', message);

//       // Add conversation to active conversations for AI responses
//       this.addActiveConversation(convertInput.conversationId);
//     } catch (error) {
//       console.error('Error handling sendMessage:', error);
//       client.emit('error', 'Failed to send message');
//     }
//   }

//   @SubscribeMessage('joinArena')
//   async handleJoinArena(
//     client: Socket,
//     payload: { arenaId: string; userId: string },
//   ) {
//     const { arenaId, userId } = payload;

//     // Validate if the arena exists
//     // const arena = await this.arenaService.getArenaById(arenaId);
//     // if (!arena) {
//     //   client.emit('error', `Arena with ID ${arenaId} does not exist`);
//     //   return;
//     // }

//     // Validate if the user is part of the arena
//     // const userArena = await this.arenaService.userArenaService.findUserArena(
//     //   arenaId,
//     //   userId,
//     // );
//     // if (!userArena) {
//     //   client.emit('error', 'You are not a participant of this arena');
//     //   return;
//     // }

//     // Join the Socket.IO room corresponding to the arena ID
//     client.join(arenaId);
//     client.emit('joinedArena', { arenaId });

//     // Optionally notify others in the room
//     client.to(arenaId).emit('userJoined', {
//       userId,
//       username: 'User Name', // Fetch and include the actual username
//     });

//     console.log(`User ${userId} joined arena ${arenaId}`);
//   }

//   @SubscribeMessage('leaveArena')
//   async handleLeaveArena(
//     client: Socket,
//     payload: { arenaId: string; userId: string },
//   ) {
//     const { arenaId, userId } = payload;

//     // Leave the Socket.IO room
//     client.leave(arenaId);
//     client.emit('leftArena', { arenaId });

//     // Optionally notify others in the room
//     client.to(arenaId).emit('userLeft', {
//       userId,
//       username: 'User Name', // Fetch and include the actual username
//     });

//     console.log(`User ${userId} left arena ${arenaId}`);
//   }

//   // Method to disconnect all sockets in a room
//   disconnectAllSockets(arenaId: string) {
//     const sockets = this.server.sockets.adapter.rooms.get(arenaId);
//     if (sockets) {
//       sockets.forEach((socketId) => {
//         const socket = this.server.sockets.sockets.get(socketId);
//         if (socket) {
//           socket.leave(arenaId);
//           socket.emit('arenaExpired', { arenaId });
//           // Optionally, disconnect the socket
//           // socket.disconnect(true);
//           console.log(`Disconnected socket ${socketId} from arena ${arenaId}`);
//         }
//       });
//     }
//   }

//   // Method to handle arena expiration
//   async handleArenaExpiration(arenaId: string) {
//     // Disconnect all sockets in the arena room
//     this.disconnectAllSockets(arenaId);

//     // Optionally, emit an event to update arena status
//     this.server.emit('arenaExpired', { arenaId });

//     console.log(`Arena ${arenaId} has expired and all connections have been disconnected.`);
//   }
// }


