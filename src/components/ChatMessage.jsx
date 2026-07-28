import React, { useState } from 'react';
import { 
  Bot, 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  RefreshCw 
} from 'lucide-react';

// Custom Markdown Parser Function for Rich Output
function renderMarkdown(content) {
  if (!content) return null;

  // Split by code blocks ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_+-]*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Push preceding text before code block
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        value: content.substring(lastIndex, match.index)
      });
    }

    parts.push({
      type: 'code',
      language: match[1] || 'plaintext',
      value: match[2].trim()
    });

    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      value: content.substring(lastIndex)
    });
  }

  return (
    <div className="markdown-content">
      {parts.map((part, idx) => {
        if (part.type === 'code') {
          return <CodeBlock key={idx} language={part.language} code={part.value} />;
        }

        // Format formatted text (bold, headers, lists, quotes, inline code)
        return <FormattedTextBlock key={idx} text={part.value} />;
      })}
    </div>
  );
}

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-header">
        <span>{language}</span>
        <button className="code-header-copy" onClick={handleCopy}>
          {copied ? <Check size={13} style={{ color: 'var(--accent-primary)' }} /> : <Copy size={13} />}
          <span>{copied ? 'Copied!' : 'Copy Code'}</span>
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function FormattedTextBlock({ text }) {
  const lines = text.split('\n');

  return (
    <div>
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} style={{ height: 8 }} />;

        // Headings
        if (line.startsWith('### ')) {
          return <h3 key={idx} style={{ fontSize: '1.05rem', fontWeight: 700, margin: '12px 0 6px 0', color: 'var(--text-primary)' }}>{parseInline(line.replace('### ', ''))}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={idx} style={{ fontSize: '1.2rem', fontWeight: 700, margin: '14px 0 8px 0', color: 'var(--text-primary)' }}>{parseInline(line.replace('## ', ''))}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={idx} style={{ fontSize: '1.35rem', fontWeight: 700, margin: '16px 0 8px 0', color: 'var(--text-primary)' }}>{parseInline(line.replace('# ', ''))}</h1>;
        }

        // Blockquotes
        if (line.startsWith('> ')) {
          return (
            <blockquote 
              key={idx} 
              style={{
                borderLeft: '3px solid var(--accent-primary)',
                paddingLeft: 12,
                margin: '8px 0',
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
                backgroundColor: 'var(--bg-app)',
                paddingTop: 4,
                paddingBottom: 4,
                borderRadius: '0 var(--radius-xs) var(--radius-xs) 0'
              }}
            >
              {parseInline(line.replace('> ', ''))}
            </blockquote>
          );
        }

        // Unordered List
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <li key={idx} style={{ marginLeft: 20, marginBottom: 4 }}>
              {parseInline(line.substring(2))}
            </li>
          );
        }

        // Numbered List
        const numMatch = line.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <li key={idx} style={{ marginLeft: 20, marginBottom: 4 }} value={numMatch[1]}>
              {parseInline(numMatch[2])}
            </li>
          );
        }

        return <p key={idx}>{parseInline(line)}</p>;
      })}
    </div>
  );
}

// Inline formatting (bold, inline code)
function parseInline(str) {
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  const parts = str.split(regex);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={idx} className="inline-code">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

export default function ChatMessage({ message, isLast, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const isUser = message.role === 'user';

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`message-row ${isUser ? 'user' : 'ai'} animate-fade-in`}>
      <div className={`msg-avatar ${isUser ? 'user' : 'ai'}`}>
        {isUser ? 'Y' : <Bot size={20} />}
      </div>

      <div className="msg-bubble-container">
        <div className={`msg-bubble ${isUser ? 'user' : 'ai'}`}>
          {isUser ? (
            <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
          ) : (
            <>
              {renderMarkdown(message.content)}
              {message.isStreaming && (
                <div className="typing-indicator" style={{ marginTop: 8 }}>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Message Actions Bar */}
        {!message.isStreaming && (
          <div className="msg-actions">
            <button className="msg-action-btn" onClick={handleCopyMessage} title="Copy message">
              {copied ? <Check size={13} style={{ color: 'var(--accent-primary)' }} /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : ''}</span>
            </button>

            {!isUser && (
              <>
                <button 
                  className="msg-action-btn" 
                  onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                  style={{ color: feedback === 'up' ? 'var(--accent-primary)' : 'inherit' }}
                  title="Helpful"
                >
                  <ThumbsUp size={13} />
                </button>
                <button 
                  className="msg-action-btn" 
                  onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                  style={{ color: feedback === 'down' ? '#ef4444' : 'inherit' }}
                  title="Not helpful"
                >
                  <ThumbsDown size={13} />
                </button>
                {isLast && onRegenerate && (
                  <button className="msg-action-btn" onClick={onRegenerate} title="Regenerate response">
                    <RefreshCw size={13} />
                    <span>Regenerate</span>
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
