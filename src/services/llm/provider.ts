import type { Settings } from '../../types';

export interface LLMMessage {
  role: string;
  content: string;
}

export interface LLMProviderStrategy {
  getHintStream(
    settings: Settings,
    messages: LLMMessage[]
  ): AsyncGenerator<string>;
}
