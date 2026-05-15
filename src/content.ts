import { Extractor } from './services/extractor';
import { UIManager } from './services/ui-manager';

console.log('%c[LeetCode Hinter]%c Content script active.', 'color: #ffa116; font-weight: bold;', 'color: inherit;');

// Initialize UI
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => UIManager.injectOverlay());
} else {
  UIManager.injectOverlay();
}

// Handle data extraction requests
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "GET_PROBLEM_DATA") {
    try {
      const data = Extractor.getProblemData();
      sendResponse(data);
    } catch (err) {
      console.error('[LeetCode Hinter] Extraction error:', err);
      sendResponse(null);
    }
  }
  return true;
});
