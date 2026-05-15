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
    const messages = this.assembleWorldState(settings, problem, history);
    
    console.log(`[${this.name}] Requesting stream for ${settings.provider} with ${messages.length} messages`);
    
    try {
      const stream = LLMService.getHintStream(settings, messages);
      for await (const chunk of stream) {
        yield chunk;
      }
    } catch (error: any) {
      console.error(`[${this.name}] Error during processing:`, error);
      throw error;
    }
  }

  /**
   * Assembles the "World State" ensuring alternating roles for LLM providers.
   */
  private assembleWorldState(settings: Settings, problem: ProblemData, history: Hint[]): AgentMessage[] {
    const messages: AgentMessage[] = [];
    
    // 1. System Identity
    const systemRole = (settings.provider === 'openai' && (settings.model.startsWith('o1') || settings.model.startsWith('o3'))) 
      ? "developer" 
      : "system";
    
    messages.push({ 
      role: systemRole as any, 
      content: PROMPTS.HINT_COACH_SYSTEM 
    });

    // 2. Map History and Current Context into alternating turns
    // The pattern is: [User Context + Feedback] -> Assistant Hint -> [User Feedback] -> Assistant Hint
    
    const problemContext = PROMPTS.PROBLEM_CONTEXT_TEMPLATE(
      problem.title,
      problem.description,
      problem.language,
      problem.code
    );

    if (history.length === 0) {
      // First hint: Just send the context
      messages.push({ role: "user", content: problemContext });
    } else {
      // Subsequent hints: We need to interleave history correctly
      history.forEach((h, i) => {
        if (!h.content.trim()) return;

        if (h.role === 'user') {
          // If the history item is a user follow-up question
          messages.push({ role: 'user', content: h.content });
        } else {
          // If the history item is an assistant hint, we need a preceding user message
          // Ensure we don't double up on 'user' messages
          const lastMsg = messages[messages.length - 1];
          if (lastMsg && lastMsg.role !== 'user') {
             messages.push({ 
               role: 'user', 
               content: i === 0 ? "I'm working on a LeetCode problem. Help me." : "I'm still stuck, give me another nudge." 
             });
          }
          messages.push({ role: 'assistant', content: h.content });
        }
      });

      // Finally, add the current context as a user message, but only if the last message was assistant
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === 'assistant') {
        messages.push({ 
          role: "user", 
          content: `Here is my updated context/progress:\n${problemContext}` 
        });
      } else if (lastMsg && lastMsg.role === 'user') {
        // If the last message was a user follow-up, append the context to it or replace it?
        // Better to append to keep the flow natural.
        lastMsg.content = `${lastMsg.content}\n\nContext:\n${problemContext}`;
      }
    }

    return messages;
  }
}
