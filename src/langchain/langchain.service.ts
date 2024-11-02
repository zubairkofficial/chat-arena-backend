import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { openAI } from '../utils/constant/openAI.constants';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { ArenaAIFigure } from '../arena-ai-figure/entities/arena-ai-figure.entity';
import { Arena } from '../arena/entities/arena.entity';

@Injectable()
export class LangChainService {
  private model: ChatOpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not set in environment variables');
    }

    this.model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      temperature: +openAI.BASIC_CHAT_OPENAI_TEMPERATURE, // Ensure this is the correct type (number)
      modelName: openAI.GPT_3_5_TURBO_1106, // Ensure this is the model you want to use
    });
  }
  // private firestore = getFirestore();

  async processMessage(
    arena: Arena,
    arenaAiFigure: ArenaAIFigure,
    context: string,
  ): Promise<string> {
    try {



      // Introduce variations in prompt for more natural, human-like responses
      const promptTemplateString = 
 `
 
You are ${arenaAiFigure.aiFigure.name}, You are described as:  ${arenaAiFigure.aiFigure.description},
In this interaction, you are taking on the role of ${arenaAiFigure.figureRole.roleName} in the MultiMind Arena.
Role Objective: ${arenaAiFigure.figureRole.roleObjective}
Arena Context:
- Previous conversation:\n${context}\n\n
- Arena Type: ${arena.arenaType}
- Current Topic/Activity: ${arena.name}
Your tasks as ${arenaAiFigure.figureRole.roleName}:
Remember to stay true to your historical/fictional persona while fulfilling your role.
Your unique background and personality should influence how you approach your tasks.
Your response or action (in character and aligned with your role):
`;

      // Set up the template for LangChain processing
      const promptTemplate = PromptTemplate.fromTemplate(promptTemplateString);
      const outputParser = new HttpResponseOutputParser();
      const chain = promptTemplate.pipe(this.model).pipe(outputParser);

      // Adjust temperature (e.g., 0.8) and top-p (e.g., 0.9) for more human-like responses, if supported
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
        // Default message if response type is unexpected
        responseString = "I'm sorry, but I couldn't generate a response.";
      }

      // Ensure response includes variations or human-like phrasing
      return responseString;
    } catch (error) {
      console.error('Error in LangChain processing:', error);
      throw new HttpException(
        `An error occurred while processing the request: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

 

  async aiFigureMessage(
    description: string,
    prompt: string,
    message: string,
    context: { sendMessage: string; receiveMessage: string; }[]
  ): Promise<string> {
    try {

      const contextFormatted = context
      .map((msg) => {
          // Check if there is a user message or an AI message and format accordingly
          if (msg.sendMessage) {
              return `User: "${msg.sendMessage}"`;
          } else if (msg.receiveMessage) {
              return `AI: "${msg.receiveMessage}"`;
          }
          return ''; // Return an empty string if neither is present
      })
      .filter((line) => line) // Remove any empty lines
      .join('\n');
  
  const promptTemplateString = `
    You are an AI figure designed to assist users with specific tasks. Here are the details of your configuration:

    *Description:*
    ${description}

    *Base Prompt:*
    ${prompt}

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
    1. Start with a greeting.
    2. Acknowledge the user's message and incorporate relevant information from the previous conversation context.
    3. Answer the question directly, adding examples if needed.
    4. End with an offer for further assistance.

    *Response:*
`;

      // Set up the template for LangChain processing
      const promptTemplate = PromptTemplate.fromTemplate(promptTemplateString);
      const outputParser = new HttpResponseOutputParser();
      const chain = promptTemplate.pipe(this.model).pipe(outputParser);

      // Adjust temperature and top-p for more human-like responses
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
        // Default message if response type is unexpected
        responseString = "I'm sorry, but I couldn't generate a response.";
      }

      // Ensure response includes variations or human-like phrasing
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
