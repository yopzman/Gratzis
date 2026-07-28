// Storage service - Sessions use sessionStorage (auto-cleared when tab closes)

const STORAGE_KEYS = {
  SESSIONS: 'gratzis_ai_chat_sessions_temp',
  ACTIVE_SESSION: 'gratzis_ai_active_session_temp',
  SETTINGS: 'gratzis_ai_settings',
  PERSONAS: 'gratzis_ai_personas',
  THEME: 'gratzis_ai_theme',
};

// Clean up any old chat history stored in localStorage to prevent local retention
try {
  localStorage.removeItem('gratzis_ai_chat_sessions');
  localStorage.removeItem('gratzis_ai_active_session');
} catch (e) {
  // Ignore
}

export const defaultPersonas = [
  {
    id: 'general',
    name: 'General Assistant',
    role: 'General Assistant',
    description: 'Versatile assistant for general questions, summaries, and discussions.',
    systemPrompt: 'You are a smart, polite, and extremely helpful AI assistant. Provide clear, structured, and accurate responses.'
  },
  {
    id: 'coder',
    name: 'Software Engineer',
    role: 'Developer Agent',
    description: 'Expert in writing clean code, debugging, and software architecture.',
    systemPrompt: 'You are a senior software engineering expert. Focus on clean code, type safety, modularity, best practices, and clear algorithmic explanations.'
  },
  {
    id: 'writer',
    name: 'Creative Copywriter',
    role: 'Creative Writer',
    description: 'Marketing content writing, professional email drafts, and articles.',
    systemPrompt: 'You are a creative writing expert and professional copywriter. Create persuasive, polite, and engaging articles, emails, and marketing copy.'
  },
  {
    id: 'business',
    name: 'Business Consultant',
    role: 'Business Strategist',
    description: 'Startup ideation, Go-To-Market strategies, and MVP validation.',
    systemPrompt: 'You are a startup business strategy consultant. Provide actionable advice on MVP analysis, business models, product differentiation, and market research.'
  }
];

export const defaultSettings = {
  model: 'gemini-1.5-flash',
  activePersonaId: 'general',
  systemPrompt: defaultPersonas[0].systemPrompt,
  temperature: 0.7,
  apiKey: '',
  soundEnabled: true,
};

export const storageService = {
  // Get chat sessions from sessionStorage (Wiped out automatically when browser tab closes)
  getSessions: () => {
    try {
      const data = sessionStorage.getItem(STORAGE_KEYS.SESSIONS);
      const parsed = data ? JSON.parse(data) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to load chat sessions:', e);
      return [];
    }
  },

  // Save chat sessions in sessionStorage
  saveSessions: (sessions) => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(Array.isArray(sessions) ? sessions : []));
    } catch (e) {
      console.error('Failed to save chat sessions:', e);
    }
  },

  // Active Session ID (sessionStorage)
  getActiveSessionId: () => {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION) || null;
    } catch (e) {
      return null;
    }
  },

  setActiveSessionId: (id) => {
    try {
      if (id) {
        sessionStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, id);
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
      }
    } catch (e) {
      // Ignore
    }
  },

  // Personas Management
  getPersonas: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PERSONAS);
      const parsed = data ? JSON.parse(data) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultPersonas;
    } catch (e) {
      return defaultPersonas;
    }
  },

  savePersonas: (personas) => {
    try {
      localStorage.setItem(STORAGE_KEYS.PERSONAS, JSON.stringify(Array.isArray(personas) ? personas : defaultPersonas));
    } catch (e) {
      console.error('Failed to save personas:', e);
    }
  },

  // Settings
  getSettings: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const parsed = data ? JSON.parse(data) : null;
      return parsed && typeof parsed === 'object' ? { ...defaultSettings, ...parsed } : defaultSettings;
    } catch (e) {
      return defaultSettings;
    }
  },

  saveSettings: (settings) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings || defaultSettings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  // Theme
  getTheme: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
    } catch (e) {
      return 'dark';
    }
  },

  saveTheme: (theme) => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      // Ignore
    }
  }
};
