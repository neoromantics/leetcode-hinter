// LeetCode Content Script for Data Extraction
console.log('%c[LeetCode Hinter]%c Content script injected and active.', 'color: #ffa116; font-weight: bold;', 'color: inherit;');

interface ProblemData {
  title: string;
  description: string;
  code: string;
  language: string;
}

function extractDescription(): string {
  // Tier 1: Known stable data attributes
  const descriptionElement = document.querySelector('div[data-track-load="description_content"]');
  if (descriptionElement && descriptionElement.textContent?.trim()) {
    console.log('[LeetCode Hinter] Description found via data-track-load');
    return (descriptionElement as HTMLElement).innerText;
  }

  // Tier 2: Meta tags (highly stable)
  const metaDesc = document.querySelector('meta[name="description"]') || document.querySelector('meta[property="og:description"]');
  if (metaDesc) {
    const content = metaDesc.getAttribute('content');
    if (content && content.length > 50) {
      console.log('[LeetCode Hinter] Description found via meta tag');
      return content;
    }
  }

  // Tier 3: Common class patterns
  const selectors = [
    '.elf-description-container',
    '.question-content',
    'div.content__u4I1',
    '[class*="description__"]',
    '#question-detail-main-tabs div div'
  ];
  
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && (el as HTMLElement).innerText.trim().length > 50) {
      console.log('[LeetCode Hinter] Description found via selector:', selector);
      return (el as HTMLElement).innerText;
    }
  }
  return "";
}

function extractTitle(): string {
  // Tier 1: Specific selectors
  const selectors = [
    'span.text-title-large',
    'div[data-cy="question-title"]',
    '.question-title'
  ];

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent?.trim()) {
      console.log('[LeetCode Hinter] Title found via selector:', selector);
      return el.textContent.trim();
    }
  }

  // Tier 2: Meta tags
  const metaTitle = document.querySelector('meta[property="og:title"]') || document.querySelector('meta[name="twitter:title"]');
  if (metaTitle) {
    const content = metaTitle.getAttribute('content');
    if (content) {
      const cleanTitle = content.split(' - ')[0]; // Remove " - LeetCode"
      console.log('[LeetCode Hinter] Title found via meta tag:', cleanTitle);
      return cleanTitle;
    }
  }

  // Tier 3: Document title as fallback
  if (document.title && document.title.includes(' - LeetCode')) {
    const cleanTitle = document.title.split(' - ')[0];
    console.log('[LeetCode Hinter] Title found via document.title:', cleanTitle);
    return cleanTitle;
  }

  return "";
}

function extractCode(): string {
  // Tier 1: Monaco Editor lines (the actual code displayed)
  const monacoLines = document.querySelectorAll('.view-line');
  if (monacoLines.length > 0) {
    console.log('[LeetCode Hinter] Code found via Monaco .view-line');
    return Array.from(monacoLines).map(line => (line as HTMLElement).innerText).join('\n');
  }

  // Tier 2: Hidden textarea used by Monaco
  const textArea = document.querySelector('textarea.monaco-mouse-cursor-text');
  if (textArea && (textArea as HTMLTextAreaElement).value.trim()) {
    console.log('[LeetCode Hinter] Code found via Monaco textarea');
    return (textArea as HTMLTextAreaElement).value;
  }

  // Tier 3: Search for any element with "monaco-editor" class
  const editor = document.querySelector('.monaco-editor');
  if (editor) {
    const text = (editor as HTMLElement).innerText;
    if (text.trim()) {
      console.log('[LeetCode Hinter] Code found via .monaco-editor innerText');
      return text;
    }
  }

  return "";
}

function extractLanguage(): string {
  const selectors = [
    'button.rounded-lg.bg-fill-3',
    '.ant-select-selection-item',
    '[data-cy="lang-select"]',
    'button[id*="headlessui-listbox-button"]'
  ];

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent?.trim()) {
      console.log('[LeetCode Hinter] Language found via:', selector);
      return el.textContent.trim();
    }
  }
  return "unknown";
}

// Ensure the listener is registered immediately
chrome.runtime.onMessage.addListener((request: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  console.log('[LeetCode Hinter] Message received:', request.action);
  
  if (request.action === "GET_PROBLEM_DATA") {
    try {
      const data: ProblemData = {
        title: extractTitle(),
        description: extractDescription(),
        code: extractCode(),
        language: extractLanguage()
      };
      console.log('[LeetCode Hinter] Extracted data:', data.title);
      sendResponse(data);
    } catch (err) {
      console.error('[LeetCode Hinter] Extraction error:', err);
      sendResponse(null);
    }
  }
  return true; // Keep channel open for async response
});
