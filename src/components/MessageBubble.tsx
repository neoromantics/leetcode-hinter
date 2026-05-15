import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Hint } from '../types';

interface MessageBubbleProps {
  hint: Hint;
}

export function MessageBubble({ hint }: MessageBubbleProps) {
  const isAssistant = hint.role === 'assistant';

  return (
    <div 
      className={`p-4 rounded-2xl shadow-sm border ${
        isAssistant 
          ? 'bg-white border-neutral-100 text-neutral-800 self-start mr-6' 
          : 'bg-brand text-white border-orange-400 self-end ml-6 text-base italic'
      } max-w-full break-words`}
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
            // Ensure links open in a new tab
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
          {hint.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
