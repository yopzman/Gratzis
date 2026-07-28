import React, { useState } from 'react';
import { 
  X, 
  Sliders, 
  Key, 
  UserCheck, 
  Plus, 
  Trash2, 
  Sparkles, 
  Bot,
  Check
} from 'lucide-react';


export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  personas,
  sessions,
  onSaveSettings,
  onSavePersonas
}) {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'personas'
  const [localSettings, setLocalSettings] = useState(settings || {});
  const [localPersonas, setLocalPersonas] = useState(Array.isArray(personas) ? personas : []);

  // New Persona Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPersona, setNewPersona] = useState({
    name: '',
    role: '',
    description: '',
    systemPrompt: ''
  });

  if (!isOpen) return null;

  const handleChangeSetting = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSelectPersona = (persona) => {
    setLocalSettings(prev => ({
      ...prev,
      activePersonaId: persona.id,
      systemPrompt: persona.systemPrompt
    }));
  };

  const handleAddPersona = (e) => {
    e.preventDefault();
    if (!newPersona.name.trim() || !newPersona.systemPrompt.trim()) return;

    const created = {
      id: `persona-${Date.now()}`,
      name: newPersona.name.trim(),
      role: newPersona.role.trim() || 'Custom Agent',
      description: newPersona.description.trim() || 'Custom agent persona created by user.',
      systemPrompt: newPersona.systemPrompt.trim(),
      isCustom: true
    };

    const updatedPersonas = [...localPersonas, created];
    setLocalPersonas(updatedPersonas);
    onSavePersonas(updatedPersonas);

    // Auto select created persona
    handleSelectPersona(created);

    // Reset form
    setNewPersona({ name: '', role: '', description: '', systemPrompt: '' });
    setShowAddForm(false);
  };

  const handleDeletePersona = (id, e) => {
    e.stopPropagation();
    const updated = localPersonas.filter(p => p.id !== id);
    setLocalPersonas(updated);
    onSavePersonas(updated);

    if (localSettings.activePersonaId === id && updated.length > 0) {
      handleSelectPersona(updated[0]);
    }
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sliders size={20} style={{ color: 'var(--accent-primary)' }} />
            <span>Settings</span>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-app)',
          padding: '0 20px',
          overflowX: 'auto'
        }}>
          <button
            style={{
              padding: '12px 14px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: activeTab === 'general' ? 'var(--accent-primary)' : 'var(--text-tertiary)',
              borderBottom: activeTab === 'general' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('general')}
          >
            General & Parameters
          </button>
          <button
            style={{
              padding: '12px 14px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: activeTab === 'personas' ? 'var(--accent-primary)' : 'var(--text-tertiary)',
              borderBottom: activeTab === 'personas' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
            onClick={() => setActiveTab('personas')}
          >
            <UserCheck size={15} />
            <span>Personas ({localPersonas.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {activeTab === 'general' && (
            <>
              {/* System Prompt */}
              <div className="setting-group">
                <div className="setting-label">
                  <span>System Instructions (System Prompt)</span>
                </div>
                <div className="setting-desc">Instruct how the AI should respond to match your preferred persona or style.</div>
                <textarea
                  className="setting-input"
                  rows={3}
                  style={{ resize: 'vertical' }}
                  value={localSettings.systemPrompt}
                  onChange={(e) => handleChangeSetting('systemPrompt', e.target.value)}
                />
              </div>

              {/* Temperature Slider */}
              <div className="setting-group">
                <div className="setting-label">
                  <span>Creativity (Temperature): {localSettings.temperature}</span>
                </div>
                <div className="setting-desc">Higher values make responses more creative, lower values make them more focused.</div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={localSettings.temperature}
                  onChange={(e) => handleChangeSetting('temperature', parseFloat(e.target.value))}
                  style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
              </div>

              {/* API Key Optional */}
              <div className="setting-group">
                <div className="setting-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Key size={14} />
                  <span>Custom API Key (Optional)</span>
                </div>
                <div className="setting-desc">Enter your Google Gemini or OpenAI API Key for direct API connectivity.</div>
                <input
                  type="password"
                  className="setting-input"
                  placeholder="AIzaSy... or sk-..."
                  value={localSettings.apiKey || ''}
                  onChange={(e) => handleChangeSetting('apiKey', e.target.value)}
                />
              </div>

              {/* Sound Toggle */}
              <div className="setting-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="setting-label">Response Sound Effects</div>
                  <div className="setting-desc">Play a subtle tone when the AI finishes typing.</div>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.soundEnabled}
                  onChange={(e) => handleChangeSetting('soundEnabled', e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
              </div>
            </>
          )}

          {activeTab === 'personas' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Select or Create Custom Agent</div>
                  <div className="setting-desc">The selected AI persona will automatically configure the AI characteristics & system prompt.</div>
                </div>
                <button
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  <Plus size={14} />
                  <span>Add Persona</span>
                </button>
              </div>

              {/* Add Persona Form */}
              {showAddForm && (
                <form 
                  onSubmit={handleAddPersona}
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--accent-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={16} />
                    <span>New Custom Agent Form</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Agent Name *</label>
                      <input
                        type="text"
                        className="setting-input"
                        placeholder="e.g., English Tutor"
                        required
                        value={newPersona.name}
                        onChange={(e) => setNewPersona({ ...newPersona, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Role / Category</label>
                      <input
                        type="text"
                        className="setting-input"
                        placeholder="e.g., Language Coach"
                        value={newPersona.role}
                        onChange={(e) => setNewPersona({ ...newPersona, role: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Short Description</label>
                    <input
                      type="text"
                      className="setting-input"
                      placeholder="e.g., Teaches English grammar and vocabulary."
                      value={newPersona.description}
                      onChange={(e) => setNewPersona({ ...newPersona, description: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>System Instructions *</label>
                    <textarea
                      className="setting-input"
                      rows={3}
                      placeholder="e.g., You are a friendly English instructor. Always correct grammar politely..."
                      required
                      value={newPersona.systemPrompt}
                      onChange={(e) => setNewPersona({ ...newPersona, systemPrompt: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                    <button type="button" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setShowAddForm(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                      Save Agent Persona
                    </button>
                  </div>
                </form>
              )}

              {/* Persona List Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {localPersonas.map((persona) => {
                  const isSelected = localSettings.activePersonaId === persona.id;

                  return (
                    <div
                      key={persona.id}
                      style={{
                        padding: 14,
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                        backgroundColor: isSelected ? 'var(--accent-light)' : 'var(--bg-app)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        transition: 'all var(--transition-fast)'
                      }}
                      onClick={() => handleSelectPersona(persona)}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-surface-active)',
                          color: isSelected ? '#ffffff' : 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Bot size={20} />
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? 'var(--accent-primary-active)' : 'var(--text-primary)' }}>
                              {persona.name}
                            </span>
                            <span style={{
                              fontSize: '0.7rem',
                              padding: '1px 6px',
                              borderRadius: 4,
                              backgroundColor: 'var(--bg-surface)',
                              color: 'var(--text-tertiary)',
                              border: '1px solid var(--border-subtle)'
                            }}>
                              {persona.role}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                            {persona.description}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {isSelected && (
                          <div style={{
                            backgroundColor: 'var(--accent-primary)',
                            color: '#ffffff',
                            borderRadius: '50%',
                            padding: 3,
                            display: 'flex'
                          }}>
                            <Check size={14} />
                          </div>
                        )}

                        {persona.isCustom && (
                          <button
                            className="icon-btn-xs"
                            title="Delete Custom Agent"
                            onClick={(e) => handleDeletePersona(persona.id, e)}
                          >
                            <Trash2 size={15} style={{ color: '#ef4444' }} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
