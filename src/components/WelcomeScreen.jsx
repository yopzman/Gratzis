import React from 'react';
import appLogo from '../../icon.png';
import { 
  Bot, 
  Code, 
  FileText, 
  Lightbulb, 
  Terminal
} from 'lucide-react';

export default function WelcomeScreen({ onSelectPrompt }) {
  const suggestions = [
    {
      icon: <Code size={20} className="prompt-card-icon" />,
      title: "Explain Async/Await",
      desc: "Learn asynchronous programming concepts in JavaScript with examples.",
      prompt: "Help me understand async/await concepts in JavaScript with try...catch error handling examples."
    },
    {
      icon: <FileText size={20} className="prompt-card-icon" />,
      title: "Draft Professional Email",
      desc: "Create a polite project collaboration or meeting follow-up email.",
      prompt: "Write a professional email template for a new project collaboration request."
    },
    {
      icon: <Terminal size={20} className="prompt-card-icon" />,
      title: "Review Python Code",
      desc: "Get best-practice advice and Python data structure optimization.",
      prompt: "Help me create a clean Python class using type hints and data classes."
    },
    {
      icon: <Lightbulb size={20} className="prompt-card-icon" />,
      title: "Startup Business Strategy",
      desc: "Discuss the Lean Startup framework and MVP validation.",
      prompt: "How can I validate a new business idea quickly and efficiently?"
    }
  ];

  return (
    <div className="welcome-container animate-fade-in">
      <div className="welcome-icon-box" style={{ width: 64, height: 64, borderRadius: 16, overflow: 'hidden', padding: 0 }}>
        <img src={appLogo} alt="Gratzis Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <h1 className="welcome-title">Hello, how can I help you today?</h1>
      <p className="welcome-subtitle">
        Your AI assistant is ready to help with coding, document analysis, writing drafts, and creative ideas.
      </p>

      <div className="prompt-suggestions">
        {suggestions.map((item, index) => (
          <div
            key={index}
            className="prompt-card"
            onClick={() => onSelectPrompt(item.prompt)}
          >
            <div>{item.icon}</div>
            <div className="prompt-card-title">{item.title}</div>
            <div className="prompt-card-desc">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
