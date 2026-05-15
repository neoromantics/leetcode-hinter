import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Hint } from '../types';

interface MessageBubbleProps {
  hint: Hint;
  onSuggestionClick?: (suggestion: string) => void;
  isLast?: boolean;
}

export function MessageBubble({ hint, onSuggestionClick, isLast }: MessageBubbleProps) {
  const isAssistant = hint.role === 'assistant';

  // Parse suggestions if present (Assistant messages only)
  let mainContent = hint.content;
  let suggestions: string[] = [];

  if (isAssistant && hint.content.includes('### Suggestions')) {
    const parts = hint.content.split('### Suggestions');
    mainContent = parts[0].trim();
    const suggestionBlock = parts[1];
    
    // Extract list items starting with - or * or 1.
    suggestions = suggestionBlock
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line))
      .map(line => line.replace(/^[-*\d.]+\s*/, '').trim())
      .filter(text => text.length > 0);
  }

  return (
    <div className="flex flex-col space-y-3">
      <div 
        className={`p-4 rounded-2xl shadow-sm border ${
          isAssistant 
            ? 'bg-white border-neutral-100 text-neutral-800 self-start mr-6' 
            : 'bg-brand text-white border-orange-400 self-end ml-6 text-base italic'
        } max-w-full break-words animate-in fade-in slide-in-from-bottom-1 duration-300`}
      >
        <div className={`prose ${isAssistant ? 'prose-base' : 'prose-invert prose-base'} max-w-none prose-neutral`}>
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <div className="rounded-lg overflow-x-auto my-2 border border-white/10 shadow-lg max-w-full">
                    <SyntaxHighlighter
                      {...props}
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      wrapLines={true}
                      wrapLongLines={true}
                      customStyle={{ margin: 0, padding: '1rem', fontSize: '0.85rem' }}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code 
                    className={`${className} px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-900 font-mono text-sm break-all`} 
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              a: ({ children, href }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
                  {children}
                </a>
              ),
              ul: ({ children }) => <ul className="list-disc pl-4 my-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 my-2">{children}</ol>,
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            }}
          >
            {mainContent}
          </ReactMarkdown>
        </div>
      </div>

      {/* Render suggestions as clickable chips if this is the last message */}
      {isLast && isAssistant && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 px-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSuggestionClick?.(s)}
              className="px-4 py-2.5 bg-white border border-neutral-200 text-neutral-600 rounded-2xl text-sm font-semibold hover:border-brand hover:text-brand hover:bg-orange-50 transition-all shadow-sm active:scale-95 text-left"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
