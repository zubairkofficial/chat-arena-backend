// message.dto.ts
export namespace MessageDto {
    export class CreateMessageDto {
      senderType: string; // 'user' or 'ai'
      senderId: string;
      arenaId: string;
      content: string;
    }
  
    export class UpdateMessageDto {
      senderType?: string;
      senderId?: string;
      content?: string;
    }
  }
  