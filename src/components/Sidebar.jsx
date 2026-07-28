import React, { useState } from 'react';
import appLogo from '../../icon.png';
import { 
  Bot, 
  Plus, 
  MessageSquare, 
  Search, 
  Trash2, 
  Edit2, 
  Check, 
  Sun, 
  Moon, 
  Settings, 
  X
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  theme,
  onToggleTheme,
  onOpenSettings
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const sessionList = Array.isArray(sessions) ? sessions : [];
  const filteredSessions = sessionList.filter(s => 
    (s && s.title ? s.title : 'New Conversation').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  const startRenaming = (e, session) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditingTitle(session.title || 'New Conversation');
  };

  const saveRenaming = (e, id) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      onRenameSession(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="app-brand">
            <div className="welcome-icon-box" style={{ width: 32, height: 32, marginBottom: 0, borderRadius: 8, overflow: 'hidden', padding: 0 }}>
              <img src={appLogo} alt="Gratzis Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span>Gratzis ChatBot</span>
          </div>
        </div>

        {/* New Chat Button */}
        <button className="new-chat-btn" onClick={onNewChat}>
          <Plus size={18} />
          <span>New Chat</span>
        </button>

        {/* Search Input */}
        <div className="sidebar-search">
          <div className="search-input-wrapper">
            <Search size={14} className="text-tertiary" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="icon-btn-xs" onClick={() => setSearchQuery('')}>
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Chat History List */}
        <div className="history-list">
          <div className="history-section-title">Chat History</div>

          {filteredSessions.length === 0 ? (
            <div style={{ padding: '16px 8px', fontSize: '0.82rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
              {searchQuery ? 'No matching history found.' : 'No chat history yet.'}
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const isEditing = editingId === session.id;

              return (
                <div
                  key={session.id}
                  className={`history-item ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectSession(session.id)}
                >
                  {isEditing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%' }} onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        className="setting-input"
                        style={{ padding: '2px 6px', fontSize: '0.85rem' }}
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRenaming(e, session.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                      <button className="icon-btn-xs" onClick={(e) => saveRenaming(e, session.id)}>
                        <Check size={14} style={{ color: 'var(--accent-primary)' }} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="history-item-title">
                        <MessageSquare size={15} style={{ opacity: isActive ? 1 : 0.6, flexShrink: 0 }} />
                        <span>{session.title || 'New Conversation'}</span>
                      </div>

                      <div className="history-item-actions">
                        <button 
                          className="icon-btn-xs" 
                          title="Rename Title" 
                          onClick={(e) => startRenaming(e, session)}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          className="icon-btn-xs" 
                          title="Delete" 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button 
                className="icon-btn" 
                title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'} 
                onClick={onToggleTheme}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>

            <button 
              className="icon-btn" 
              title="Settings" 
              onClick={onOpenSettings}
            >
              <Settings size={18} />
            </button>
          </div>

          <div className="sidebar-copyright">
            © {new Date().getFullYear()} Gratzis ChatBot by{' '}
            <a 
              href="https://github.com/yopzman" 
              target="_blank" 
              rel="noopener noreferrer"
              className="copyright-link"
            >
              yoviekobba
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
