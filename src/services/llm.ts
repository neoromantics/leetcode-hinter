import type { Hint, ProblemData, Settings } from '../types';
import type { LLMProviderStrategy } from './llm/provider';
import { OpenAIStrategy } from './llm/strategies/OpenAIStrategy';
import { AnthropicStrategy } from './llm/strategies/AnthropicStrategy';
import { GeminiStrategy } from './llm/strategies/GeminiStrategy';

export class LLMService {
  private static readonly SYSTEM_PROMPT = `You are an expert LeetCode interview coach. Your goal is to help the user learn, not just give the answer. 
Provide a progressive hint based on their current code and the problem description. 
If their code is empty, suggest an algorithmic approach. 
If they have code, identify a logical flaw or suggest the next step. 
Keep it brief and encouraging. Never provide the full code solution unless explicitly asked after multiple hints.

IMPORTANT: End your response with exactly 2-3 brief follow-up questions that the user might want to ask next to deepen their understanding. 
Format them as a markdown list after a header "### Suggestions". 
Example:
### Suggestions
- What is the time complexity of this approach?
- Can you explain how the recursion works here?`;

  static async *getHintStream(
    settings: Settings,
    problemData: ProblemData,
    history: Hint[]
  ): AsyncGenerator<string> {
    const strategy = this.getStrategy(settings.provider);
    const userPrompt = this.prepareUserPrompt(problemData);

    console.log(`[LLMService] Requesting hint via strategy for ${settings.provider} (${settings.model})`);

    const stream = strategy.getHintStream(
      settings,
      problemData,
      history,
      this.SYSTEM_PROMPT,
      userPrompt
    );

    for await (const chunk of stream) {
      yield chunk;
    }
  }

  static async getHint(
    settings: Settings,
    problemData: ProblemData,
    history: Hint[]
  ): Promise<string> {
    let fullContent = "";
    const stream = this.getHintStream(settings, problemData, history);
    for await (const chunk of stream) {
      fullContent += chunk;
    }
    return fullContent;
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

  private static prepareUserPrompt(problemData: ProblemData): string {
    return `Problem: ${problemData.title}
Description: ${problemData.description}
Language: ${problemData.language}
My current code:
\`\`\`${problemData.language}
${problemData.code}
\`\`\``;
  }
}
