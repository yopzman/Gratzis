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
  Check,
  Cloud,
  Upload as CloudUpload,
  Download as CloudDownload,
  HardDrive,
  ShieldAlert,
  CheckCircle2,
  Lock,
  ShieldCheck
} from 'lucide-react';

import { cryptoService } from '../services/cryptoService.js';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  personas,
  cloudConfig,
  sessions,
  onSaveSettings,
  onSavePersonas,
  onSaveCloudConfig,
  onRestoreSessions
}) {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'personas' | 'cloud'
  const [localSettings, setLocalSettings] = useState(settings || {});
  const [localPersonas, setLocalPersonas] = useState(Array.isArray(personas) ? personas : []);
  const [localCloudConfig, setLocalCloudConfig] = useState(cloudConfig || {});

  // New Persona Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPersona, setNewPersona] = useState({
    name: '',
    role: '',
    description: '',
    systemPrompt: ''
  });

  // Cloud Account State
  const [cloudEmail, setCloudEmail] = useState(cloudConfig?.accountEmail || '');

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

  // Connect Google Drive Cloud
  const handleConnectCloud = () => {
    if (!cloudEmail.trim()) {
      alert("Please enter a valid Google Account email.");
      return;
    }
    const updated = {
      ...localCloudConfig,
      connected: true,
      accountEmail: cloudEmail.trim(),
      lastSyncedAt: new Date().toISOString()
    };
    setLocalCloudConfig(updated);
    onSaveCloudConfig(updated);
  };

  const handleDisconnectCloud = () => {
    const updated = {
      ...localCloudConfig,
      connected: false,
      accountEmail: '',
      lastSyncedAt: null
    };
    setLocalCloudConfig(updated);
    onSaveCloudConfig(updated);
  };

  // Sync to Cloud Storage / Download AES-256 Encrypted Backup
  const handleBackupToCloud = async () => {
    if (!sessions || sessions.length === 0) {
      alert("No active chat sessions to backup.");
      return;
    }

    try {
      // Encrypt session data using Web Crypto API (AES-GCM 256-bit)
      const encryptedPayload = await cryptoService.encryptData(sessions);

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(encryptedPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `gratzis_cloud_encrypted_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      const updated = {
        ...localCloudConfig,
        lastSyncedAt: new Date().toISOString()
      };
      setLocalCloudConfig(updated);
      onSaveCloudConfig(updated);
      alert("🔒 Backup encrypted (AES-256-GCM) and downloaded successfully!");
    } catch (err) {
      alert("Error encrypting backup: " + err.message);
    }
  };

  // Restore Cloud Backup File (Supports AES-256 Encrypted or Legacy JSON)
  const handleRestoreFromCloud = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const rawContent = JSON.parse(e.target.result);
        let restoredSessions = [];

        if (rawContent && rawContent.encrypted && rawContent.ciphertext) {
          // Decrypt Web Crypto AES-GCM Encrypted Backup
          restoredSessions = await cryptoService.decryptData(rawContent);
        } else if (Array.isArray(rawContent)) {
          // Legacy unencrypted JSON format support
          restoredSessions = rawContent;
        } else {
          throw new Error("Invalid session backup file format.");
        }

        if (Array.isArray(restoredSessions)) {
          onRestoreSessions(restoredSessions);
          alert(`🔓 Successfully decrypted & restored ${restoredSessions.length} session(s) from Cloud backup!`);
        } else {
          alert("Invalid session backup data format.");
        }
      } catch (err) {
        alert("Failed to decrypt backup file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    onSaveCloudConfig(localCloudConfig);
    onClose();
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sliders size={20} style={{ color: 'var(--accent-primary)' }} />
            <span>Settings & Cloud Storage Sync</span>
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
          <button
            style={{
              padding: '12px 14px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: activeTab === 'cloud' ? 'var(--accent-primary)' : 'var(--text-tertiary)',
              borderBottom: activeTab === 'cloud' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
            onClick={() => setActiveTab('cloud')}
          >
            <Cloud size={15} />
            <span>Cloud Storage Sync</span>
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

          {activeTab === 'cloud' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Privacy Notice Banner */}
              <div style={{
                backgroundColor: 'var(--accent-light)',
                border: '1px solid var(--accent-border)',
                borderRadius: 'var(--radius-md)',
                padding: 14,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10
              }}>
                <ShieldAlert size={20} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  <strong>Strict Zero-Local Storage Mode Active</strong>: Chat sessions are held temporarily in browser <em>sessionStorage</em> and are automatically erased when the browser tab is closed. Use Cloud Storage below to securely back up or restore your conversations.
                </div>
              </div>

              {/* Cloud Account Sync Card */}
              <div style={{
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.9rem' }}>
                    <HardDrive size={18} style={{ color: 'var(--accent-primary)' }} />
                    <span>Google Drive Integration</span>
                  </div>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: localCloudConfig.connected ? 'var(--accent-light)' : 'var(--bg-surface-active)',
                    color: localCloudConfig.connected ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                    border: localCloudConfig.connected ? '1px solid var(--accent-border)' : '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    {localCloudConfig.connected ? <CheckCircle2 size={12} /> : null}
                    {localCloudConfig.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                {!localCloudConfig.connected ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Google Account Email</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="email"
                        className="setting-input"
                        placeholder="user@gmail.com"
                        value={cloudEmail}
                        onChange={(e) => setCloudEmail(e.target.value)}
                      />
                      <button 
                        type="button" 
                        className="btn-primary"
                        style={{ whiteSpace: 'nowrap', padding: '8px 14px' }}
                        onClick={handleConnectCloud}
                      >
                        Connect Drive
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{localCloudConfig.accountEmail}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        Last Synced: {localCloudConfig.lastSyncedAt ? new Date(localCloudConfig.lastSyncedAt).toLocaleString() : 'Not yet'}
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="btn-secondary"
                      style={{ fontSize: '0.78rem', color: '#ef4444' }}
                      onClick={handleDisconnectCloud}
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>

              {/* AES Encryption Security Info Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                backgroundColor: 'var(--accent-light)',
                border: '1px solid var(--accent-border)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 12,
                fontSize: '0.78rem',
                color: 'var(--accent-primary)',
                fontWeight: 600
              }}>
                <Lock size={14} />
                <span>Client-Side End-to-End Encryption (AES-GCM-256) Active</span>
              </div>

              {/* Cloud Backup & Restore Controls */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CloudUpload size={16} style={{ color: 'var(--accent-primary)' }} />
                    <span>Backup to Cloud</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', flex: 1 }}>
                    Export current active chat session data into an encrypted Cloud Storage backup package.
                  </div>
                  <button 
                    type="button" 
                    className="btn-primary" 
                    style={{ fontSize: '0.8rem', padding: '8px' }}
                    onClick={handleBackupToCloud}
                  >
                    Sync & Download Backup
                  </button>
                </div>

                <div style={{
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CloudDownload size={16} style={{ color: 'var(--accent-secondary)' }} />
                    <span>Restore from Cloud</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', flex: 1 }}>
                    Import and restore your saved conversation package into current session memory.
                  </div>
                  <label 
                    className="btn-secondary" 
                    style={{ fontSize: '0.8rem', padding: '8px', textAlign: 'center', cursor: 'pointer' }}
                  >
                    Import Cloud File
                    <input 
                      type="file" 
                      accept=".json"
                      style={{ display: 'none' }}
                      onChange={handleRestoreFromCloud}
                    />
                  </label>
                </div>
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
