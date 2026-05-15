import { LeetCodeHintAgent } from './services/agent/LeetCodeHintAgent';
import type { StartHintStreamMessage } from './types/messaging';

const agent = new LeetCodeHintAgent();

/**
 * EXTENSION LIFECYCLE
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log('[LeetCode Hinter] Extension installed/updated.');
  // Clear any legacy hint history to ensure a clean stateless experience
  chrome.storage.local.remove(['hints']);
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
      return true; // Keep channel open for async response
    } else {
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
        
        console.log(`[LeetCode Hinter] Starting stream for ${settings.provider}...`);
        
        try {
          if (!problemData) {
            throw new Error("No problem data received in background stream handler.");
          }

          const stream = agent.process(settings, problemData, hints);
          
          let chunkCount = 0;
          for await (const chunk of stream) {
            chunkCount++;
            port.postMessage({ type: "chunk", content: chunk });
          }
          
          console.log(`[LeetCode Hinter] Stream finished. Total chunks: ${chunkCount}`);
          port.postMessage({ type: "done" });
          
        } catch (error: any) {
          console.error('[LeetCode Hinter] Agent Execution Error:', error);
          // Send specific error message back to the UI
          port.postMessage({ 
            type: "error", 
            message: error.message || "An unknown error occurred during hint generation."
          });
        }
      }
    });
  }
});

console.log('[LeetCode Hinter] Background service worker active.');
