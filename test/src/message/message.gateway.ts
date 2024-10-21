import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';
import { AIFigureService } from 'src/aifigure/aifigure.service';
import { AIFigure } from 'src/aifigure/entities/aifigure.entity';
import { Message } from './entities/message.entity';
import { Cron } from '@nestjs/schedule';

import { ConversationService } from 'src/conversation/conversation.service';
import { LangChainService } from 'src/langchain/langchain.service';





@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['*'],
    credentials: true,
  },
})
export class MessageGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;
  private activeConversations: Set<string> = new Set(); // Track active conversations for AI responses
  constructor(
    private readonly messageService: MessageService,
    private readonly aiFigureService: AIFigureService,
    private readonly conversationService: ConversationService,
    private readonly langchainService: LangChainService,
  ) {
   
  }

  afterInit(server: Server) {
    console.log('WebSocket initialized');
  }

  async generateAIResponse(conversationId: string, previousMessages: Message[], prompt: string): Promise<string> {
    // Initialize OpenAI instance
    

    // Fetch conversation topic from the database
    const conversation = await this.conversationService.getConversationById(conversationId);
    const conversationTopic = conversation.topic || 'No specific topic'; // Fallback if no topic is found

    // Build the context from previous messages
    const context = previousMessages.map(msg => `${msg.senderType}: ${msg.content}`).join('\n');
return this.langchainService.processMessage(context,conversationTopic,prompt)
    
  }

  async getAIFigure(aiFigureId: string): Promise<AIFigure> {
    const aiFigure = await this.aiFigureService.getAIFigureById(aiFigureId);
    if (!aiFigure) {
      throw new Error(`AIFigure with ID ${aiFigureId} not found`);
    }
    return aiFigure;
  }

  // Method to add active conversations
  addActiveConversation(conversationId: string) {
    this.activeConversations.add(conversationId);
  }

  @Cron('*/20 * * * * *') // Runs every 20 seconds
  async handleCron() {
    console.log('Cron job triggered');

    for (const conversationId of this.activeConversations) {
      const previousMessages = await this.messageService.getPreviousMessages(conversationId, 7);
      const aiFigureId = '1d2695db-5607-4f77-b951-fb7c539497dd'; // Example AI figure ID
      const aiFigure = await this.getAIFigure(aiFigureId);

      const aiResponse = await this.generateAIResponse(conversationId, previousMessages, aiFigure.prompt);

      // Create and emit the AI response
      const aiMessage = await this.messageService.createMessage({
        senderId: aiFigure.id,
        content: aiResponse,
        conversationId: conversationId,
        senderType: 'ai',
      });

      console.log(`Sending AI message to conversation: ${conversationId}`);
      this.server.to(conversationId).emit('receiveMessage', aiMessage);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, input: string) {
    try {
      console.log('Received input:', input);
      const convertInput = JSON.parse(input);

      // Validate required fields
      if (!convertInput.senderId || !convertInput.content || !convertInput.conversationId || !convertInput.senderType) {
        client.emit('error', 'All fields are required: senderId, content, conversationId, senderType');
        return;
      }

      // Create the message
      const message = await this.messageService.createMessage({
        senderId: convertInput.senderId,
        content: convertInput.content,
        conversationId: convertInput.conversationId,
        senderType: convertInput.senderType,
      });

      // Emit the message to the conversation
      this.server.to(convertInput.conversationId).emit('receiveMessage', message);

      // Add conversation to active conversations for AI responses
      this.addActiveConversation(convertInput.conversationId);
    } catch (error) {
      console.error('Error handling sendMessage:', error);
      client.emit('error', 'Failed to send message');
    }
  }

  
}


