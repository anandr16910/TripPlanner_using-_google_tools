'use server';
/**
 * @fileOverview A Gemini chat agent.
 *
 * - chatWithGemini - A function that handles the chat with Gemini.
 * - ChatWithGeminiInput - The input type for the chatWithGemini function.
 * - ChatWithGeminiOutput - The return type for the chatWithGemini function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatWithGeminiInputSchema = z.object({
  message: z.string().describe('The message to send to Gemini.'),
  language: z.string().describe('The language for the response.'),
});
export type ChatWithGeminiInput = z.infer<typeof ChatWithGeminiInputSchema>;

const ChatWithGeminiOutputSchema = z.object({
  response: z.string().describe('The response from Gemini.'),
});
export type ChatWithGeminiOutput = z.infer<typeof ChatWithGeminiOutputSchema>;

export async function chatWithGemini(input: ChatWithGeminiInput): Promise<ChatWithGeminiOutput> {
  return chatWithGeminiFlow(input);
}

const chatWithGeminiPrompt = ai.definePrompt({
  name: 'chatWithGeminiPrompt',
  input: {schema: ChatWithGeminiInputSchema},
  output: {schema: ChatWithGeminiOutputSchema},
  prompt: `You are a helpful travel assistant. Respond to the user's message in {{{language}}}:

{{{message}}}`,  
});

const chatWithGeminiFlow = ai.defineFlow(
  {
    name: 'chatWithGeminiFlow',
    inputSchema: ChatWithGeminiInputSchema,
    outputSchema: ChatWithGeminiOutputSchema,
  },
  async input => {
    const {output} = await chatWithGeminiPrompt(input);
    return output!;
  }
);
