import Anthropic from '@anthropic-ai/sdk';
import type { LLMProviderStrategy, LLMMessage } from '../provider';
import type { Settings } from '../../../types';

export class AnthropicStrategy implements LLMProviderStrategy {
  async *getHintStream(
    settings: Settings,
    messages: LLMMessage[]
  ): AsyncGenerator<string> {
    const { model, anthropicKey } = settings;
    
    const client = new Anthropic({ 
      apiKey: anthropicKey, 
      dangerouslyAllowBrowser: true,
      fetch: (...args) => fetch(...args)
    });

    const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
    const filteredMessages = messages.filter(m => m.role !== 'system' && m.role !== 'developer');

    const stream = await client.messages.create({
      model,
      system: systemPrompt,
      messages: filteredMessages.map(m => ({ 
        role: m.role as 'user' | 'assistant', 
        content: m.content 
      })),
      max_tokens: 1024,
      stream: true
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && 'text' in event.delta) {
        yield event.delta.text;
      }
    }
  }
}
