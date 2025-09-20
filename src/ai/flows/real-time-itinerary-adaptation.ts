'use server';
/**
 * @fileOverview An AI agent that dynamically adjusts trip itineraries based on real-time conditions.
 *
 * - adjustItinerary - A function that adjusts the itinerary based on real-time conditions.
 * - AdjustItineraryInput - The input type for the adjustItinerary function.
 * - AdjustItineraryOutput - The return type for the adjustItinerary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustItineraryInputSchema = z.object({
  itinerary: z.string().describe('The current trip itinerary.'),
  weather: z.string().describe('The current weather conditions at the itinerary locations.'),
  traffic: z.string().describe('The current traffic conditions at the itinerary locations.'),
  events: z.string().describe('Any relevant event updates at the itinerary locations.'),
  language: z.string().describe('The language for the response.'),
});
export type AdjustItineraryInput = z.infer<typeof AdjustItineraryInputSchema>;

const AdjustItineraryOutputSchema = z.object({
  adjustedItinerary: z.string().describe('The adjusted trip itinerary based on real-time conditions.'),
  reasoning: z.string().describe('The reasoning behind the itinerary adjustments.'),
});
export type AdjustItineraryOutput = z.infer<typeof AdjustItineraryOutputSchema>;

export async function adjustItinerary(input: AdjustItineraryInput): Promise<AdjustItineraryOutput> {
  return adjustItineraryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adjustItineraryPrompt',
  input: {schema: AdjustItineraryInputSchema},
  output: {schema: AdjustItineraryOutputSchema},
  prompt: `You are a trip planning expert. Given the current trip itinerary, weather conditions, traffic conditions, and event updates, adjust the itinerary to avoid any potential issues and ensure a smooth trip. Respond in {{{language}}}.\n\nCurrent Itinerary: {{{itinerary}}}\nWeather Conditions: {{{weather}}}\nTraffic Conditions: {{{traffic}}}\nEvent Updates: {{{events}}}\n\nAdjust the itinerary accordingly and explain your reasoning for the adjustments.  Focus on making specific changes (if needed) rather than re-writing the whole itinerary if only a small part is impacted.\n\nAdjusted Itinerary:`,
});

const adjustItineraryFlow = ai.defineFlow(
  {
    name: 'adjustItineraryFlow',
    inputSchema: AdjustItineraryInputSchema,
    outputSchema: AdjustItineraryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
