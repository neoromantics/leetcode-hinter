import Anthropic from '@anthropic-ai/sdk';
import type { LLMProviderStrategy } from '../provider';
import type { Hint, ProblemData, Settings } from '../../../types';

export class AnthropicStrategy implements LLMProviderStrategy {
  async *getHintStream(
    settings: Settings,
    _problemData: ProblemData,
    history: Hint[],
    systemPrompt: string,
    userPrompt: string
  ): AsyncGenerator<string> {
    const { model, anthropicKey } = settings;
    
    const client = new Anthropic({ 
      apiKey: anthropicKey, 
      dangerouslyAllowBrowser: true,
      fetch: (...args) => fetch(...args)
    });

    const messages = this.prepareMessages(history, userPrompt);

    const stream = await client.messages.create({
      model,
      system: systemPrompt,
      messages: messages as any,
      max_tokens: 1024,
      stream: true
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && 'text' in event.delta) {
        yield event.delta.text;
      }
    }
  }

  private prepareMessages(history: Hint[], userPrompt: string) {
    const messages: { role: 'user' | 'assistant'; content: string }[] = [];

    history.forEach((h, i) => {
      if (h.content.trim()) {
        messages.push({ 
          role: "user", 
          content: i === 0 ? "I'm working on a LeetCode problem. Help me." : "I'm still stuck on this, give me another nudge." 
        });
        messages.push({ role: h.role as 'assistant', content: h.content });
      }
    });

    messages.push({ role: "user", content: userPrompt });
    return messages;
  }
}
