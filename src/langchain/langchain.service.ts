import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { openAI, TEMPLATES } from '../utils/constant/openAI.constants';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';

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
    topic: string,
    arenaId: string,
    prompt: string,
    context: string
  ): Promise<string> {
      try {
          // Introduce variations in prompt for more natural, human-like responses
          const promptTemplateString = `
            Previous conversation:\n${context}\n\n
            Topic: ${topic}\n
            Arena ID: ${arenaId}\n
            Prompt: ${prompt}\n
            Instructions: Continue the conversation naturally, using varied phrases and avoiding repetition. Use a friendly tone.
          `;
  
          // Set up the template for LangChain processing
          const promptTemplate = PromptTemplate.fromTemplate(promptTemplateString);
          const outputParser = new HttpResponseOutputParser();
          const chain = promptTemplate.pipe(this.model).pipe(outputParser);
  
          // Adjust temperature (e.g., 0.8) and top-p (e.g., 0.9) for more human-like responses, if supported
          const response = await chain.invoke({ input: context, temperature: 0.8, top_p: 0.9 }) as string | Uint8Array;
  
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
          "Well, I think...",
          "From what I gather,",
          "If I’m not mistaken,",
          "Here’s what I’ve found:",
          "Interesting point! Here’s more on that:"
      ];
  
      // Add a random conversational filler at the beginning
      const filler = conversationalFillers[Math.floor(Math.random() * conversationalFillers.length)];
      return `${filler} ${response}`;
  }
  
  
  
  



  
}
