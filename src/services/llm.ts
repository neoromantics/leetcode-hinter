import type { Settings } from '../types';
import type { LLMProviderStrategy, LLMMessage } from './llm/provider';
import { OpenAIStrategy } from './llm/strategies/OpenAIStrategy';
import { AnthropicStrategy } from './llm/strategies/AnthropicStrategy';
import { GeminiStrategy } from './llm/strategies/GeminiStrategy';

/**
 * LLMService acts as the Transport Layer.
 * It is purely responsible for communicating with different AI providers.
 */
export class LLMService {
  static async *getHintStream(
    settings: Settings,
    messages: LLMMessage[]
  ): AsyncGenerator<string> {
    const strategy = this.getStrategy(settings.provider);
    
    const stream = strategy.getHintStream(settings, messages);

    for await (const chunk of stream) {
      yield chunk;
    }
  }

  private static getStrategy(provider: string): LLMProviderStrategy {
    switch (provider) {
      case 'openai':
      case 'deepseek':
      case 'openrouter':
      case 'together':
      case 'ollama':
        return new OpenAIStrategy();
      case 'anthropic':
        return new AnthropicStrategy();
      case 'gemini':
        return new GeminiStrategy();
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
