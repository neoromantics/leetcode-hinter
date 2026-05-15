import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Hint, ProblemData, Settings } from '../types';

export class LLMService {
  static async *getHintStream(
    settings: Settings,
    problemData: ProblemData,
    history: Hint[]
  ): AsyncGenerator<string> {
    const { provider, model } = settings;
    const activeKey = this.getActiveKey(settings);

    if (!activeKey && provider !== 'ollama') {
      throw new Error(`Please set your ${provider} API key in settings.`);
    }

    const systemPrompt = `You are an expert LeetCode interview coach. Your goal is to help the user learn, not just give the answer. 
    Provide a progressive hint based on their current code and the problem description. 
    If their code is empty, suggest an algorithmic approach. 
    If they have code, identify a logical flaw or suggest the next step. 
    Keep it brief and encouraging. Never provide the full code solution unless explicitly asked after multiple hints.`;

    const userPrompt = `Problem: ${problemData.title}\nDescription: ${problemData.description}\nLanguage: ${problemData.language}\nMy current code:\n\`\`\`${problemData.language}\n${problemData.code}\n\`\`\``;

    console.log(`[LLMService] Requesting hint from ${provider} (${model})`);

    // Prepare a unified history that works for everyone
    const messages: any[] = [];
    
    // Add developer/system instruction first for OpenAI-ish
    if (provider === 'openai' || provider === 'deepseek' || provider === 'openrouter' || provider === 'together' || provider === 'ollama') {
      messages.push({ 
        role: (provider === 'openai' && (model.startsWith('o1') || model.startsWith('o3'))) ? "developer" : "system", 
        content: systemPrompt 
      });
    }

    // Add previous conversation history
    history.forEach((h, i) => {
      if (h.content.trim()) {
        if (i === 0) {
          messages.push({ role: "user", content: "I'm working on a LeetCode problem." });
        } else {
          messages.push({ role: "user", content: "I'm still stuck, can you give me another nudge?" });
        }
        messages.push({ role: h.role, content: h.content });
      }
    });

    // Add the CURRENT context as the final user message
    messages.push({ role: "user", content: userPrompt });

    if (provider === 'openai' || provider === 'deepseek' || provider === 'openrouter' || provider === 'together' || provider === 'ollama') {
      const gen = await this.callOpenAICompatible(settings, activeKey, model, messages);
      for await (const chunk of gen) yield chunk;
    } else if (provider === 'anthropic') {
      const gen = await this.callAnthropic(activeKey, model, systemPrompt, messages);
      for await (const chunk of gen) yield chunk;
    } else if (provider === 'gemini') {
      const gen = await this.callGemini(activeKey, model, systemPrompt, messages);
      for await (const chunk of gen) yield chunk;
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
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

  private static getActiveKey(settings: Settings): string {
    const keys: Record<string, string> = {
      openai: settings.openaiKey,
      anthropic: settings.anthropicKey,
      gemini: settings.geminiKey,
      deepseek: settings.deepseekKey,
      openrouter: settings.openrouterKey,
      together: settings.togetherKey,
      ollama: 'ollama'
    };
    return keys[settings.provider] || '';
  }

  private static async callOpenAICompatible(
    settings: Settings,
    apiKey: string,
    model: string,
    messages: any[]
  ): Promise<AsyncGenerator<string>> {
    const baseUrls: Record<string, string | undefined> = {
      openai: undefined,
      deepseek: 'https://api.deepseek.com',
      openrouter: 'https://openrouter.ai/api/v1',
      together: 'https://api.together.xyz/v1',
      ollama: settings.ollamaUrl
    };

    const client = new OpenAI({
      apiKey,
      baseURL: baseUrls[settings.provider],
      dangerouslyAllowBrowser: true,
      fetch: (...args) => fetch(...args),
      defaultHeaders: settings.provider === 'openrouter' ? {
        "HTTP-Referer": "https://github.com/taiyanliu/leetcode-hinter",
        "X-Title": "LeetCode Hinter"
      } : undefined
    });

    const stream = await client.chat.completions.create({
      model: model,
      messages: messages,
      stream: true,
      ...(model.startsWith('o') ? {} : { temperature: 0.7 })
    });

    async function* generate() {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) yield content;
      }
    }
    return generate();
  }

  private static async callAnthropic(
    apiKey: string,
    model: string,
    systemPrompt: string,
    messages: any[]
  ): Promise<AsyncGenerator<string>> {
    const client = new Anthropic({ 
      apiKey, 
      dangerouslyAllowBrowser: true,
      fetch: (...args) => fetch(...args)
    });
    
    const filteredMessages = messages.filter(m => m.role !== 'system' && m.role !== 'developer');

    const stream = await client.messages.create({
      model,
      system: systemPrompt,
      messages: filteredMessages.map(m => ({ 
        role: m.role as 'user' | 'assistant', 
        content: m.content 
      })),
      max_tokens: 1024,
      stream: true
    });

    async function* generate() {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && (event.delta as any).text) {
          yield (event.delta as any).text;
        }
      }
    }
    return generate();
  }

  private static async callGemini(
    apiKey: string,
    model: string,
    systemPrompt: string,
    messages: any[]
  ): Promise<AsyncGenerator<string>> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelInstance = genAI.getGenerativeModel({ model });
    
    const finalUserMessage = messages[messages.length - 1].content;
    const historyItems = messages.slice(0, messages.length - 1)
      .filter(m => m.role !== 'system' && m.role !== 'developer')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    if (historyItems.length > 0 && historyItems[0].role !== 'user') {
      historyItems.unshift({ role: 'user', parts: [{ text: "Hello, I'm working on a LeetCode problem." }] });
    }

    const chat = modelInstance.startChat({ history: historyItems });
    const result = await chat.sendMessageStream(`SYSTEM INSTRUCTION: ${systemPrompt}\n\nCONTEXT:\n${finalUserMessage}`);
    
    async function* generate() {
      for await (const chunk of result.stream) {
        yield chunk.text();
      }
    }
    return generate();
  }
}
