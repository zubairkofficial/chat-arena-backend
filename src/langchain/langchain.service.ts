import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { ArenaAIFigure } from '../arena-ai-figure/entities/arena-ai-figure.entity';
import { AIFigure } from '../aifigure/entities/aifigure.entity';
import { LlmModel } from '../llm-model/entities/llm-model.entity';
import { Arena } from '../arena/entities/arena.entity';
import { SystemPromptService } from '../system-prompt/system-prompt.service';

@Injectable()
export class LangChainService {
  constructor(
    private readonly systemPromptService: SystemPromptService
  ) {}

  // Chooses the appropriate LLM model from the available models.
  private chooseModelFromArray(models: LlmModel): ChatOpenAI {
    if (!models?.apiKey || !models?.modelType) {
      throw new Error('Model API Key or Type is missing');
    }
    return new ChatOpenAI({
      openAIApiKey: models.apiKey,
      model: models.modelType,
    });
  }

  // Builds the context by combining previous context and the new user message.
  private buildContext(previousContext: string, userMessage: string): string {
    return `${previousContext}\nUser: "${userMessage}"\nAI:`;
  }

  // Creates a detailed prompt template for the AI model.
  private async createPromptTemplate(
    name: string,
    description: string,
    basePrompt: string,
    userInteraction: string,
    context: string,
    arena = {} as Arena // Include arena parameter with default empty object
  ): Promise<string> {
    const arenaName = arena?.name || 'Unnamed Arena';
    const arenaTypePrompt = arena?.arenaType.prompt || 'Arena Type Prompt';
    const arenaDescription = arena?.description || 'No description available';
    const arenaType = arena?.arenaType?.name || 'General';
    const arenaMaxParticipants = arena?.maxParticipants || 0;
    const isPrivate = arena?.isPrivate ? 'Yes' : 'No';
    const systemPrompt = await this.systemPromptService.getAllSystemPrompts();
    
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
    const arenaPrompt = `
    **Arena Prompt:**
    - **Arena Type Prompt**: ${arenaTypePrompt}
    - **System Prompt**: ${systemPrompt[0]?.prompt}
    - **Ai Figure Prompt**: ${basePrompt}
   
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

    // Sample casual response
    const casualMessage = `
    **Sample Response:**
    "Hmm, it looks like we’re in another round of greetings! It’s great to see so many friendly faces! Who's excited to share something fun today?"
    `;

    // Final prompt assembly
    return `
    ${arenaPrompt},
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

  // Invokes the chosen model with the prompt template.
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

  // Parses the response from the model.
  private parseResponse(response: string | Uint8Array): string {
    if (response instanceof Uint8Array) {
      return new TextDecoder().decode(response).trim();
    }
    return (response as string)?.trim() || "I'm sorry, but I couldn't generate a response.";
  }

  // Processes a message, creating the prompt and invoking the model.
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
      const promptTemplateString = await this.createPromptTemplate(
        arenaAiFigure.aiFigure.name,
        arenaAiFigure.aiFigure.description,
        arenaAiFigure.aiFigure.prompt,
        `The users in the arena will be communicating with each other and the AI. Below is the latest message:\n\n*User Message:*\n${userMessage}`,
        updatedContext,
        arena
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

  // Handles the AI figure's response based on context and message.
  async aiFigureMessage(
    models: LlmModel,
    aiFigure: AIFigure,
    message: string,
    context: { sendMessage: string; receiveMessage: string }[]
  ): Promise<string> {
    try {
      const modelToUse = this.chooseModelFromArray(models);

      // Format context for the AI figure
      const contextFormatted = context
        .map(
          (entry) =>
            `User: "${entry.sendMessage}"\nAI: "${entry.receiveMessage}"\n`
        )
        .join('\n');

      const updatedContext = this.buildContext(contextFormatted, message);
      const promptTemplateString = await this.createPromptTemplate(
        aiFigure.name,
        aiFigure.description,
        aiFigure.prompt,
        `The users in the arena will be communicating with each other and the AI. Below is the latest message:\n\n*User Message:*\n${message}`,
        updatedContext
      );

      return this.invokeModel(promptTemplateString, modelToUse);
    } catch (error) {
      console.error('Error in AI Figure message processing:', error);
      throw new HttpException(
        `An error occurred while processing the AI figure message: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
