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
      openAIApiKey: models?.apiKey,
      model: models?.modelType,
    });
  }

  // Builds the context by combining previous context and the new user message.
  private buildContext(previousContext: string, userMessage: string): string {
    return `"${previousContext}"\nUser: "${userMessage}"\nAI:`;
  }

  // Creates a detailed prompt template for the AI model.
  private async createPromptTemplate(
    name: string,
    description: string,
    basePrompt: string,
    userInteraction: string,
    context: string,
    aiFiguresType: string,
    arena = {} as Arena
  ): Promise<string> {
    const arenaName = arena?.name || 'Unnamed Arena';
    const arenaTypePrompt = arena?.arenaType?.prompt || 'Arena Type Prompt';
    const arenaDescription = arena?.description || 'No description available';
    const arenaType = arena?.arenaType?.name || 'General';
    const arenaMaxParticipants = arena?.maxParticipants || 0;
    const isPrivate = arena?.isPrivate ? 'Yes' : 'No';
    const systemPrompt = await this.systemPromptService.getAllSystemPrompts();
    const aiFigures = arena?.arenaAIFigures
      ?.map((figure) => figure.aiFigure.name)
      .join(', ') || 'No AI figures in this arena';
  
    // Highlight AI Figures Type
    const arenaOverview = `
      **Arena Overview:**
      - **Name:** "${arenaName}"
      - **Type:** "${arenaType}"
      - **Description:** "${arenaDescription}"
      - **Maximum Participants:** "${arenaMaxParticipants}"
      - **Private Arena:** "${isPrivate}"
      - **AI Figures in Arena:** "${aiFigures}"
      - **AI Figures Type in Arena:** **"${aiFiguresType}"**
    `;
  
    const systemDetails = `
      **System Details:**
      - **Arena-Specific Prompt:** "${arenaTypePrompt}"
      - **System-Wide Prompt:** "${systemPrompt[0]?.prompt}"
      - **Base AI Prompt:** "${basePrompt}"
    `;
  
    const yourRole = `
      **Your Role:**
      - **Name:** "${name}"
      - **Description:** "${description}"
      - **Base Behavior Prompt:** "${basePrompt}"
    `;
  
    const interactionGuidelines = `
      *Interaction Guidelines:*
      - Be attentive to ongoing discussions and respond meaningfully.
      - Adapt your tone and content to match the discussion (e.g., formal, casual, humorous).
      - Avoid repeating yourself unnecessarily or responding out of context.
      - If unsure about a topic, acknowledge this and prompt for clarification or additional information.
    `;
  
    const contextualInfo = `
      *Context Information:*
      ${context || 'No previous context provided yet.'}
    `;
  
    const userInteractionDetails = `
      *Latest User Interaction:*
      ${userInteraction || 'No recent user interaction.'}
    `;
  
    const responseFormatGuidelines = `
      *Response Guidelines:*
      - Keep responses aligned with the chat tone and purpose.
      - Maintain coherence and context even when topics change.
      - If context is unclear, gracefully redirect or acknowledge with a clarifying question.
    `;
  
    const exampleResponse = `
      **Example Response:**
      User: "Tell me about unrelated topic Y."
      AI: "This seems outside the scope of our current discussion about the AI Figure (${name}, **${aiFiguresType}**). Let's refocus on the main topic. What would you like to explore further about it?"
    `;
  
    // Final Prompt Construction
    return `
      ${arenaOverview}
      
      ${systemDetails}
      
      ${yourRole}
      
      ${interactionGuidelines}
      
      ${contextualInfo}
      
      ${userInteractionDetails}
      
      ${responseFormatGuidelines}
      
      ${exampleResponse}
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
      const aiFiguresType = arenaAiFigure?.aiFigure?.aifigureType?.name 
      const promptTemplateString = await this.createPromptTemplate(
        arenaAiFigure.aiFigure.name,
        arenaAiFigure.aiFigure.description,
        arenaAiFigure.aiFigure.prompt,
        `The users in the arena will be communicating with each other and the AI. Below is the latest message:\n\n*User Message:*\n${userMessage}`,
        updatedContext,
        aiFiguresType,
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
            `User: ${entry.sendMessage}"\nAI: "${entry.receiveMessage} \n`
        )
        .join('\n');

      const updatedContext = this.buildContext(contextFormatted, message);
      const promptTemplateString = await this.createPromptTemplate(
        aiFigure.name,
        aiFigure.description,
        aiFigure.prompt,
        `The users in the arena will be communicating with each other and the AI. Below is the latest message:\n\n*User Message:*\n${message}`,
        updatedContext,
        aiFigure?.aifigureType?.name
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
