'use server';

import {
  generatePersonalizedItinerary,
  type GeneratePersonalizedItineraryInput,
} from '@/ai/flows/generate-personalized-itinerary';
import {
  adjustItinerary,
  type AdjustItineraryInput,
} from '@/ai/flows/real-time-itinerary-adaptation';
import {
  getAccommodationAndTransportRecommendations,
  type AccommodationAndTransportRecommendationsInput,
} from '@/ai/flows/accommodation-and-transport-recommendations';
import {
  suggestActivities,
  type InterestBasedActivitySuggestionsInput,
} from '@/ai/flows/interest-based-activity-suggestions';
import {
  chatWithGemini,
  type ChatWithGeminiInput,
} from '@/ai/flows/chat-with-gemini';
import { z } from 'zod';

// Itinerary Generation Action
const itinerarySchema = z.object({
  destination: z.string().min(1, 'Destination is required.'),
  budget: z.string().min(1, 'Budget is required.'),
  interests: z.string().min(1, 'Interests are required.'),
  duration: z.string().min(1, 'Duration is required.'),
  language: z.string(),
});

export async function generateItineraryAction(
  prevState: any,
  formData: FormData
) {
  const validatedFields = itinerarySchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      itinerary: null,
    };
  }

  try {
    const result = await generatePersonalizedItinerary(
      validatedFields.data as GeneratePersonalizedItineraryInput
    );
    return { itinerary: result.itinerary, errors: null };
  } catch (error) {
    return {
      itinerary: null,
      errors: { _form: ['Failed to generate itinerary. Please try again.'] },
    };
  }
}

// Real-time Adaptation Action
const adaptationSchema = z.object({
  itinerary: z.string().min(1, 'Current itinerary is required.'),
  weather: z.string().optional(),
  traffic: z.string().optional(),
  events: z.string().optional(),
  language: z.string(),
});

export async function adaptItineraryAction(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const validatedFields = adaptationSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      result: null,
    };
  }

  try {
    const result = await adjustItinerary(validatedFields.data as AdjustItineraryInput);
    return { result, errors: null };
  } catch (error) {
    return {
      result: null,
      errors: { _form: ['Failed to adapt itinerary. Please try again.'] },
    };
  }
}

// Recommender Action
const recommenderSchema = z.object({
  location: z.string().min(1, 'Location is required.'),
  preferences: z.string().optional(),
  language: z.string(),
});

export async function getRecommendationsAction(
  prevState: any,
  formData: FormData
) {
  const validatedFields = recommenderSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      result: null,
    };
  }

  try {
    const result = await getAccommodationAndTransportRecommendations(
      validatedFields.data as AccommodationAndTransportRecommendationsInput
    );
    return { result, errors: null };
  } catch (error) {
    return {
      result: null,
      errors: { _form: ['Failed to get recommendations. Please try again.'] },
    };
  }
}

// Activity Suggester Action
const suggesterSchema = z.object({
  location: z.string().min(1, 'Location is required.'),
  interests: z.string().min(1, 'Interests are required.'),
  language: z.string(),
});

export async function suggestActivitiesAction(
  prevState: any,
  formData: FormData
) {
  const validatedFields = suggesterSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      result: null,
    };
  }

  try {
    const result = await suggestActivities(
      validatedFields.data as InterestBasedActivitySuggestionsInput
    );
    return { result, errors: null };
  } catch (error) {
    return {
      result: null,
      errors: { _form: ['Failed to suggest activities. Please try again.'] },
    };
  }
}

// Chat Action
const chatSchema = z.object({
  message: z.string().min(1),
  language: z.string(),
});

export async function chatWithGeminiAction(prevState: any, formData: FormData) {
  const validatedFields = chatSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      response: 'Invalid message.',
    };
  }

  try {
    const result = await chatWithGemini(
      validatedFields.data as ChatWithGeminiInput
    );
    return { response: result.response };
  } catch (error) {
    return {
      response: 'An error occurred. Please try again.',
    };
  }
}
