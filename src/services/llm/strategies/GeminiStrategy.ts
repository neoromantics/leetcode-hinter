import { GoogleGenerativeAI } from "@google/generative-ai";
import type { LLMProviderStrategy } from '../provider';
import type { Hint, ProblemData, Settings } from '../../../types';

export class GeminiStrategy implements LLMProviderStrategy {
  async *getHintStream(
    settings: Settings,
    _problemData: ProblemData,
    history: Hint[],
    systemPrompt: string,
    userPrompt: string
  ): AsyncGenerator<string> {
    const { model, geminiKey } = settings;
    
    const genAI = new GoogleGenerativeAI(geminiKey);
    const modelInstance = genAI.getGenerativeModel({ model });
    
    const historyItems = this.prepareHistory(history);

    const chat = modelInstance.startChat({ history: historyItems });
    const result = await chat.sendMessageStream(`SYSTEM INSTRUCTION: ${systemPrompt}\n\nCONTEXT:\n${userPrompt}`);
    
    for await (const chunk of result.stream) {
      yield chunk.text();
    }
  }

  private prepareHistory(history: Hint[]) {
    const historyItems = history
      .filter(h => h.content.trim())
      .flatMap((h, i) => [
        {
          role: 'user',
          parts: [{ text: i === 0 ? "I'm working on a LeetCode problem. Help me." : "I'm still stuck on this, give me another nudge." }]
        },
        {
          role: 'model',
          parts: [{ text: h.content }]
        }
      ]);

    if (historyItems.length === 0) {
      // Gemini often prefers a starting user message if history is provided
      return [];
    }

    return historyItems;
  }
}
