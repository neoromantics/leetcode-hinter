# LeetCode Hinter

A premium Chrome extension that provides contextual, progressive hints for LeetCode problems. Designed to help you learn algorithmic patterns and prepare for technical interviews without giving away the full solution immediately.

## Key Features

- **Floating Overlay UI:** A modern, collapsible drawer that hovers over your LeetCode tab. This eliminates side-by-side page splitting.
- **Hover-to-Expand:** Move your mouse to the right edge to slide the panel open. Use the pin feature to keep it open while you code.
- **Interactive Follow-ups:** AI automatically suggests 2-3 specific follow-up questions (e.g., "What is the time complexity?") that you can click to dive deeper.
- **Real-time Streaming:** Hints appear word-by-word as they are generated for a snappy, responsive experience.
- **Elite Multi-Provider Support:**
  - **Cloud:** OpenAI (o3-mini, o1), Anthropic (Claude 3.5 Sonnet), Google Gemini 2.0, DeepSeek (R1).
  - **Aggregators:** OpenRouter, Together AI for cost-effective access.
  - **Local:** Full support for Ollama for 100% private and free hinting.
- **Robust Data Extraction:** Multi-tiered scraping logic (Data Tags, Meta Tags, and Heuristics) ensuring it works across all LeetCode UI versions and study plans.
- **Professional Formatting:** Full Markdown support with syntax highlighting for code snippets using the VS Code Dark theme.

## Getting Started

### Prerequisites
- Node.js (v18+)
- An API Key from your preferred provider (OpenAI, Anthropic, etc.) or a local Ollama instance.

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```

### Loading into Chrome
1. Open Chrome and navigate to chrome://extensions/.
2. Enable Developer mode (top right toggle).
3. Click Load unpacked.
4. Select the dist folder in the project directory.

## Usage

1. Open any LeetCode problem (e.g., Two Sum).
2. **Access the UI:**
   - **Hover:** Move your mouse to the very right edge of the screen to see the orange handle.
   - **Toggle:** Click the LeetCode Hinter icon in your extension toolbar.
3. **Setup:** Go to Settings and enter your API key or configure your local Ollama URL.
4. **Learn:** Click GET HINT whenever you are stuck. Use the suggestion chips at the bottom to explore further.
5. **Pin:** Use the Pin icon in the header to lock the drawer open while you work.

## Affordable AI Options

If you want to save money while using world-class models:
- **OpenRouter:** Pay-as-you-go aggregator. Often has free models like Gemini 2.0 Flash Thinking.
- **Google AI Studio:** Offers a generous free tier for Gemini models.
- **DeepSeek API:** Currently the most cost-effective provider for high-tier reasoning (DeepSeek-R1).
- **Ollama:** Completely free and private. Run models like deepseek-coder-v2 or gemma3 locally.

### Using Local Ollama
1. **Download a Model:** `ollama pull deepseek-coder-v2`
2. **Start Ollama:** Ensure the server is running.
   - Note: If you see a 403 error, run: `OLLAMA_ORIGINS="*" ollama serve`
3. **Configure:** Set Provider to Ollama, Model to your pulled name, and URL to http://localhost:11434/v1.

## Tech Stack
- **Frontend:** React 18, Tailwind CSS 4, Lucide Icons.
- **Build:** Vite + CRXJS Vite Plugin.
- **AI Integration:** Official SDKs for OpenAI, Anthropic, and Google Generative AI.
- **Network:** Background Proxy architecture to bypass CORS and 403 blocks.
