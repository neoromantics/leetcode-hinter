import OpenAI from 'openai';
import type { LLMProviderStrategy } from '../provider';
import type { Hint, ProblemData, Settings } from '../../../types';

export class OpenAIStrategy implements LLMProviderStrategy {
  async *getHintStream(
    settings: Settings,
    _problemData: ProblemData,
    history: Hint[],
    systemPrompt: string,
    userPrompt: string
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

    const messages = this.prepareMessages(provider, model, history, systemPrompt, userPrompt);

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

  private prepareMessages(
    provider: string,
    model: string,
    history: Hint[],
    systemPrompt: string,
    userPrompt: string
  ) {
    const messages: { role: string; content: string }[] = [];
    
    const systemRole = (provider === 'openai' && (model.startsWith('o1') || model.startsWith('o3'))) 
      ? "developer" 
      : "system";

    messages.push({ role: systemRole, content: systemPrompt });

    history.forEach((h, i) => {
      if (h.content.trim()) {
        messages.push({ 
          role: "user", 
          content: i === 0 ? "I'm working on a LeetCode problem. Help me." : "I'm still stuck on this, give me another nudge." 
        });
        messages.push({ role: h.role, content: h.content });
      }
    });

    messages.push({ role: "user", content: userPrompt });
    return messages;
  }
}
