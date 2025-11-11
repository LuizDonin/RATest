# teste

Aplicação de Realidade Aumentada criada com o AR Monorepo.

## Desenvolvimento

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Funcionalidades

- 🌐 Sistema de telas com transições animadas avançadas
- 🔒 Detecção de orientação landscape com bloqueio automático
- 🎮 Controles de Realidade Aumentada
- ⚙️ Tela de configurações personalizáveis
- ℹ️ Tela sobre a aplicação
- 📖 Tutorial interativo com instruções de uso
- 📊 Carregamento automático de dados do RA
- 🎨 Sistema de transições (fade, slide, zoom, flip)

## Estrutura

```
src/
├── components/          # Componentes React
│   ├── screens/        # Telas da aplicação
│   ├── LandscapeBlocker.tsx  # Bloqueador de landscape
│   ├── RADataDisplay.tsx     # Exibição de dados do RA
│   └── ...
├── contexts/           # Contextos React
│   └── RAContext.tsx   # Contexto para dados do RA
├── hooks/              # Hooks customizados
├── types/              # Definições de tipos TypeScript
├── utils/              # Utilitários
└── styles/             # Estilos CSS

public/
├── assets/
│   ├── images/         # Imagens da aplicação
│   └── data/
│       └── ra.json     # Dados do RA
```

## Sistema de Transições

A aplicação inclui um sistema avançado de transições entre telas:

- **fade** - Transição com fade in/out
- **slide-horizontal/vertical** - Deslizar com direção automática
- **zoom-in/out** - Efeitos de zoom suaves
- **flip** - Rotação 3D no eixo Y
- **none** - Sem transição

### Configuração de Transições
```typescript
<ScreenManager 
  defaultTransition="zoom-out"
  defaultDirection="right"
/>
```

## Bloqueio de Orientação

A aplicação inclui um sistema automático de bloqueio de orientação landscape que:

- Detecta dispositivos móveis inteligentemente
- Bloqueia o uso em orientação landscape
- Mostra uma tela de aviso com ícones de rotação animados
- Permite o uso apenas em orientação retrato
- Suporte a múltiplos eventos de orientação

## Dados do RA

A aplicação carrega automaticamente os dados do arquivo `/assets/data/ra.json` e os disponibiliza em todas as telas através do contexto React.

## Tecnologias

- React 18
- TypeScript
- Three.js
- Vite
- WebXR (para RA)
