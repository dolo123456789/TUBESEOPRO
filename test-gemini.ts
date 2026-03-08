import { generateKeywordData } from './src/services/geminiService';
import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "test",
    });
    console.log(response.text);
  } catch (e) {
    console.error(e);
  }
}
run();
