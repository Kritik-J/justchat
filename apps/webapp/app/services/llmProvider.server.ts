import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources";

const groqClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function* streamGenerate(
  model: string,
  history: ChatCompletionMessageParam[],
  settings: Record<string, any> = {}
): AsyncGenerator<string, void, unknown> {
  const stream = await groqClient.chat.completions.create({
    model,
    messages: history,
    temperature: settings.temperature ?? 0.7,
    max_tokens: settings.max_tokens ?? 1024,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices?.[0]?.delta?.content;
    if (content) yield content;
  }
}
