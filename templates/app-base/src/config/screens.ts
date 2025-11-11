import type { ScreenType } from '../types/screens'

export interface ScreenConfig {
  cover: {
    title: string
    subtitle: string
    backgroundImage?: string
    showTutorialButton: boolean
    showSkipButton: boolean
    showSettingsButton: boolean
  }
  tutorial: {
    steps: Array<{
      id: number
      title: string
      description: string
      image?: string
      action: string
    }>
    showSkipButton: boolean
    showProgress: boolean
  }
  ar: {
    showBackButton: boolean
    showSettingsButton: boolean
    defaultObjects: Array<{
      type: 'cube' | 'sphere' | 'cylinder'
      color: string
      position: { x: number; y: number; z: number }
    }>
  }
  settings: {
    sections: Array<{
      id: string
      title: string
      type: 'select' | 'toggle' | 'slider'
      options?: string[]
      defaultValue: any
    }>
  }
  about: {
    appName: string
    version: string
    description: string
    developer: string
    technologies: string[]
    features: string[]
  }
}

export const DEFAULT_SCREEN_CONFIG: ScreenConfig = {
  cover: {
    title: 'Realidade Aumentada',
    subtitle: 'Explore o mundo em 3D',
    showTutorialButton: true,
    showSkipButton: true,
    showSettingsButton: true
  },
  tutorial: {
    steps: [
      {
        id: 1,
        title: 'Bem-vindo à RA',
        description: 'Aprenda a usar a Realidade Aumentada de forma simples e intuitiva.',
        action: 'Toque para continuar'
      },
      {
        id: 2,
        title: 'Adicionar Objetos',
        description: 'Use o seletor de objetos para adicionar cubos, esferas e cilindros à cena.',
        action: 'Toque para continuar'
      },
      {
        id: 3,
        title: 'Mover Objetos',
        description: 'Toque e arraste os objetos para movê-los na cena 3D.',
        action: 'Toque para continuar'
      },
      {
        id: 4,
        title: 'Capturar Imagens',
        description: 'Use o botão "Capturar" para salvar screenshots da sua cena.',
        action: 'Começar RA'
      }
    ],
    showSkipButton: true,
    showProgress: true
  },
  ar: {
    showBackButton: true,
    showSettingsButton: true,
    defaultObjects: [
      {
        type: 'cube',
        color: '#00ff00',
        position: { x: 0, y: 0, z: -3 }
      },
      {
        type: 'sphere',
        color: '#ff0000',
        position: { x: 2, y: 0, z: -3 }
      }
    ]
  },
  settings: {
    sections: [
      {
        id: 'quality',
        title: 'Qualidade',
        type: 'select',
        options: ['Baixa', 'Média', 'Alta'],
        defaultValue: 'Alta'
      },
      {
        id: 'sound',
        title: 'Som',
        type: 'toggle',
        defaultValue: true
      },
      {
        id: 'vibration',
        title: 'Vibração',
        type: 'toggle',
        defaultValue: true
      },
      {
        id: 'autoSave',
        title: 'Salvamento Automático',
        type: 'toggle',
        defaultValue: true
      },
      {
        id: 'language',
        title: 'Idioma',
        type: 'select',
        options: ['Português', 'English', 'Español'],
        defaultValue: 'Português'
      }
    ]
  },
  about: {
    appName: 'Realidade Aumentada',
    version: '1.0.0',
    description: 'Uma aplicação inovadora de realidade aumentada desenvolvida com tecnologias modernas.',
    developer: 'Desenvolvedor AR',
    technologies: ['React 18', 'TypeScript', 'A-Frame', 'AR.js', 'Vite'],
    features: [
      'Renderização 3D em tempo real',
      'Adição de objetos 3D',
      'Captura de screenshots',
      'Interface responsiva',
      'Suporte a gestos'
    ]
  }
}

export function createScreenConfig(overrides: Partial<ScreenConfig> = {}): ScreenConfig {
  return {
    ...DEFAULT_SCREEN_CONFIG,
    ...overrides
  }
}
