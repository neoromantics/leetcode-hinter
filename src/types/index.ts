export type Provider = 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'openrouter' | 'together' | 'ollama';

export interface Hint {
  role: 'user' | 'assistant';
  content: string;
}

export interface ProblemData {
  title: string;
  description: string;
  code: string;
  language: string;
}

export interface Settings {
  openaiKey: string;
  geminiKey: string;
  anthropicKey: string;
  deepseekKey: string;
  openrouterKey: string;
  togetherKey: string;
  ollamaUrl: string;
  provider: Provider;
  model: string;
}
