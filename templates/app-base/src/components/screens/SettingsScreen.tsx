import React, { useState } from 'react'
import type { ScreenType } from '../../types/screens'

interface SettingsScreenProps {
  onNavigate: (screen: ScreenType) => void
  onSettingsChange?: (settings: any) => void
}

interface Settings {
  quality: 'low' | 'medium' | 'high'
  enableSound: boolean
  enableVibration: boolean
  autoSave: boolean
  language: 'pt-BR' | 'en-US' | 'es-ES'
}

const DEFAULT_SETTINGS: Settings = {
  quality: 'high',
  enableSound: true,
  enableVibration: true,
  autoSave: true,
  language: 'pt-BR'
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onNavigate,
  onSettingsChange
}) => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)

  const handleSettingChange = (key: keyof Settings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    onSettingsChange?.(newSettings)
  }

  const handleBack = () => {
    onNavigate('ar')
  }

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS)
    onSettingsChange?.(DEFAULT_SETTINGS)
  }

  return (
    <div className="settings-screen">
      <div className="settings-header">
        <button 
          className="settings-back-button"
          onClick={handleBack}
        >
          ← Voltar
        </button>
        
        <h1 className="settings-title">Configurações</h1>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h3>Qualidade</h3>
          <select 
            value={settings.quality}
            onChange={(e) => handleSettingChange('quality', e.target.value)}
            className="settings-select"
          >
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
        </div>

        <div className="settings-section">
          <h3>Som</h3>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={settings.enableSound}
              onChange={(e) => handleSettingChange('enableSound', e.target.checked)}
            />
            <span className="toggle-slider"></span>
            Habilitar som
          </label>
        </div>

        <div className="settings-section">
          <h3>Vibração</h3>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={settings.enableVibration}
              onChange={(e) => handleSettingChange('enableVibration', e.target.checked)}
            />
            <span className="toggle-slider"></span>
            Habilitar vibração
          </label>
        </div>

        <div className="settings-section">
          <h3>Salvamento</h3>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
            />
            <span className="toggle-slider"></span>
            Salvar automaticamente
          </label>
        </div>

        <div className="settings-section">
          <h3>Idioma</h3>
          <select 
            value={settings.language}
            onChange={(e) => handleSettingChange('language', e.target.value)}
            className="settings-select"
          >
            <option value="pt-BR">Português</option>
            <option value="en-US">English</option>
            <option value="es-ES">Español</option>
          </select>
        </div>
      </div>

      <div className="settings-footer">
        <button 
          className="settings-button secondary"
          onClick={handleReset}
        >
          Restaurar Padrões
        </button>
        
        <button 
          className="settings-button primary"
          onClick={handleBack}
        >
          Salvar
        </button>
      </div>
    </div>
  )
}
