# 🎭 Sistema de Telas/Cenas - AR Monorepo

## Visão Geral

O sistema de telas fornece uma arquitetura completa para gerenciar o fluxo de navegação em aplicações de Realidade Aumentada, permitindo criar experiências ricas e organizadas.

## 📋 Telas Disponíveis

### 1. **Capa (Cover)**
- **Propósito:** Tela inicial da aplicação
- **Funcionalidades:**
  - Apresentação da aplicação
  - Botões de navegação (Tutorial, Pular, Configurações)
  - Informações da versão
  - Link para "Sobre"

### 2. **Tutorial**
- **Propósito:** Guia interativo para novos usuários
- **Funcionalidades:**
  - Passos sequenciais personalizáveis
  - Indicador de progresso
  - Botão de pular
  - Navegação automática para RA

### 3. **RA (Realidade Aumentada)**
- **Propósito:** Tela principal da aplicação
- **Funcionalidades:**
  - Renderização 3D com Three.js
  - Controles de RA
  - Seletor de objetos 3D
  - Botões de navegação

### 4. **Configurações**
- **Propósito:** Painel de configurações da aplicação
- **Funcionalidades:**
  - Configurações de qualidade
  - Opções de som e vibração
  - Configurações de salvamento
  - Seleção de idioma

### 5. **Sobre**
- **Propósito:** Informações sobre a aplicação
- **Funcionalidades:**
  - Detalhes da aplicação
  - Lista de tecnologias
  - Funcionalidades
  - Informações do desenvolvedor

## 🛠️ Como Usar

### Configuração Básica

```typescript
import { ScreenManager } from './components/ScreenManager'

function App() {
  return (
    <ScreenManager 
      initialScreen="cover"
      appConfig={{
        title: 'Minha App de RA',
        subtitle: 'Uma experiência única',
        version: '1.0.0',
        developer: 'Seu Nome'
      }}
    />
  )
}
```

### Configuração Personalizada

```typescript
import { createScreenConfig } from './config/screens'

const customConfig = createScreenConfig({
  cover: {
    title: 'Minha App Personalizada',
    subtitle: 'Uma experiência única em RA',
    backgroundImage: '/images/background.jpg',
    showTutorialButton: true,
    showSkipButton: true,
    showSettingsButton: true
  },
  tutorial: {
    steps: [
      {
        id: 1,
        title: 'Bem-vindo',
        description: 'Descrição personalizada',
        action: 'Continuar'
      }
    ],
    showSkipButton: true,
    showProgress: true
  }
})
```

## 🎨 Personalização

### Modificando Telas Existentes

1. **Editar Componentes:**
   ```typescript
   // src/components/screens/CoverScreen.tsx
   export const CoverScreen: React.FC<CoverScreenProps> = ({
     onNavigate,
     title = 'Título Personalizado',
     subtitle = 'Subtítulo Personalizado'
   }) => {
     // Sua lógica personalizada
   }
   ```

2. **Adicionar Novas Telas:**
   ```typescript
   // src/components/screens/CustomScreen.tsx
   export const CustomScreen: React.FC<CustomScreenProps> = ({
     onNavigate
   }) => {
     return (
       <div className="custom-screen">
         {/* Sua tela personalizada */}
       </div>
     )
   }
   ```

3. **Registrar Nova Tela:**
   ```typescript
   // No ScreenManager
   actions.addScreen({
     id: 'custom',
     type: 'custom',
     title: 'Tela Personalizada',
     component: CustomScreen,
     canGoBack: true
   })
   ```

### Estilos CSS

Os estilos estão organizados em `src/styles/screens.css`:

```css
/* Estilo para tela personalizada */
.custom-screen {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  flex-direction: column;
}
```

## 🔄 Fluxo de Navegação

### Fluxo Padrão
```
Capa → Tutorial → RA
  ↓       ↓       ↓
Sobre  Pular   Configurações
```

### Fluxo Personalizado
```typescript
const customFlow = {
  cover: 'tutorial',
  tutorial: 'ar',
  ar: 'settings',
  settings: 'ar',
  about: 'cover'
}
```

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- **Desktop** - Navegação com mouse
- **Tablet** - Navegação com toque
- **Mobile** - Navegação com toque e gestos

## 🎯 Exemplos de Uso

### Aplicação Minimalista
```typescript
const minimalConfig = createScreenConfig({
  cover: {
    title: 'RA Simples',
    subtitle: 'Apenas o essencial',
    showTutorialButton: false,
    showSkipButton: true,
    showSettingsButton: false
  },
  tutorial: {
    steps: [
      {
        id: 1,
        title: 'Pronto!',
        description: 'Sua aplicação está pronta.',
        action: 'Começar'
      }
    ],
    showSkipButton: false,
    showProgress: false
  }
})
```

### Aplicação Completa
```typescript
const completeConfig = createScreenConfig({
  cover: {
    title: 'RA Avançada',
    subtitle: 'Experiência completa',
    backgroundImage: '/images/hero-bg.jpg',
    showTutorialButton: true,
    showSkipButton: true,
    showSettingsButton: true
  },
  tutorial: {
    steps: [
      // Múltiplos passos personalizados
    ],
    showSkipButton: true,
    showProgress: true
  },
  ar: {
    showBackButton: true,
    showSettingsButton: true,
    defaultObjects: [
      // Objetos 3D padrão
    ]
  },
  settings: {
    sections: [
      // Configurações avançadas
    ]
  }
})
```

## 🔧 Configurações Avançadas

### Transições Personalizadas
```typescript
const customTransitions = [
  { from: 'cover', to: 'tutorial', animation: 'slide', duration: 500 },
  { from: 'tutorial', to: 'ar', animation: 'fade', duration: 300 }
]
```

### Hooks Personalizados
```typescript
import { useScreenManager } from './hooks/useScreenManager'

function CustomComponent() {
  const { state, actions } = useScreenManager('cover')
  
  const handleCustomNavigation = () => {
    actions.navigateTo('custom-screen')
  }
  
  return (
    // Seu componente
  )
}
```

## 📚 API Reference

### ScreenManager Props
```typescript
interface ScreenManagerProps {
  initialScreen?: ScreenType
  appConfig?: {
    title?: string
    subtitle?: string
    version?: string
    developer?: string
  }
}
```

### Screen Interface
```typescript
interface Screen {
  id: string
  type: ScreenType
  title: string
  description?: string
  component: React.ComponentType<any>
  props?: Record<string, any>
  isActive?: boolean
  canGoBack?: boolean
  canGoNext?: boolean
}
```

### useScreenManager Hook
```typescript
const {
  state,           // Estado atual
  actions,         // Ações disponíveis
  getCurrentScreen, // Tela atual
  findScreen,      // Encontrar tela
  getTransition    // Obter transição
} = useScreenManager(initialScreen)
```

## 🚀 Próximos Passos

1. **Implementar animações avançadas**
2. **Adicionar suporte a gestos**
3. **Criar templates de tela**
4. **Implementar persistência de estado**
5. **Adicionar suporte a temas**

## 📞 Suporte

Para dúvidas sobre o sistema de telas:
1. Consulte os exemplos em `src/examples/`
2. Verifique a documentação do TypeScript
3. Abra uma issue no repositório
