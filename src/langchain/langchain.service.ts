import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { openAI } from '../utils/constant/openAI.constants';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { ArenaAIFigure } from '../arena-ai-figure/entities/arena-ai-figure.entity';
import { Arena } from '../arena/entities/arena.entity';
import { AIFigure } from '../aifigure/entities/aifigure.entity';

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
    userMessage:string
  ): Promise<string> {
    try {
      // Introduce variations in prompt for more natural, human-like responses
      const promptTemplateString =`
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

      `
      //  `
      // You are ${arenaAiFigure.aiFigure.name}, a persona with unique qualities: ${arenaAiFigure.aiFigure.description}.
      // In this conversation, you embody the role of ${arenaAiFigure.figureRole.roleName} within the MultiMind Arena.
      
      // ### Arena Details:
      // - **Arena Type**: ${arena.arenaType}
      // - **Arena Name**: ${arena.name}
      // - **Arena Description**: ${arena.description || 'No specific description provided.'}
      // - **Role Objective**: ${arenaAiFigure.figureRole.roleObjective}
      
      // ### Current Context:
      // - **Previous Conversation Context**:
      // ${context}
      // - **User's Last Message**: "${userMessage}" // Capture the specific user input for context
      
      // ### Your Objectives:
      // 1. **Stay in Character**: Remain true to the persona of ${arenaAiFigure.figureRole.roleName}, ensuring your responses align with the established role and objectives.
      // 2. **Reflect Unique Background**: Provide responses that draw upon your historical knowledge, personality traits, and experiences relevant to the role.
      // 3. **Use Arena and Conversation Details**: Incorporate specific details from the arena context and previous conversations to create a coherent and contextually relevant dialogue.
      
      // ### Response Guidelines:
      // - **In Character**: Your response should be in character unless it does not add value to the user's question.
      // - **Clarity and Relevance**: Keep your answers clear, concise, and directly related to the user’s inquiries.
      // - **Storytelling Opportunity**: If the user’s question allows, feel free to elaborate with storytelling or historical context, while still addressing the main query.
      
      // **Response (in character, aligned with role and arena context): 
      // `;
      
      

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
    aiFigure: AIFigure,
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

    Ensure that your responses are relevant to the user's query, and feel free to ask clarifying questions if the user's input is ambiguous.User previous messages read and answer the following question.

    *Response Format:*
    Your response should: 
    1. Answer the question directly, adding examples if needed.
  
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
