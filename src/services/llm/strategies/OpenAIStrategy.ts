import OpenAI from 'openai';
import type { LLMProviderStrategy, LLMMessage } from '../provider';
import type { Settings } from '../../../types';

export class OpenAIStrategy implements LLMProviderStrategy {
  async *getHintStream(
    settings: Settings,
    messages: LLMMessage[]
  ): AsyncGenerator<string> {
    const { provider, model, ollamaUrl } = settings;
    
    const baseUrls: Record<string, string | undefined> = {
      openai: undefined,
      deepseek: 'https://api.deepseek.com',
      openrouter: 'https://openrouter.ai/api/v1',
      together: 'https://api.together.xyz/v1',
      ollama: ollamaUrl
    };

    const apiKey = this.getApiKey(settings);
    
    const client = new OpenAI({
      apiKey,
      baseURL: baseUrls[provider],
      dangerouslyAllowBrowser: true,
      fetch: (...args) => fetch(...args),
      defaultHeaders: provider === 'openrouter' ? {
        "HTTP-Referer": "https://github.com/taiyanliu/leetcode-hinter",
        "X-Title": "LeetCode Hinter"
      } : undefined
    });

    const stream = await client.chat.completions.create({
      model: model,
      messages: messages as any,
      stream: true,
      ...(model.startsWith('o') ? {} : { temperature: 0.7 })
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) yield content;
    }
  }

  private getApiKey(settings: Settings): string {
    const keys: Record<string, string> = {
      openai: settings.openaiKey,
      deepseek: settings.deepseekKey,
      openrouter: settings.openrouterKey,
      together: settings.togetherKey,
      ollama: 'ollama'
    };
    return keys[settings.provider] || '';
  }
}
