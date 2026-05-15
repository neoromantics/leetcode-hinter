// LeetCode Content Script for Data Extraction & UI Injection
import type { ProblemData } from './types';

console.log('%c[LeetCode Hinter]%c Content script active.', 'color: #ffa116; font-weight: bold;', 'color: inherit;');

/**
 * UI INJECTION LOGIC
 */
const OVERLAY_ID = 'leetcode-hinter-root';
const DRAWER_WIDTH = '440px';
const HANDLE_WIDTH = '40px';

function injectOverlay() {
  if (document.getElementById(OVERLAY_ID)) return;

  const container = document.createElement('div');
  container.id = OVERLAY_ID;
  
  Object.assign(container.style, {
    position: 'fixed',
    top: '0',
    right: '0',
    height: '100vh',
    width: '0px', // Start closed
    zIndex: '2147483647',
    transition: 'width 0.4s cubic-bezier(0.19, 1, 0.22, 1), box-shadow 0.4s ease',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'row-reverse',
    boxShadow: 'none'
  });

  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('overlay.html');
  Object.assign(iframe.style, {
    height: '100%',
    width: DRAWER_WIDTH,
    border: 'none',
    opacity: '0',
    transition: 'opacity 0.3s ease',
    flexShrink: '0'
  });

  // Visible Floating Handle
  const handle = document.createElement('div');
  handle.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </div>
  `;
  Object.assign(handle.style, {
    position: 'absolute',
    left: `-${HANDLE_WIDTH}`,
    top: '50%',
    transform: 'translateY(-50%)',
    width: HANDLE_WIDTH,
    height: '80px',
    backgroundColor: '#ffa116',
    borderTopLeftRadius: '16px',
    borderBottomLeftRadius: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '-4px 0 15px rgba(0,0,0,0.15)',
    transition: 'all 0.3s ease',
    zIndex: '2147483647',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRight: 'none'
  });

  container.appendChild(handle);
  container.appendChild(iframe);
  document.body.appendChild(container);

  let isOpen = false;
  let isLocked = false;

  const open = () => {
    isOpen = true;
    container.style.width = DRAWER_WIDTH;
    container.style.boxShadow = '-10px 0 50px rgba(0,0,0,0.2)';
    iframe.style.opacity = '1';
    handle.style.opacity = '0'; // Hide handle when open to keep it clean
    handle.style.pointerEvents = 'none';
  };

  const close = () => {
    if (!isLocked) {
      isOpen = false;
      container.style.width = '0px';
      container.style.boxShadow = 'none';
      iframe.style.opacity = '0';
      handle.style.opacity = '1';
      handle.style.pointerEvents = 'auto';
    }
  };

  handle.addEventListener('mouseenter', open);
  container.addEventListener('mouseleave', close);

  // External toggle (from background script / extension icon)
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "TOGGLE_OVERLAY") {
      if (isOpen) {
        isLocked = false;
        close();
      } else {
        isLocked = true;
        open();
      }
    }
  });

  window.addEventListener('message', (event) => {
    if (event.data.type === 'LEETCODE_HINTER_LOCK') {
      isLocked = event.data.locked;
      if (!isLocked) close();
    }
  });
}

/**
 * DATA EXTRACTION LOGIC
 */
const Extractor = {
  extractDescription(): string {
    const descriptionElement = document.querySelector('div[data-track-load="description_content"]');
    if (descriptionElement && descriptionElement.textContent?.trim()) {
      return (descriptionElement as HTMLElement).innerText;
    }

    const metaDesc = document.querySelector('meta[name="description"]') || document.querySelector('meta[property="og:description"]');
    if (metaDesc) {
      const content = metaDesc.getAttribute('content');
      if (content && content.length > 50) return content;
    }

    const selectors = ['.elf-description-container', '.question-content', 'div.content__u4I1', '[class*="description__"]'];
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && (el as HTMLElement).innerText.trim().length > 50) return (el as HTMLElement).innerText;
    }
    return "";
  },

  extractTitle(): string {
    const selectors = ['span.text-title-large', 'div[data-cy="question-title"]', '.question-title'];
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent?.trim()) return el.textContent.trim();
    }

    const metaTitle = document.querySelector('meta[property="og:title"]') || document.querySelector('meta[name="twitter:title"]');
    if (metaTitle) {
      const content = metaTitle.getAttribute('content');
      if (content) return content.split(' - ')[0];
    }

    if (document.title && document.title.includes(' - LeetCode')) return document.title.split(' - ')[0];
    return "";
  },

  extractCode(): string {
    const monacoLines = document.querySelectorAll('.view-line');
    if (monacoLines.length > 0) return Array.from(monacoLines).map(line => (line as HTMLElement).innerText).join('\n');

    const textArea = document.querySelector('textarea.monaco-mouse-cursor-text');
    if (textArea && (textArea as HTMLTextAreaElement).value.trim()) return (textArea as HTMLTextAreaElement).value;

    const editor = document.querySelector('.monaco-editor');
    if (editor) {
      const text = (editor as HTMLElement).innerText;
      if (text.trim()) return text;
    }
    return "";
  },

  extractLanguage(): string {
    const selectors = ['button.rounded-lg.bg-fill-3', '.ant-select-selection-item', '[data-cy="lang-select"]'];
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent?.trim()) return el.textContent.trim();
    }
    return "unknown";
  },

  getProblemData(): ProblemData {
    return {
      title: this.extractTitle(),
      description: this.extractDescription(),
      code: this.extractCode(),
      language: this.extractLanguage()
    };
  }
};

/**
 * INITIALIZATION
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectOverlay);
} else {
  injectOverlay();
}

chrome.runtime.onMessage.addListener((request: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
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
