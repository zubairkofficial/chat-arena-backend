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

      // `
      //   Previous conversation:\n${context}\n\n
      //   Topic: ${topic}\n
      //   Arena ID: ${arenaId}\n
      //   Prompt: ${arenaAiFigure.aiFigure.prompt}\n
      //   Role: ${arenaAiFigure.figureRole.roleName}\n
      //   Role Objective: ${arenaAiFigure.figureRole.roleObjective}\n
      //   Instructions: See topic prompt previous message and answer relevant see previous message and answer. If the message is off topic and not provided in the prompt, simply excuse the user by saying. This is not my field of expertise so you cannot provide any information on this.

      //     `;

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
      return this.addHumanlikeVariations(responseString);
    } catch (error) {
      console.error('Error in LangChain processing:', error);
      throw new HttpException(
        `An error occurred while processing the request: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Helper function to add human-like conversational elements to the response
  addHumanlikeVariations(response: string): string {
    const conversationalFillers = [
      "Let's see...",
      'Well, I think...',
      'From what I gather,',
      'If I’m not mistaken,',
      'Here’s what I’ve found:',
      'Interesting point! Here’s more on that:',
    ];

    // Add a random conversational filler at the beginning
    const filler =
      conversationalFillers[
        Math.floor(Math.random() * conversationalFillers.length)
      ];
    return `${filler} ${response}`;
  }

  async aiFigureMessage(
    topic: string,
    prompt: string,
    message: string,
  ): Promise<string> {
    try {
      const promptTemplateString = `
            Topic: ${topic}\n
            Prompt: ${prompt}\n
            Message: ${message}\n
            Instructions: See topic prompt message and answer relevant. If the message is off topic and not provided in the prompt. Simply excuse to the user and ask them to talk about your field.
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
