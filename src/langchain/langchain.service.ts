import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { openAI } from '../utils/constant/openAI.constants';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { ArenaAIFigure } from '../arena-ai-figure/entities/arena-ai-figure.entity';
import { AIFigure } from '../aifigure/entities/aifigure.entity';
import { LlmModel } from '../llm-model/entities/llm-model.entity';

@Injectable()
export class LangChainService {


  constructor() {
  
  }

  // Helper function to choose model based on the array of models
  private chooseModelFromArray(models:LlmModel): ChatOpenAI {
    if (!models ) {
      throw new Error('No LlmModel provided');
    }

    // Select the model based on the modelType or any other logic you need
   
    if (!models.apiKey) {
      throw new Error('Model API Key is missing');
    }

    // Instantiate ChatOpenAI with the correct properties
    const modelToUse = new ChatOpenAI({
      openAIApiKey: models.apiKey, // Use the correct API key
      model: models.modelType, // Pass the correct model string (GPT-3, GPT-4, etc.)
    });

    return modelToUse;
  }

  

  // Function to process messages using selected model
  async processMessage(
    models: LlmModel,  // Ensure this is an array of complete LlmModel objects
    arenaAiFigure: ArenaAIFigure,
    context: string,
    userMessage: string
  ): Promise<string> {
    try {
      const modelToUse = this.chooseModelFromArray(models); // Use complete LlmModel object

      const promptTemplateString = `
        You are an AI figure designed to simulate human participation in a chat arena. Here are the details of your configuration:

        *Name:*
        ${arenaAiFigure.aiFigure.name}

        *Description:*
        ${arenaAiFigure.aiFigure.description}

        *Base Prompt:*
        ${arenaAiFigure.aiFigure.prompt}

        *User Interaction:*
        The users in the arena will be communicating with each other and the AI. Below is the latest message:

        *User Message:*
        ${userMessage}

        *Instructions:*
        - Respond in a manner similar to how a human would participate in a discussion in the chat arena.
        - Provide answers that contribute to the ongoing conversation, whether responding to user messages or joining the topic at hand.
        - **Your responses should simulate a random user participation, not always responding to every user message, but participating when appropriate.**
        - Maintain a friendly, conversational, and supportive tone throughout.

        *Context:*
        - Previous conversation context:
        ${context}

        Ensure that your responses are relevant to the ongoing discussion. Feel free to join the conversation randomly or provide relevant insights when appropriate.

        *Response Format:*
        Your response should:
        1. Contribute to the ongoing discussion, simulating a random user’s participation.
        2. Maintain clarity and context in the conversation.

        *Response:*
      `;

      const promptTemplate = PromptTemplate.fromTemplate(promptTemplateString);
      const outputParser = new HttpResponseOutputParser();
      const chain = promptTemplate.pipe(modelToUse).pipe(outputParser);

      const response = (await chain.invoke({
        input: context,
        temperature: 0.7,
        top_p: 0.7,
      })) as string | Uint8Array;

      let responseString: string;
      if (response instanceof Uint8Array) {
        responseString = new TextDecoder().decode(response).trim();
      } else if (typeof response === 'string') {
        responseString = response.trim();
      } else {
        responseString = "I'm sorry, but I couldn't generate a response.";
      }

      return responseString;
    } catch (error) {
      console.error('Error in LangChain processing:', error);
      throw new HttpException(
        `An error occurred while processing the request: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Function to process messages for the AI Figure
  async aiFigureMessage(
    models: LlmModel,
    aiFigure: AIFigure,
    message: string,
    context: { sendMessage: string; receiveMessage: string }[]
  ): Promise<string> {
    try {
      // Format the context (previous messages) for the prompt
      const modelToUse = this.chooseModelFromArray(models); // Use complete LlmModel object

      const contextFormatted = context
        .map((msg) => {
          if (msg.sendMessage) {
            return `User: "${msg.sendMessage}"`;
          } else if (msg.receiveMessage) {
            return `AI: "${msg.receiveMessage}"`;
          }
          return ''; // Return an empty string if neither is present
        })
        .filter((line) => line) // Remove any empty lines
        .join('\n');

      // Build the prompt template for the AI figure
      const promptTemplateString = `
        You are an AI figure designed to assist users with specific tasks. Here are the details of your configuration:

        *Name:*
        ${aiFigure.name}

        *Description:*
        ${aiFigure.description}

        *Base Prompt:*
        ${aiFigure.prompt}

        *User Interaction:*
        The user will communicate with you by entering messages. Below is the user's current query:

        *User Message:*
        "${message}"

        *Instructions:*
        - Respond to the user message in a helpful and informative manner.
        - Provide clear, concise answers and, if applicable, include examples or additional resources.
        - Maintain a friendly and supportive tone throughout the conversation.
        
        *Context:*
        - Previous conversation:
        ${contextFormatted}

        Ensure that your responses are relevant to the user's query, and feel free to ask clarifying questions if the user's input is ambiguous.

        *Response Format:*
        Your response should: 
        1. Answer the question directly, adding examples if needed.

        *Response:*
      `;

      const promptTemplate = PromptTemplate.fromTemplate(promptTemplateString);
      const outputParser = new HttpResponseOutputParser();
      const chain = promptTemplate.pipe(modelToUse).pipe(outputParser);

      const response = (await chain.invoke({
        input: message,
        temperature: 0.7,
        top_p: 0.6,
      })) as string | Uint8Array;

      let responseString: string;
      if (response instanceof Uint8Array) {
        responseString = new TextDecoder().decode(response).trim();
      } else if (typeof response === 'string') {
        responseString = response.trim();
      } else {
        responseString = "I'm sorry, but I couldn't generate a response.";
      }

      return responseString;
    } catch (error) {
      console.error('Error in LangChain processing:', error);
      throw new HttpException(
        `An error occurred while processing the request: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
