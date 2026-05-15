import { GoogleGenerativeAI } from "@google/generative-ai";
import type { LLMProviderStrategy, LLMMessage } from '../provider';
import type { Settings } from '../../../types';

export class GeminiStrategy implements LLMProviderStrategy {
  async *getHintStream(
    settings: Settings,
    messages: LLMMessage[]
  ): AsyncGenerator<string> {
    const { model, geminiKey } = settings;
    
    const genAI = new GoogleGenerativeAI(geminiKey);
    const modelInstance = genAI.getGenerativeModel({ model });
    
    const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
    const finalUserMessage = messages[messages.length - 1].content;
    
    const historyItems = messages.slice(0, messages.length - 1)
      .filter(m => m.role !== 'system' && m.role !== 'developer')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    if (historyItems.length > 0 && historyItems[0].role !== 'user') {
      historyItems.unshift({ role: 'user', parts: [{ text: "Hello, I'm working on a LeetCode problem." }] });
    }

    const chat = modelInstance.startChat({ history: historyItems as any });
    const result = await chat.sendMessageStream(`SYSTEM INSTRUCTION: ${systemPrompt}\n\nCONTEXT:\n${finalUserMessage}`);
    
    for await (const chunk of result.stream) {
      yield chunk.text();
    }
  }
}
