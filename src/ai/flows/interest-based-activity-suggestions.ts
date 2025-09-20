'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting activities and attractions based on user interests.
 *
 * It exports:
 * - `suggestActivities` - An async function that takes user interests as input and returns a list of suggested activities.
 * - `InterestBasedActivitySuggestionsInput` - The input type for the suggestActivities function.
 * - `InterestBasedActivitySuggestionsOutput` - The output type for the suggestActivities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterestBasedActivitySuggestionsInputSchema = z.object({
  interests: z
    .string()
    .describe("A comma-separated list of the user's interests, such as 'heritage, nightlife, adventure'."),
  location: z.string().describe('The location for which to suggest activities.'),
  language: z.string().describe('The language for the response.'),
});
export type InterestBasedActivitySuggestionsInput = z.infer<
  typeof InterestBasedActivitySuggestionsInputSchema
>;

const InterestBasedActivitySuggestionsOutputSchema = z.object({
  activities: z
    .array(z.string())
    .describe('A list of suggested activities and attractions based on the user interests.'),
});
export type InterestBasedActivitySuggestionsOutput = z.infer<
  typeof InterestBasedActivitySuggestionsOutputSchema
>;

export async function suggestActivities(
  input: InterestBasedActivitySuggestionsInput
): Promise<InterestBasedActivitySuggestionsOutput> {
  return interestBasedActivitySuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interestBasedActivitySuggestionsPrompt',
  input: {schema: InterestBasedActivitySuggestionsInputSchema},
  output: {schema: InterestBasedActivitySuggestionsOutputSchema},
  prompt: `You are a travel expert. A user is visiting {{{location}}} and is interested in the following activities: {{{interests}}}. Suggest a list of activities that they might enjoy, tailored to their interests, in {{{language}}}. Return only the list of activities. Do not provide any additional explanation.

Activities:`,
});

const interestBasedActivitySuggestionsFlow = ai.defineFlow(
  {
    name: 'interestBasedActivitySuggestionsFlow',
    inputSchema: InterestBasedActivitySuggestionsInputSchema,
    outputSchema: InterestBasedActivitySuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
