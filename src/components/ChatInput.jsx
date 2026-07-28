import React, { useRef, useEffect, useState } from 'react';
import { 
  Send, 
  Paperclip, 
  Square, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function ChatInput({
  input,
  setInput,
  onSendMessage,
  isGenerating,
  onStopGeneration,
  currentModel,
  onSelectModel
}) {
  const textareaRef = useRef(null);
  const modelMenuRef = useRef(null);
  const [showModelMenu, setShowModelMenu] = useState(false);

  const models = [
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', badge: 'Fast' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', badge: 'Smart' },
    { id: 'gpt-4o', name: 'GPT-4o', badge: 'Popular' },
    { id: 'claude-3-5', name: 'Claude 3.5 Sonnet', badge: 'Analytical' }
  ];

  const selectedModelObj = models.find(m => m.id === currentModel) || models[0];

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  // Click outside to close model selector menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target)) {
        setShowModelMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isGenerating) {
        onSendMessage(input);
      }
    }
  };

  return (
    <div className="chat-input-area">
      <div className="input-container" style={{ position: 'relative' }}>
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          placeholder="Type your message here... (Shift + Enter for new line)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />

        <div className="input-actions-bar">
          <div className="input-left-tools">
            {/* Embedded Model Selector in Input Box */}
            <div style={{ position: 'relative' }} ref={modelMenuRef}>
              <button 
                type="button"
                className="model-selector-pill" 
                onClick={() => setShowModelMenu(!showModelMenu)}
                title="Select AI Model"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
                <span>{selectedModelObj.name}</span>
                <ChevronDown size={12} style={{ color: 'var(--text-tertiary)' }} />
              </button>

              {/* Model Dropdown Menu */}
              {showModelMenu && (
                <div 
                  className="animate-fade-in"
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    left: 0,
                    width: 220,
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '6px',
                    zIndex: 60
                  }}
                >
                  {models.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.83rem',
                        fontWeight: currentModel === m.id ? 600 : 400,
                        color: currentModel === m.id ? 'var(--accent-primary)' : 'var(--text-primary)',
                        backgroundColor: currentModel === m.id ? 'var(--bg-surface-hover)' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                      onClick={() => {
                        onSelectModel(m.id);
                        setShowModelMenu(false);
                      }}
                    >
                      <span>{m.name}</span>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        padding: '1px 5px', 
                        borderRadius: 4, 
                        backgroundColor: 'var(--bg-app)', 
                        color: 'var(--text-tertiary)',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        {m.badge}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="icon-btn-xs" title="Attach File (Simulated)" onClick={() => alert("Document upload active on Pro version.")}>
              <Paperclip size={16} />
            </button>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {input.length > 0 ? `${input.length} characters` : ''}
            </span>
          </div>

          <div>
            {isGenerating ? (
              <button 
                className="send-btn" 
                onClick={onStopGeneration}
                style={{ backgroundColor: '#ef4444' }}
                title="Stop generating"
              >
                <Square size={16} fill="currentColor" />
              </button>
            ) : (
              <button 
                className="send-btn" 
                disabled={!input.trim()}
                onClick={() => onSendMessage(input)}
                title="Send message"
              >
                <Send size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
