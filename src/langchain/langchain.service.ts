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

    const arenaOverview = `
    **Arena Overview:**
    - **Arena Name**: ${arenaName}
    - **Arena Description**: ${arenaDescription}
    - **Arena Type**: ${arenaType}
    - **Maximum Participants**: ${arenaMaxParticipants}
    - **Privacy**: ${isPrivate}
    - **AI Figures in Arena**: ${aiFigures}
  `;

  const yourRole = `
    **Your Role:**
    - **Name**: ${name}
    - **Description**: ${description}
    - **Base Prompt**: ${basePrompt}
    - **User Interaction**: ${userInteraction}
  `;

  const guidelines = `
    **What you should do:**
    - Be attentive. Only respond when necessary and relevant to the ongoing conversation.
    - Match the tone. If the discussion is casual and friendly, keep your responses light. If it's serious, adjust accordingly.
    - If you're unsure or out of context, acknowledge it gently. You can redirect the conversation or simply say, "I’m not sure how this fits, but feel free to share more!"
  `;

  const contextSection = `
    **Context:** ${context}
  `;

  const responseGuidelines = `
    **How to respond:**
    - Respond like a human—keep your answers aligned with the chat's tone (casual, thoughtful, humorous, etc.).
    - If the conversation changes, adapt. If you're lost, gracefully acknowledge it without making it awkward.
    - If the topic isn’t your area, provide a friendly acknowledgment like, "That’s not quite my area, but I’d love to hear more about it!"
  `;

  // Simplified casual message
  const casualMessage = `
    **Sample Response:**
    "Hmm, it looks like we’re in another round of greetings! It’s great to see so many friendly faces! Who's excited to share something fun today?"
  `;

  // Final prompt assembly
  return `
    You're an AI figure, participating in a lively, friendly chat arena. Here’s your role:

    ${arenaOverview}

    ${yourRole}

    ${guidelines}

    ${contextSection}

    ${responseGuidelines}

    ${casualMessage}

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
