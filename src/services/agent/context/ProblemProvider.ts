import type { ContextProvider, ProblemContext } from './types';

/**
 * ProblemProvider is a Sensor that "sees" the LeetCode problem description.
 */
export class ProblemProvider implements ContextProvider<ProblemContext> {
  readonly name = 'ProblemProvider';

  async provide(): Promise<ProblemContext> {
    const data = await chrome.runtime.sendMessage({ action: "PROXY_GET_PROBLEM_DATA" });
    return {
      title: data?.title || '',
      description: data?.description || ''
    };
  }
}
