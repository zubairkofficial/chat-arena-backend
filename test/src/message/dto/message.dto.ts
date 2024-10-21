// message.dto.ts
export namespace MessageDto {
    export class CreateMessageDto {
      senderType: string; // 'user' or 'ai'
      senderId: string;
      content: string;
      conversationId: string; // Reference to the conversation
    }
  
    export class UpdateMessageDto {
      senderType?: string;
      senderId?: string;
      content?: string;
    }
  }
  