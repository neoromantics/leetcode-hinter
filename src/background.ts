import { LLMService } from './services/llm';
import type { GenerateHintMessage, StartHintStreamMessage } from './types/messaging';

/**
 * EXTENSION LIFECYCLE
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log('[LeetCode Hinter] Extension installed/updated.');
});

// Toggle overlay when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_OVERLAY" })
      .catch(err => console.error('[LeetCode Hinter] Toggle error:', err));
  }
});

/**
 * MESSAGE HANDLERS
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Legacy non-streaming request
  if (request.action === "GENERATE_HINT") {
    const { settings, problemData, hints } = (request as GenerateHintMessage).payload;
    LLMService.getHint(settings, problemData, hints)
      .then(content => sendResponse({ success: true, content }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  // Proxy for data extraction (handles iframe restricted access)
  if (request.action === "PROXY_GET_PROBLEM_DATA") {
    const tabId = sender.tab?.id;
    if (tabId) {
      chrome.tabs.sendMessage(tabId, { action: "GET_PROBLEM_DATA" })
        .then(data => sendResponse(data))
        .catch(err => {
          console.error('[LeetCode Hinter] Extraction Proxy error:', err);
          sendResponse(null);
        });
      return true;
    } else {
      // Fallback for cases where sender.tab is missing
      chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
        if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, { action: "GET_PROBLEM_DATA" })
            .then(data => sendResponse(data))
            .catch(() => sendResponse(null));
        } else {
          sendResponse(null);
        }
      });
      return true;
    }
  }
});

/**
 * STREAMING PORT HANDLER
 */
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "hint-stream") {
    port.onMessage.addListener(async (request: StartHintStreamMessage) => {
      if (request.action === "START_HINT_STREAM") {
        const { settings, problemData, hints } = request.payload;
        
        try {
          const stream = LLMService.getHintStream(settings, problemData, hints);
          for await (const chunk of stream) {
            port.postMessage({ type: "chunk", content: chunk });
          }
          port.postMessage({ type: "done" });
        } catch (error: any) {
          console.error('[LeetCode Hinter] LLM Stream error:', error);
          port.postMessage({ type: "error", message: error.message });
        }
      }
    });
  }
});

console.log('[LeetCode Hinter] Background service worker active.');
