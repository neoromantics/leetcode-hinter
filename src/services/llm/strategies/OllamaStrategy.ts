import { Ollama } from 'ollama/browser';
import type { LLMProviderStrategy, LLMMessage } from '../provider';
import type { Settings } from '../../../types';

/**
 * OllamaStrategy uses the official Ollama library for direct API communication.
 * This supports both local instances and remote/cloud Ollama servers.
 */
export class OllamaStrategy implements LLMProviderStrategy {
  async *getHintStream(
    settings: Settings,
    messages: LLMMessage[]
  ): AsyncGenerator<string> {
    const { provider, model, ollamaUrl, ollamaKey } = settings;
    
    // 1. Determine the correct host
    let host = 'http://localhost:11434'; // Default
    
    if (provider === 'ollama_cloud') {
      host = 'https://ollama.com';
    } else {
      // Local or custom: Strip trailing /v1, /api, or / to prevent double paths in the client
      host = ollamaUrl.replace(/\/v1\/?$/, '').replace(/\/api\/?$/, '').replace(/\/$/, '');
    }

    // 2. Prepare authentication
    const headers: Record<string, string> = {};
    if (ollamaKey && (provider === 'ollama_cloud' || ollamaKey.length > 5)) {
      headers['Authorization'] = `Bearer ${ollamaKey}`;
    }

    // 3. Initialize native Ollama client
    const ollama = new Ollama({ 
      host: host,
      headers: headers
    });

    try {
      const response = await ollama.chat({
        model: model,
        messages: messages.map(m => ({
          role: m.role === 'developer' ? 'system' : m.role,
          content: m.content
        })),
        stream: true,
      });

      for await (const part of response) {
        yield part.message.content;
      }
    } catch (err: any) {
      console.error('[OllamaStrategy] Error:', err);
      throw new Error(`Ollama API Error: ${err.message}`);
    }
  }
}
