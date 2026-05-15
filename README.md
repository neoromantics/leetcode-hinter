# LeetCode Hinter

A Chrome extension that provides contextual, progressive hints for LeetCode problems to help you learn and prepare for interviews.

## Features
- **Elite Multi-Provider Support:** Choose between **OpenAI**, **Anthropic**, **DeepSeek**, and **Google Gemini**.
- **Reasoning Models:** Access high-logic models like `o3-mini`, `o1-mini`, and `deepseek-reasoner` for complex algorithmic guidance.
- **Top Coding Models:** Support for `claude-3-5-sonnet` (the gold standard for coding) and `gemini-2.0-flash-thinking`.
- **Progressive Hinting:** Guided hints instead of immediate solutions.
- **BYOK:** Use your own API keys for maximum privacy and low cost.
- **Modern UI:** Clean, fast interface built with React and Tailwind CSS.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [OpenAI API Key](https://platform.openai.com/api-keys)

### Installation for Development
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
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable "Developer mode" (top right toggle).
3. Click "Load unpacked".
4. Select the `dist` folder in the project directory.

## Usage
1. Open any LeetCode problem (e.g., `leetcode.com/problems/two-sum/`).
2. Click the LeetCode Hinter icon in your extensions menu (it's recommended to pin it).
3. Go to Settings and enter your OpenAI API key.
4. Go back to Hints and click "GET HINT" whenever you're stuck.

## Architecture
- **Frontend:** React 18, Tailwind CSS 4, Vite
- **Extension Tooling:** CRXJS Vite Plugin
- **Messaging:** Content script for DOM extraction, Background worker for lifecycle, Popup UI for interaction.

## Future Plans
- Support for more LLM providers (Anthropic, Gemini).
- Managed "Premium" backend for users without API keys.
- History of hints per problem.
- One-click solution analysis.

## Affordable Token Providers
If you want to save money while using elite models, consider these providers:
- **OpenRouter:** An aggregator that lets you pay-as-you-go for almost any model (Claude, GPT, DeepSeek). It often has **free models** available (like Gemini 2.0 Flash Thinking).
- **Together AI:** Provides extremely fast and low-cost access to open-weights models like DeepSeek-R1 and Llama 3.
- **DeepSeek API:** Directly using the DeepSeek API is currently one of the most cost-effective ways to get high-tier reasoning for coding.
- **Google AI Studio:** Offers a very generous **free tier** for Gemini models, which is excellent for LeetCode hints.

## Using Local Ollama
For complete privacy and zero cost, you can use LeetCode Hinter with a local [Ollama](https://ollama.com/) instance:

1.  **Install Ollama:** Download and install from [ollama.com](https://ollama.com/).
2.  **Download a Model:** Open your terminal and pull a coding-optimized model:
    ```bash
    ollama pull deepseek-coder-v2
    ```
    *Alternatively, use `llama3.3` or `qwen2.5-coder`.*
3.  **Start Ollama:** Ensure the Ollama server is running (it usually starts automatically).
    *   **Crucial Note:** If you see a **403 error**, you must allow the extension origin in Ollama. Set the environment variable:
        ```bash
        # macOS/Linux
        OLLAMA_ORIGINS="*" ollama serve
        ```
        *(Or set `OLLAMA_ORIGINS` to `chrome-extension://*` in your system environment variables and restart Ollama).*
4.  **Configure Extension:**
    *   Open LeetCode Hinter **Settings**.
    *   Select **Ollama** as the Provider.
    *   Ensure the **Model** name matches the one you pulled (e.g., `deepseek-coder-v2`).
    *   Verify the **API URL** is set to `http://localhost:11434/v1`.
5.  **Get Hints:** You can now get hints without an internet connection (to the AI provider) and for free!
