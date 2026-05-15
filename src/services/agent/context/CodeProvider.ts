import type { ContextProvider, CodeContext } from './types';

/**
 * CodeProvider is a Sensor that "sees" the user's current editor state.
 */
export class CodeProvider implements ContextProvider<CodeContext> {
  readonly name = 'CodeProvider';

  async provide(): Promise<CodeContext> {
    const data = await chrome.runtime.sendMessage({ action: "PROXY_GET_PROBLEM_DATA" });
    return {
      code: data?.code || '',
      language: data?.language || 'unknown'
    };
  }
}
