import React, { useState, useEffect } from 'react';
import { 
  PanelRight, 
  Download, 
  Trash2, 
  Settings,
  Clock
} from 'lucide-react';

export default function Header({
  sidebarOpen,
  onToggleSidebar,
  onExportChat,
  onClearMessages,
  onOpenSettings,
  messageCount,
  conversationTitle
}) {
  const [timeString, setTimeString] = useState('');

  // Live Date and Time Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false
      };
      setTimeString(now.toLocaleString('en-US', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="chat-header">
      {/* Left: Date & Time Display */}
      <div className="header-left">
        <div className="header-clock-widget" title="Current Local Date & Time">
          <Clock size={14} style={{ color: 'var(--accent-primary)' }} />
          <span>{timeString || 'Loading time...'}</span>
        </div>
      </div>

      {/* Center: Conversation Title */}
      <div className="header-center">
        <div className="header-title-text" title={conversationTitle || 'New Conversation'}>
          {conversationTitle || 'New Conversation'}
        </div>
      </div>

      {/* Right: Actions & Sidebar Toggle Button */}
      <div className="header-actions">
        {messageCount > 0 && (
          <>
            <button 
              className="btn-secondary" 
              onClick={onExportChat} 
              title="Export conversation"
            >
              <Download size={15} />
              <span>Export</span>
            </button>
            <button 
              className="btn-secondary" 
              onClick={onClearMessages} 
              title="Clear chat"
            >
              <Trash2 size={15} />
            </button>
          </>
        )}

        <button 
          className="icon-btn" 
          onClick={onOpenSettings} 
          title="Settings & Custom Agents"
        >
          <Settings size={18} />
        </button>

        {/* Sidebar Toggle Button (Now on the Right) */}
        <button 
          className="icon-btn" 
          onClick={onToggleSidebar} 
          title={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          <PanelRight size={20} />
        </button>
      </div>
    </header>
  );
}
