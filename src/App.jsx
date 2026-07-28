import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import ChatMessage from './components/ChatMessage.jsx';
import ChatInput from './components/ChatInput.jsx';
import SettingsModal from './components/SettingsModal.jsx';

import { storageService, defaultSettings, defaultPersonas } from './services/storageService.js';
import { aiService } from './services/aiService.js';

import './styles/variables.css';
import './styles/index.css';
import './styles/components.css';

export default function App() {
  // Ultra-robust fail-safe state initialization
  const [sessions, setSessions] = useState(() => {
    try {
      const res = storageService.getSessions();
      return Array.isArray(res) ? res : [];
    } catch (e) {
      return [];
    }
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    try {
      return storageService.getActiveSessionId() || null;
    } catch (e) {
      return null;
    }
  });

  const [settings, setSettings] = useState(() => {
    try {
      const res = storageService.getSettings();
      return res && typeof res === 'object' ? res : defaultSettings;
    } catch (e) {
      return defaultSettings;
    }
  });

  const [personas, setPersonas] = useState(() => {
    try {
      const res = storageService.getPersonas();
      return Array.isArray(res) && res.length > 0 ? res : defaultPersonas;
    } catch (e) {
      return defaultPersonas;
    }
  });

  const [theme, setTheme] = useState(() => {
    try {
      return storageService.getTheme() || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  // Default sidebar open on desktop screens, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      return typeof window !== 'undefined' && window.innerWidth >= 768;
    } catch (e) {
      return true;
    }
  });
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const chatEndRef = useRef(null);
  const stopGenerationRef = useRef(false);

  // Apply Theme Attribute to DOM
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      storageService.saveTheme(theme);
    } catch (e) {
      // Ignore
    }
  }, [theme]);

  // Sync sessions with storage
  useEffect(() => {
    storageService.saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    storageService.setActiveSessionId(activeSessionId);
  }, [activeSessionId]);

  // Ensure active session exists safely
  const sessionList = Array.isArray(sessions) ? sessions : [];
  const activeSession = sessionList.find(s => s && s.id === activeSessionId) || null;
  const messages = (activeSession && Array.isArray(activeSession.messages)) ? activeSession.messages : [];

  // Scroll to bottom when messages update
  useEffect(() => {
    try {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      // Ignore
    }
  }, [messages, isGenerating]);

  // Handle New Chat Creation
  const handleNewChat = () => {
    const newSession = {
      id: `chat-${Date.now()}`,
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      messages: []
    };
    setSessions(prev => [newSession, ...(Array.isArray(prev) ? prev : [])]);
    setActiveSessionId(newSession.id);
    if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false);
  };

  // Handle Select Session
  const handleSelectSession = (id) => {
    setActiveSessionId(id);
    if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false);
  };

  // Handle Delete Session
  const handleDeleteSession = (id) => {
    setSessions(prev => {
      const list = Array.isArray(prev) ? prev : [];
      const updated = list.filter(s => s && s.id !== id);
      if (activeSessionId === id) {
        setActiveSessionId(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
  };

  // Handle Rename Session
  const handleRenameSession = (id, newTitle) => {
    setSessions(prev => {
      const list = Array.isArray(prev) ? prev : [];
      return list.map(s => s && s.id === id ? { ...s, title: newTitle } : s);
    });
  };

  // Toggle Theme
  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Save Settings
  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
  };

  // Save Personas
  const handleSavePersonas = (newPersonas) => {
    setPersonas(newPersonas);
    storageService.savePersonas(newPersonas);
  };

  // Handle Send Message
  const handleSendMessage = async (text) => {
    if (!text || !text.trim() || isGenerating) return;

    let currentSessionId = activeSessionId;
    const sessionArr = Array.isArray(sessions) ? sessions : [];
    let targetSession = sessionArr.find(s => s && s.id === currentSessionId);

    // Create session if none active
    if (!targetSession) {
      const newSession = {
        id: `chat-${Date.now()}`,
        title: text.length > 28 ? text.substring(0, 28) + '...' : text,
        createdAt: new Date().toISOString(),
        messages: []
      };
      currentSessionId = newSession.id;
      setSessions(prev => [newSession, ...(Array.isArray(prev) ? prev : [])]);
      setActiveSessionId(newSession.id);
    } else if (!targetSession.messages || targetSession.messages.length === 0) {
      // Set session title from first prompt
      handleRenameSession(currentSessionId, text.length > 28 ? text.substring(0, 28) + '...' : text);
    }

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    // Append user message
    setSessions(prev => (Array.isArray(prev) ? prev : []).map(s => {
      if (s && s.id === currentSessionId) {
        const existing = Array.isArray(s.messages) ? s.messages : [];
        return { ...s, messages: [...existing, userMessage] };
      }
      return s;
    }));

    setInput('');
    setIsGenerating(true);
    stopGenerationRef.current = false;

    // Create AI Placeholder Message
    const aiMessageId = `msg-ai-${Date.now()}`;
    const aiMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      timestamp: new Date().toISOString()
    };

    setSessions(prev => (Array.isArray(prev) ? prev : []).map(s => {
      if (s && s.id === currentSessionId) {
        const existing = Array.isArray(s.messages) ? s.messages : [];
        return { ...s, messages: [...existing, aiMessage] };
      }
      return s;
    }));

    // Stream AI Response
    try {
      const stream = aiService.generateStreamingResponse(text, messages, settings);

      for await (const chunkText of stream) {
        if (stopGenerationRef.current) break;

        setSessions(prev => (Array.isArray(prev) ? prev : []).map(s => {
          if (s && s.id === currentSessionId) {
            const msgs = Array.isArray(s.messages) ? s.messages : [];
            const updatedMsgs = msgs.map(m => {
              if (m && m.id === aiMessageId) {
                return { ...m, content: chunkText };
              }
              return m;
            });
            return { ...s, messages: updatedMsgs };
          }
          return s;
        }));
      }
    } catch (e) {
      console.error('Error generating AI response:', e);
    } finally {
      // Finalize Streaming status
      setSessions(prev => (Array.isArray(prev) ? prev : []).map(s => {
        if (s && s.id === currentSessionId) {
          const msgs = Array.isArray(s.messages) ? s.messages : [];
          const updatedMsgs = msgs.map(m => {
            if (m && m.id === aiMessageId) {
              return { ...m, isStreaming: false };
            }
            return m;
          });
          return { ...s, messages: updatedMsgs };
        }
        return s;
      }));
      setIsGenerating(false);
    }
  };

  // Stop generation
  const handleStopGeneration = () => {
    stopGenerationRef.current = true;
    setIsGenerating(false);
  };

  // Clear messages in current session
  const handleClearMessages = () => {
    if (!activeSessionId) return;
    setSessions(prev => (Array.isArray(prev) ? prev : []).map(s => s && s.id === activeSessionId ? { ...s, messages: [] } : s));
  };

  // Export Chat
  const handleExportChat = () => {
    if (!messages || messages.length === 0) return;
    const chatTitle = activeSession?.title || 'Chat';
    let mdContent = `# ${chatTitle}\n\n`;
    messages.forEach(m => {
      if (m) {
        const sender = m.role === 'user' ? 'User' : 'Gratzis ChatBot';
        mdContent += `### **${sender}**:\n${m.content || ''}\n\n---\n\n`;
      }
    });

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chatTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_transcript.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-container">
      {/* Main Chat Workspace (Left) */}
      <main className="main-content">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onExportChat={handleExportChat}
          onClearMessages={handleClearMessages}
          onOpenSettings={() => setSettingsOpen(true)}
          messageCount={messages ? messages.length : 0}
          conversationTitle={activeSession?.title}
        />

        <div className="chat-scroll-area">
          {messages.length === 0 ? (
            <WelcomeScreen onSelectPrompt={(p) => handleSendMessage(p)} />
          ) : (
            <div className="messages-wrapper">
              {messages.map((msg, idx) => (
                msg ? (
                  <ChatMessage
                    key={msg.id || idx}
                    message={msg}
                    isLast={idx === messages.length - 1}
                    onRegenerate={() => {
                      const lastUserMsg = [...messages].reverse().find(m => m && m.role === 'user');
                      if (lastUserMsg) handleSendMessage(lastUserMsg.content);
                    }}
                  />
                ) : null
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Controls */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
          onStopGeneration={handleStopGeneration}
          currentModel={settings ? settings.model : 'gemini-1.5-flash'}
          onSelectModel={(m) => handleSaveSettings({ ...(settings || defaultSettings), model: m })}
        />
      </main>

      {/* Sidebar Navigation (Right) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        personas={personas}
        sessions={sessions}
        onSaveSettings={handleSaveSettings}
        onSavePersonas={handleSavePersonas}
      />
    </div>
  );
}
