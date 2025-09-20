'use server';
/**
 * @fileOverview This file defines a Genkit flow for providing accommodation and transport recommendations based on user location and preferences.
 *
 * - AccommodationAndTransportRecommendationsInput: Interface for the input to the flow.
 * - AccommodationAndTransportRecommendationsOutput: Interface for the output of the flow.
 * - getAccommodationAndTransportRecommendations:  Wrapper function that calls the accommodationAndTransportRecommendationsFlow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AccommodationAndTransportRecommendationsInputSchema = z.object({
  location: z.string().describe('The location for which to find recommendations.'),
  preferences: z.string().describe('The user preferences for accommodation and transport.'),
  language: z.string().describe('The language for the response.'),
});

export type AccommodationAndTransportRecommendationsInput = z.infer<typeof AccommodationAndTransportRecommendationsInputSchema>;

const AccommodationAndTransportRecommendationsOutputSchema = z.object({
  accommodationRecommendations: z.string().describe('Recommendations for accommodations based on the location and preferences.'),
  transportRecommendations: z.string().describe('Recommendations for transport options based on the location and preferences.'),
});

export type AccommodationAndTransportRecommendationsOutput = z.infer<typeof AccommodationAndTransportRecommendationsOutputSchema>;

export async function getAccommodationAndTransportRecommendations(input: AccommodationAndTransportRecommendationsInput): Promise<AccommodationAndTransportRecommendationsOutput> {
  return accommodationAndTransportRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'accommodationAndTransportRecommendationsPrompt',
  input: {schema: AccommodationAndTransportRecommendationsInputSchema},
  output: {schema: AccommodationAndTransportRecommendationsOutputSchema},
  prompt: `You are a travel expert providing recommendations for accommodations and transport options.

  Based on the following location and preferences, provide recommendations for accommodations and transport in {{{language}}}.

  Location: {{{location}}}
  Preferences: {{{preferences}}}

  Accommodation Recommendations:
  Transport Recommendations:`,
});

const accommodationAndTransportRecommendationsFlow = ai.defineFlow(
  {
    name: 'accommodationAndTransportRecommendationsFlow',
    inputSchema: AccommodationAndTransportRecommendationsInputSchema,
    outputSchema: AccommodationAndTransportRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
