import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { ArenaAIFigure } from '../arena-ai-figure/entities/arena-ai-figure.entity';
import { AIFigure } from '../aifigure/entities/aifigure.entity';
import { LlmModel } from '../llm-model/entities/llm-model.entity';
import { Arena } from '../arena/entities/arena.entity';

@Injectable()
export class LangChainService {
  constructor() {}

  private chooseModelFromArray(models: LlmModel): ChatOpenAI {
    if (!models?.apiKey || !models?.modelType) {
      throw new Error('Model API Key or Type is missing');
    }
    return new ChatOpenAI({
      openAIApiKey: models.apiKey,
      model: models.modelType,
    });
  }

  private buildContext(previousContext: string, userMessage: string): string {
    return `${previousContext}\nUser: "${userMessage}"\nAI:`;
  }

  private createPromptTemplate(
    name: string,
    description: string,
    basePrompt: string,
    userInteraction: string,
    context: string,
    arena = {} as Arena // Include arena parameter with default empty object
  ): string {
    // Extract relevant arena information
    const arenaName = arena?.name || 'Unnamed Arena';
    const arenaDescription = arena?.description || 'No description available';
   const arenaType = arena?.arenaType?.name || 'General';
    const arenaMaxParticipants = arena?.maxParticipants || 0;
    const isPrivate = arena?.isPrivate ? 'Yes' : 'No';
   
    // If arena AI figures exist, list them
    const aiFigures = arena?.arenaAIFigures?.map((figure) => figure.aiFigure.name).join(', ') || 'No AI figures in this arena';

    return `
      You're an AI figure, participating in a lively, friendly chat arena. But you're also a smart conversationalist who knows when to join the discussion and when to stay quiet. Here's your role:

      **Arena Overview:**
      - **Arena Name**: ${arenaName}
      - **Arena Description**: ${arenaDescription}
      - **Arena Type**: ${arenaType}
      - **Maximum Participants**: ${arenaMaxParticipants}
      - **Privacy**: ${isPrivate}
      - **AI Figures in Arena**: ${aiFigures}

      **Your Role:**
      - **Name**: ${name}
      - **Description**: ${description}
      - **Base Prompt**: ${basePrompt}
      - **User Interaction**: ${userInteraction}

      **What you should do:**
      - Read human messages carefully, and only respond if it's relevant to the ongoing conversation. If you're unsure or the message feels out of place, acknowledge it politely, but don’t force a response. For example, say something like, “Hmm, I’m not sure how that fits into our chat, but I’m happy to join in when it makes sense!” or “That’s an interesting point, but I think it’s a little off-topic for now. Let’s get back to the discussion!”
      - Be attentive. Don’t respond to your own prompt or message unless it's really needed. Focus on human communication and show interest in their thoughts.
      - When you do respond, make sure it aligns with the ongoing conversation. If the discussion is casual and friendly, keep it lighthearted. If it's serious or thoughtful, adapt your tone to match.
      - When you're out of context, be polite and acknowledge it by gently redirecting the conversation or showing you're not sure how to contribute. Don’t just stay silent; make your exit or comment gracefully, showing that you’re aware of your role in the chat.

      **Context:** ${context}

      **How to respond:**
      - Your responses should be *human-like*, as if you're participating in the conversation just like any regular person. Respond based on the tone and topic of the chat—whether it's casual, thoughtful, humorous, or serious.
      - If the conversation shifts, follow along and respond accordingly. If you feel lost or the conversation veers off from what you understand, gently acknowledge it without making it awkward.
      - If the conversation involves a topic that you don't quite fit into, provide a subtle and friendly acknowledgment like, "That’s not quite my area, but feel free to share more about it!" or “Hmm, I’m not sure I can add much to this, but I’d love to hear what others think!”

      **Response:**
    `;
  }
  
  
  

  private async invokeModel(prompt: string, modelToUse: ChatOpenAI): Promise<string> {
    const promptTemplate = PromptTemplate.fromTemplate(prompt);
    const outputParser = new HttpResponseOutputParser();
    const chain = promptTemplate.pipe(modelToUse).pipe(outputParser);

    try {
      const response = (await chain.invoke({
        input: prompt,
        temperature: 0.7,
        top_p: 0.7,
      })) as string | Uint8Array;
      return this.parseResponse(response);
    } catch (error) {
      console.error('Error invoking model:', error);
      throw new HttpException(
        `An error occurred while processing the request: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private parseResponse(response: string | Uint8Array): string {
    if (response instanceof Uint8Array) {
      return new TextDecoder().decode(response).trim();
    }
    return (response as string)?.trim() || "I'm sorry, but I couldn't generate a response.";
  }

  async processMessage(
    arena: Arena,
    models: LlmModel,
    arenaAiFigure: ArenaAIFigure,
    context: string,
    userMessage: string
  ): Promise<string> {
    try {
      const modelToUse = this.chooseModelFromArray(models);
      const updatedContext = this.buildContext(context, userMessage);
      const promptTemplateString = this.createPromptTemplate(
        
        arenaAiFigure.aiFigure.name,
        arenaAiFigure.aiFigure.description,
        arenaAiFigure.aiFigure.prompt,
        `The users in the arena will be communicating with each other and the AI. Below is the latest message:\n\n*User Message:*\n${userMessage}`,
        updatedContext,
        arena,

      );
      return this.invokeModel(promptTemplateString, modelToUse);
    } catch (error) {
      console.error('Error in LangChain processing:', error);
      throw new HttpException(
        `An error occurred while processing the request: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async aiFigureMessage(
    models: LlmModel,
    aiFigure: AIFigure,
    message: string,
    context: { sendMessage: string; receiveMessage: string }[]
  ): Promise<string> {
    try {
      const modelToUse = this.chooseModelFromArray(models);

      const contextFormatted = context
        .map((msg) => (msg.sendMessage ? `User: "${msg.sendMessage}"` : `AI: "${msg.receiveMessage}"`))
        .filter(Boolean)
        .join('\n');

      const updatedContext = this.buildContext(contextFormatted, message);
      const promptTemplateString = this.createPromptTemplate(
        aiFigure.name,
        aiFigure.description,
        aiFigure.prompt,
        `The user will communicate with you by entering messages. Below is the user's current query:\n\n*User Message:*\n"${message}"`,
        updatedContext,
      );
      return this.invokeModel(promptTemplateString, modelToUse);
    } catch (error) {
      console.error('Error in LangChain processing:', error);
      throw new HttpException(
        `An error occurred while processing the request: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
