import type { Settings } from '../types';
import type { LLMProviderStrategy, LLMMessage } from './llm/provider';
import { OpenAIStrategy } from './llm/strategies/OpenAIStrategy';
import { AnthropicStrategy } from './llm/strategies/AnthropicStrategy';
import { GeminiStrategy } from './llm/strategies/GeminiStrategy';
import { OllamaStrategy } from './llm/strategies/OllamaStrategy';

/**
 * LLMService acts as the Transport Layer.
 * It is purely responsible for communicating with different AI providers.
 */
export class LLMService {
  static async *getHintStream(
    settings: Settings,
    messages: LLMMessage[]
  ): AsyncGenerator<string> {
    const { provider } = settings;
    const apiKey = this.getApiKey(settings);

    // Ollama is allowed to have an empty key
    if (!apiKey && provider !== 'ollama_local' && provider !== 'ollama_cloud') {
      throw new Error(`Please set your ${provider} API key in settings.`);
    }

    const strategy = this.getStrategy(provider);
    
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
        return new OpenAIStrategy();
      case 'ollama_local':
      case 'ollama_cloud':
        return new OllamaStrategy();
      case 'anthropic':
        return new AnthropicStrategy();
      case 'gemini':
        return new GeminiStrategy();
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private static getApiKey(settings: Settings): string {
    const keys: Record<string, string> = {
      openai: settings.openaiKey,
      anthropic: settings.anthropicKey,
      gemini: settings.geminiKey,
      deepseek: settings.deepseekKey,
      openrouter: settings.openrouterKey,
      together: settings.togetherKey,
      ollama_local: 'ollama', // Local doesn't need a key
      ollama_cloud: settings.ollamaKey // Cloud requires a key
    };
    return keys[settings.provider] || '';
  }
}
