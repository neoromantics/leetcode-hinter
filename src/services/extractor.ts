import type { ProblemData } from '../types';

export const Extractor = {
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
