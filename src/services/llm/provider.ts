import type { Hint, ProblemData, Settings } from '../../types';

export interface LLMMessage {
  role: string;
  content: string;
}

export interface LLMProviderStrategy {
  getHintStream(
    settings: Settings,
    problemData: ProblemData,
    history: Hint[],
    systemPrompt: string,
    userPrompt: string
  ): AsyncGenerator<string>;
}
