import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TranslationResult, GeneratedResponse } from '../types';

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'DUMMY_KEY_FOR_BUILD' });

export class GeminiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiError";
  }
}

/**
 * Detects the language of the provided text and translates it to English.
 */
export const detectAndTranslate = async (text: string): Promise<TranslationResult> => {
  try {
    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        originalLanguage: {
          type: Type.STRING,
          description: "The name of the detected language (e.g., Spanish, French).",
        },
        englishTranslation: {
          type: Type.STRING,
          description: "The English translation of the input text.",
        },
      },
      required: ["originalLanguage", "englishTranslation"],
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following text. Detect its language and translate it accurately to English.\n\nText: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new GeminiError("No response received from Gemini.");
    }

    return JSON.parse(resultText) as TranslationResult;
  } catch (error) {
    console.error("Translation error:", error);
    throw new GeminiError("Failed to translate text. Please try again.");
  }
};

/**
 * Generates a response based on context, returning both English and Target Language versions.
 */
export const generateResponse = async (
  incomingMessageEnglish: string,
  targetLanguage: string,
  userContext: string
): Promise<GeneratedResponse> => {
  try {
    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        englishReply: {
          type: Type.STRING,
          description: "A draft reply in English based on the user's context.",
        },
        targetLanguageReply: {
          type: Type.STRING,
          description: `The same reply translated naturally into ${targetLanguage}.`,
        },
      },
      required: ["englishReply", "targetLanguageReply"],
    };

    const prompt = `
      You are an expert CRM communication assistant.
      
      TASK:
      1. Read the Incoming Message (which has been translated to English).
      2. Read the User's Context/Instruction on how to reply.
      3. Generate a professional and appropriate response.
      4. Provide the response in TWO forms: 
         - English (for the user to verify)
         - ${targetLanguage} (for the user to send)
      
      Incoming Message: "${incomingMessageEnglish}"
      Target Language: ${targetLanguage}
      User Instructions: "${userContext}"
      
      Ensure the translation is culturally appropriate for a business context.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new GeminiError("No response received from Gemini.");
    }

    return JSON.parse(resultText) as GeneratedResponse;
  } catch (error) {
    console.error("Generation error:", error);
    throw new GeminiError("Failed to generate response. Please try again.");
  }
};