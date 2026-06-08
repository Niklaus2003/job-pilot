import Groq from "groq-sdk";
import { z } from "zod";
import { getGroqApiKey } from "./api-key-helper";

const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export async function callLlmJson<T>(
  prompt: string,
  schema: z.ZodType<T>,
  systemPrompt: string = "You are a helpful assistant that always outputs valid JSON."
): Promise<T> {
  const apiKey = await getGroqApiKey();
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured. Please set it in the Profile Settings.");
  }
  const groq = new Groq({ apiKey });

  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        model: DEFAULT_MODEL,
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response from LLM");
      }

      // Sometimes LLMs wrap JSON in markdown blocks even with json_object
      const cleanContent = content.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
      const parsed = JSON.parse(cleanContent);
      
      const validated = schema.parse(parsed);
      return validated;
    } catch (error) {
      attempts++;
      console.error(`LLM Call attempt ${attempts} failed:`, error);
      if (attempts >= maxAttempts) {
        throw error;
      }
      // Brief delay before retry
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  throw new Error("Failed to get valid JSON from LLM after retries");
}
