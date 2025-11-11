# AR - React

Monorepo para desenvolvimento de aplicações de Realidade Aumentada (RA) com React, TypeScript e Three.js.

## 🚀 Estrutura do Projeto

```
AR-Reacto/
├── apps/                 # Aplicações de RA
├── packages/             # Pacotes compartilhados
│   ├── ar-core/         # Core da funcionalidade de RA
│   ├── ui/              # Componentes de UI reutilizáveis
│   └── shared/          # Utilitários e tipos compartilhados
├── templates/           # Templates para novas aplicações
│   └── app-base/        # Template base para apps de RA
└── scripts/             # Scripts de automação
```

## 📦 Pacotes

- **@ar-monorepo/ar-core**: Funcionalidades principais de RA
- **@ar-monorepo/ui**: Componentes de interface reutilizáveis
- **@ar-monorepo/shared**: Tipos e utilitários compartilhados

## 🛠️ Como Usar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Criar Nova Aplicação de RA

```bash
npm run create-app minha-app-ar
```

### 3. Desenvolver uma Aplicação

```bash
cd apps/minha-app-ar
npm run dev
```

### 4. Build de Todas as Aplicações

```bash
npm run build
```

## 🎯 Tecnologias

- **React 18** - Framework de UI
- **TypeScript** - Tipagem estática
- **Three.js** - Renderização 3D
- **Vite** - Build tool e dev server
- **WebXR** - APIs de realidade aumentada

## 📱 Funcionalidades de RA

- **Sistema de Telas/Cenas** - Gerenciamento completo de fluxo de navegação
- **Transições Animadas** - Sistema avançado de transições entre telas (fade, slide, zoom, flip)
- **Bloqueio de Orientação** - Detecção automática e bloqueio de landscape em dispositivos móveis
- Renderização 3D com Three.js
- Suporte a WebXR para RA
- **Modo de Demonstração** para desenvolvimento sem WebXR
- Controles de gestos
- Adição de objetos 3D
- Captura de screenshots
- Interface responsiva

## 🔧 Scripts Disponíveis

- `npm run create-app <nome>` - Criar nova aplicação
- `npm run dev` - Desenvolvimento (especificar workspace)
- `npm run build` - Build de todos os workspaces
- `npm run lint` - Linting de todos os workspaces
- `npm run type-check` - Verificação de tipos

## 📋 Pré-requisitos

- Node.js >= 18.0.0
- NPM >= 8.0.0
- Dispositivo com suporte a WebXR (para RA completa)
- **Navegador moderno** (para modo de demonstração)

## 🎨 Personalização

### Sistema de Telas
O template inclui um sistema completo de gerenciamento de telas com transições animadas:

- **Capa** - Tela inicial com opções de navegação
- **Tutorial** - Guia interativo com instruções de uso
- **RA** - Tela principal de realidade aumentada
- **Configurações** - Painel de configurações personalizáveis
- **Sobre** - Informações da aplicação

### Sistema de Transições
O sistema oferece vários tipos de transições animadas:

- **fade** - Transição com fade in/out
- **slide-horizontal** - Deslizar horizontal com direção automática
- **slide-vertical** - Deslizar vertical
- **zoom-in** - Zoom de entrada (escala menor para normal)
- **zoom-out** - Zoom de saída (escala maior para normal)
- **flip** - Rotação 3D no eixo Y
- **none** - Sem transição

### Bloqueio de Orientação
Sistema automático que detecta dispositivos móveis e bloqueia o uso em landscape:

- Detecção inteligente de dispositivos móveis
- Overlay informativo com ícones de rotação
- Instruções claras para o usuário
- Suporte a múltiplos eventos de orientação

### Configuração de Transições
```typescript
import { ScreenManager } from './components/ScreenManager'

// Configurar transições globais
<ScreenManager 
  initialScreen="cover"
  appConfig={appConfig}
  defaultTransition="zoom-out"
  defaultDirection="right"
/>
```

### Configuração de Telas
```typescript
import { createScreenConfig } from './config/screens'

const customConfig = createScreenConfig({
  cover: {
    title: 'Minha App de RA',
    subtitle: 'Uma experiência única',
    backgroundImage: '/images/background.jpg'
  },
  tutorial: {
    steps: [
      {
        id: 1,
        title: 'Bem-vindo',
        description: 'Descrição personalizada',
        action: 'Continuar'
      }
    ]
  }
})
```

### Uso de Transições Personalizadas
```typescript
// Navegar com transição específica
onNavigate('ar', 'fade', 'right')

// Navegar com configuração automática
onNavigate('ar') // Usa direção automática baseada na ordem das telas
```

### Personalização Avançada
Cada aplicação pode ser personalizada editando:
- `src/App.tsx` - Componente principal
- `src/components/screens/` - Componentes de tela
- `src/config/screens.ts` - Configurações das telas
- `src/components/` - Componentes específicos
- `src/utils/` - Utilitários da aplicação
- `src/types/` - Tipos específicos

## 🔧 Solução de Problemas

Consulte o arquivo [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) para soluções de problemas comuns.

## 📄 Licença

MIT
