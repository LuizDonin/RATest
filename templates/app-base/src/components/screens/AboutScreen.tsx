import React from 'react'
import type { ScreenType } from '../../types/screens'

interface AboutScreenProps {
  onNavigate: (screen: ScreenType) => void
  appName?: string
  version?: string
  description?: string
  developer?: string
}

export const AboutScreen: React.FC<AboutScreenProps> = ({
  onNavigate,
  appName = 'Realidade Aumentada',
  version = '1.0.0',
  description = 'Uma aplicação inovadora de realidade aumentada desenvolvida com tecnologias modernas.',
  developer = 'Desenvolvedor AR'
}) => {
  const handleBack = () => {
    onNavigate('cover')
  }

  return (
    <div className="about-screen">
      <div className="about-header">
        <button 
          className="about-back-button"
          onClick={handleBack}
        >
          ← Voltar
        </button>
        
        <h1 className="about-title">Sobre</h1>
      </div>

      <div className="about-content">
        <div className="about-app-info">
          <h2 className="app-name">{appName}</h2>
          <p className="app-version">Versão {version}</p>
          <p className="app-description">{description}</p>
        </div>

        <div className="about-section">
          <h3>Desenvolvedor</h3>
          <p>{developer}</p>
        </div>

        <div className="about-section">
          <h3>Tecnologias</h3>
          <ul className="tech-list">
            <li>React 18</li>
            <li>TypeScript</li>
            <li>A-Frame</li>
            <li>AR.js</li>
            <li>Vite</li>
          </ul>
        </div>

        <div className="about-section">
          <h3>Funcionalidades</h3>
          <ul className="features-list">
            <li>Renderização 3D em tempo real</li>
            <li>Adição de objetos 3D</li>
            <li>Captura de screenshots</li>
            <li>Interface responsiva</li>
            <li>Suporte a gestos</li>
          </ul>
        </div>

        <div className="about-section">
          <h3>Licença</h3>
          <p>MIT License - Código aberto</p>
        </div>
      </div>

      <div className="about-footer">
        <button 
          className="about-button"
          onClick={handleBack}
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  )
}
