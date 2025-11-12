# teste

Aplicação de Realidade Aumentada criada com o AR Monorepo.

## Desenvolvimento

```bash
npm run dev
```

## Build

Para gerar a versão de produção:

```bash
npm run build
```

Isso criará uma pasta `dist` com os arquivos otimizados prontos para deploy.

## Preview

Para testar o build localmente antes de fazer deploy:

```bash
npm run preview
```

## Deploy no GitHub Pages

### Configuração Inicial

1. **Criar o repositório no GitHub:**
   - Crie um novo repositório no GitHub (ex: `teste-aframe-ar`)
   - O nome do repositório deve corresponder ao valor configurado em `vite.config.ts` na linha 6

2. **Configurar o GitHub Pages:**
   - Vá em **Settings** > **Pages** no seu repositório
   - Em **Source**, selecione **GitHub Actions**
   - Salve as configurações

3. **Ajustar o nome do repositório no código:**
   - Abra `vite.config.ts`
   - Na linha 6, altere `/teste-aframe-ar/` para o nome do seu repositório
   - Exemplo: se seu repositório é `meu-app-ar`, use `base: process.env.NODE_ENV === 'production' ? '/meu-app-ar/' : '/'`

### Deploy Automático (Recomendado)

O projeto já inclui um workflow do GitHub Actions (`.github/workflows/deploy.yml`) que faz o deploy automaticamente:

1. **Fazer push do código:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
   git push -u origin main
   ```

2. **O deploy acontece automaticamente:**
   - Toda vez que você fizer push para a branch `main` ou `master`, o GitHub Actions irá:
     - Instalar as dependências
     - Fazer o build do projeto
     - Fazer deploy no GitHub Pages

3. **Acompanhar o deploy:**
   - Vá na aba **Actions** do seu repositório
   - Você verá o progresso do build e deploy

4. **Acessar a aplicação:**
   - Após o deploy, acesse: `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/`
   - O primeiro deploy pode levar alguns minutos

### Deploy Manual

Se preferir fazer deploy manual:

1. **Fazer o build:**
   ```bash
   npm run build
   ```

2. **Configurar o GitHub Pages manualmente:**
   - Vá em **Settings** > **Pages** no seu repositório
   - Em **Source**, selecione a branch `gh-pages` e a pasta `/root`
   - Faça push da pasta `dist` para a branch `gh-pages`:
   ```bash
   git checkout --orphan gh-pages
   git rm -rf .
   cp -r dist/* .
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

### Testando no Celular

1. **Acesse a URL do GitHub Pages no navegador do celular:**
   - `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/`

2. **Requisitos para Realidade Aumentada:**
   - Use HTTPS (GitHub Pages já fornece isso)
   - Permita acesso à câmera quando solicitado
   - Use um navegador moderno (Chrome, Safari, Firefox)
   - Alguns recursos de AR podem precisar de WebXR, disponível em dispositivos compatíveis

3. **Dicas:**
   - Teste em diferentes navegadores
   - Verifique se a câmera está funcionando
   - A aplicação bloqueia automaticamente a orientação landscape em dispositivos móveis

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
