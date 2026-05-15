import type { Hint, ProblemData, Settings } from '../../types';
import type { IAgent, AgentMessage } from './types';
import { PROMPTS } from './prompts';
import { LLMService } from '../llm';

/**
 * LeetCodeHintAgent is the Brain.
 * It orchestrates Sensors (ContextProviders) and Effectors (PageActions)
 * to fulfill user requests.
 */
export class LeetCodeHintAgent implements IAgent {
  readonly name = 'LeetCodeHintAgent';

  async *process(settings: Settings, problem: ProblemData, history: Hint[]): AsyncGenerator<string> {
    // 1. Build the thought process (messages)
    const messages = this.assembleWorldState(settings, problem, history);
    
    console.log(`[${this.name}] Processing request via transport layer`);
    
    // 2. Execute via Transport Layer
    return LLMService.getHintStream(settings, messages);
  }

  /**
   * Assembles the "World State" into a format the LLM can understand.
   * This is where Context Providers would be used in a more complex setup.
   */
  private assembleWorldState(settings: Settings, problem: ProblemData, history: Hint[]): AgentMessage[] {
    const messages: AgentMessage[] = [];
    
    // Identify Personality
    const systemRole = (settings.provider === 'openai' && (settings.model.startsWith('o1') || settings.model.startsWith('o3'))) 
      ? "developer" 
      : "system";
    
    messages.push({ 
      role: systemRole as any, 
      content: PROMPTS.HINT_COACH_SYSTEM 
    });

    // Reconstruct Memory
    history.forEach((h, i) => {
      if (h.content.trim()) {
        messages.push({ 
          role: "user", 
          content: i === 0 ? "I'm working on a LeetCode problem. Help me." : "I'm still stuck on this, give me another nudge." 
        });
        messages.push({ 
          role: h.role as 'assistant' | 'user', 
          content: h.content 
        });
      }
    });

    // Attach Current Perception
    const perception = PROMPTS.PROBLEM_CONTEXT_TEMPLATE(
      problem.title,
      problem.description,
      problem.language,
      problem.code
    );

    messages.push({ role: "user", content: perception });

    return messages;
  }
}
