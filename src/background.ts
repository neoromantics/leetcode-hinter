import { LLMService } from './services/llm';

chrome.runtime.onInstalled.addListener(() => {
  console.log('LeetCode Hinter extension installed.');
  
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error('Error setting panel behavior:', error));
});

// Handle standard messaging for simple tasks
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "GENERATE_HINT") {
    // Legacy support for non-streaming calls if needed
    const { settings, problemData, hints } = request.payload;
    LLMService.getHint(settings, problemData, hints)
      .then(content => sendResponse({ success: true, content }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

// Handle streaming via long-lived Port
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "hint-stream") {
    port.onMessage.addListener(async (request) => {
      if (request.action === "START_HINT_STREAM") {
        const { settings, problemData, hints } = request.payload;
        
        try {
          const stream = LLMService.getHintStream(settings, problemData, hints);
          for await (const chunk of stream) {
            port.postMessage({ type: "chunk", content: chunk });
          }
          port.postMessage({ type: "done" });
        } catch (error: any) {
          console.error('[LeetCode Hinter] Stream Error:', error);
          port.postMessage({ type: "error", message: error.message });
        }
      }
    });
  }
});

console.log('LeetCode Hinter background service worker loaded.');
