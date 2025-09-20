'use server';

/**
 * @fileOverview Generates a personalized trip itinerary based on user inputs.
 *
 * - generatePersonalizedItinerary - A function that generates a personalized itinerary.
 * - GeneratePersonalizedItineraryInput - The input type for the generatePersonalizedItinerary function.
 * - GeneratePersonalizedItineraryOutput - The return type for the generatePersonalizedItinerary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedItineraryInputSchema = z.object({
  destination: z
    .string()
    .describe('The destination for the trip.'),
  budget: z
    .string()
    .describe('The user specified budget for the trip.'),
  interests: z
    .string()
    .describe('The interests of the user, comma separated.'),
  duration: z
    .string()
    .describe('The duration of the trip in days.'),
  language: z.string().describe('The language for the response.'),
});
export type GeneratePersonalizedItineraryInput =
  z.infer<typeof GeneratePersonalizedItineraryInputSchema>;

const GeneratePersonalizedItineraryOutputSchema = z.object({
  itinerary: z.string().describe('A detailed trip itinerary.'),
});
export type GeneratePersonalizedItineraryOutput =
  z.infer<typeof GeneratePersonalizedItineraryOutputSchema>;

export async function generatePersonalizedItinerary(
  input: GeneratePersonalizedItineraryInput
): Promise<GeneratePersonalizedItineraryOutput> {
  return generatePersonalizedItineraryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedItineraryPrompt',
  input: {schema: GeneratePersonalizedItineraryInputSchema},
  output: {schema: GeneratePersonalizedItineraryOutputSchema},
  prompt: `You are an AI travel assistant. Generate a personalized trip itinerary for a trip to {{{destination}}} based on the user's budget, interests, and duration. Respond in {{{language}}}.

Budget: {{{budget}}}
Interests: {{{interests}}}
Duration: {{{duration}}} days

Itinerary:`,
});

const generatePersonalizedItineraryFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedItineraryFlow',
    inputSchema: GeneratePersonalizedItineraryInputSchema,
    outputSchema: GeneratePersonalizedItineraryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
