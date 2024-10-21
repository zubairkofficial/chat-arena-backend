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

  async processMessage(input: string, conversationTopic: string, prompt: string): Promise<string> {
    try {
        // Use the template
        const promptTemplateString = TEMPLATES.BASIC_CHAT_TEMPLATE.replace('{input}', input);
        
        // Create the complete formatted string to include business insights
        const formattedPromptString = `${promptTemplateString} Topic: ${conversationTopic}\n Prompt: ${prompt}`;
        
        // Create the prompt template
        const promptTemplate = PromptTemplate.fromTemplate(formattedPromptString);

        // Initialize the output parser
        const outputParser = new HttpResponseOutputParser();

        // Create the processing chain
        const chain = promptTemplate.pipe(this.model).pipe(outputParser);

        // Generate the response
        const response = await chain.invoke({ input });

        // Handle response types
        let responseString: string;

        if (response instanceof Uint8Array) {
            responseString = new TextDecoder().decode(response);
        } else if (typeof response === 'string') {
            responseString = response;
        } else {
            throw new Error('Unexpected response type');
        }

        return responseString.trim(); // Trim any whitespace from the response
    } catch (error) {
        console.error('Error in LangChain processing:', error);
        throw new HttpException(
            `An error occurred while processing the question: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
}


  
}
