/**
 * PageActions acts as the Effector Layer.
 * It provides methods to interact with the LeetCode UI.
 */
export const PageActions = {
  async runCode() {
    return this.executeInTab(() => {
      const runBtn = document.querySelector('button[data-cy="run-code-btn"]') as HTMLButtonElement;
      if (runBtn) runBtn.click();
    });
  },

  async submitCode() {
    return this.executeInTab(() => {
      const submitBtn = document.querySelector('button[data-cy="submit-code-btn"]') as HTMLButtonElement;
      if (submitBtn) submitBtn.click();
    });
  },

  async switchTab(tabName: 'Description' | 'Editorial' | 'Solutions' | 'Submissions') {
    return this.executeInTab((name) => {
      const tabs = document.querySelectorAll('div[role="tab"]');
      const target = Array.from(tabs).find(t => t.textContent?.includes(name)) as HTMLElement;
      if (target) target.click();
    }, tabName);
  },

  async executeInTab(fn: (...args: any[]) => void, ...args: any[]) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      return chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: fn,
        args: args
      });
    }
  }
};
