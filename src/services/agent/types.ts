import type { Hint, ProblemData, Settings } from '../../types';

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system' | 'developer';
  content: string;
}

export interface IAgent {
  name: string;
  process(settings: Settings, context: ProblemData, history: Hint[]): AsyncGenerator<string>;
}
