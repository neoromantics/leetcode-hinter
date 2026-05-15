import type { Provider } from './types';

export const MODELS: Record<Provider, string[]> = {
  openai: ['o3-mini', 'o1-mini', 'gpt-4o'],
  anthropic: ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest'],
  gemini: ['gemini-2.0-flash-exp', 'gemini-2.0-flash-thinking-exp'],
  deepseek: ['deepseek-reasoner', 'deepseek-chat'],
  openrouter: ['google/gemini-2.0-flash-thinking-exp:free', 'deepseek/deepseek-r1', 'anthropic/claude-3.5-sonnet'],
  together: ['deepseek-ai/DeepSeek-R1', 'meta-llama/Llama-3.3-70B-Instruct-Turbo', 'Qwen/Qwen2.5-Coder-32B-Instruct'],
  ollama: ['gemma3:12b', 'gemma3:4b', 'deepseek-coder-v2', 'llama3.3', 'mistral', 'codellama']
};
