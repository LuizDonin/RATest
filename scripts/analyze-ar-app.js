#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

function analyzeHTMLFile(filePath) {
  console.log(`🔍 Analisando arquivo HTML: ${filePath}`)
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ Arquivo não encontrado')
    return null
  }

  const content = fs.readFileSync(filePath, 'utf8')
  
  // Extrair informações do HTML
  const analysis = {
    title: extractTitle(content),
    scripts: extractScripts(content),
    styles: extractStyles(content),
    sections: extractSections(content),
    elements: extractElements(content)
  }
  
  return analysis
}

function extractTitle(content) {
  const titleMatch = content.match(/<title[^>]*>([^<]*)<\/title>/i)
  return titleMatch ? titleMatch[1].trim() : 'Aplicação de RA'
}

function extractScripts(content) {
  const scriptMatches = content.match(/<script[^>]*src="([^"]*)"[^>]*>/gi)
  const scripts = []
  
  if (scriptMatches) {
    scriptMatches.forEach(match => {
      const srcMatch = match.match(/src="([^"]*)"/)
      if (srcMatch) {
        scripts.push(srcMatch[1])
      }
    })
  }
  
  return scripts
}

function extractStyles(content) {
  const styleMatches = content.match(/<link[^>]*href="([^"]*\.css)"[^>]*>/gi)
  const styles = []
  
  if (styleMatches) {
    styleMatches.forEach(match => {
      const hrefMatch = match.match(/href="([^"]*)"/)
      if (hrefMatch) {
        styles.push(hrefMatch[1])
      }
    })
  }
  
  return styles
}

function extractSections(content) {
  // Procurar por seções, divs com IDs específicos, ou classes que indiquem telas
  const sections = []
  
  // Padrões comuns para telas
  const patterns = [
    /<div[^>]*id="([^"]*)"[^>]*>/gi,
    /<section[^>]*id="([^"]*)"[^>]*>/gi,
    /<div[^>]*class="[^"]*screen[^"]*"[^>]*>/gi,
    /<div[^>]*class="[^"]*page[^"]*"[^>]*>/gi,
    /<div[^>]*class="[^"]*view[^"]*"[^>]*>/gi
  ]
  
  patterns.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const idMatch = match.match(/id="([^"]*)"/)
        if (idMatch) {
          sections.push({
            type: 'section',
            id: idMatch[1],
            element: match
          })
        }
      })
    }
  })
  
  return sections
}

function extractElements(content) {
  const elements = []
  
  // Procurar por elementos importantes
  const importantElements = [
    'canvas',
    'video',
    'button',
    'input',
    'select',
    'nav',
    'header',
    'footer'
  ]
  
  importantElements.forEach(tag => {
    const regex = new RegExp(`<${tag}[^>]*>`, 'gi')
    const matches = content.match(regex)
    if (matches) {
      elements.push({
        tag: tag,
        count: matches.length,
        examples: matches.slice(0, 3) // Primeiros 3 exemplos
      })
    }
  })
  
  return elements
}

function generateReactComponents(analysis) {
  console.log('\n🔄 Gerando componentes React...')
  
  const components = []
  
  // Gerar componente principal
  components.push({
    name: 'App',
    type: 'main',
    content: generateMainAppComponent(analysis)
  })
  
  // Gerar componentes de tela baseados nas seções
  if (analysis.sections.length > 0) {
    analysis.sections.forEach((section, index) => {
      components.push({
        name: `Screen${index + 1}`,
        type: 'screen',
        content: generateScreenComponent(section, index)
      })
    })
  }
  
  return components
}

function generateMainAppComponent(analysis) {
  return `import React from 'react'
import { ScreenManager } from './components/ScreenManager'
import './App.css'

function App() {
  const appConfig = {
    title: '${analysis.title}',
    subtitle: 'Aplicação de Realidade Aumentada',
    version: '1.0.0',
    developer: 'AR Developer'
  }

  return (
    <div className="ar-app">
      <ScreenManager 
        initialScreen="cover"
        appConfig={appConfig}
      />
    </div>
  )
}

export default App`
}

function generateScreenComponent(section, index) {
  const componentName = `Screen${index + 1}`
  
  return `import React from 'react'
import type { ScreenType } from '../types/screens'

interface ${componentName}Props {
  onNavigate: (screen: ScreenType) => void
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  onNavigate
}) => {
  return (
    <div className="${section.id || `screen-${index + 1}`}">
      <h2>${section.id || `Tela ${index + 1}`}</h2>
      {/* Conteúdo da tela será adicionado aqui */}
      <button onClick={() => onNavigate('ar')}>
        Ir para RA
      </button>
    </div>
  )
}`
}

function createConversionFiles(projectPath, analysis, components) {
  console.log('\n📁 Criando arquivos de conversão...')
  
  // Criar diretório de conversão
  const conversionDir = path.join(projectPath, 'react-conversion')
  if (!fs.existsSync(conversionDir)) {
    fs.mkdirSync(conversionDir, { recursive: true })
  }
  
  // Criar estrutura de diretórios
  const dirs = [
    'src',
    'src/components',
    'src/components/screens',
    'src/hooks',
    'src/utils',
    'src/types',
    'src/styles',
    'public'
  ]
  
  dirs.forEach(dir => {
    const fullPath = path.join(conversionDir, dir)
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true })
    }
  })
  
  // Criar componentes
  components.forEach(component => {
    const filePath = path.join(conversionDir, 'src', 'components', `${component.name}.tsx`)
    fs.writeFileSync(filePath, component.content)
    console.log(`✅ Criado: ${filePath}`)
  })
  
  // Criar package.json
  const packageJson = {
    name: "ar-app-converted",
    version: "1.0.0",
    description: "Aplicação de RA convertida para React",
    main: "dist/index.js",
    scripts: {
      dev: "vite",
      build: "tsc && vite build",
      preview: "vite preview"
    },
    dependencies: {
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "three": "^0.158.0"
    },
    devDependencies: {
      "@types/react": "^18.2.37",
      "@types/react-dom": "^18.2.15",
      "@types/three": "^0.158.3",
      "@vitejs/plugin-react": "^4.1.1",
      "typescript": "^5.2.2",
      "vite": "^4.5.0"
    }
  }
  
  fs.writeFileSync(path.join(conversionDir, 'package.json'), JSON.stringify(packageJson, null, 2))
  
  // Criar README de conversão
  const readme = `# Conversão para React

Esta pasta contém a versão convertida da sua aplicação de RA para React.

## Estrutura Convertida:

${components.map(c => `- ${c.name}.tsx - ${c.type === 'main' ? 'Componente principal' : 'Tela'}`).join('\n')}

## Próximos Passos:

1. Copiar os arquivos para uma nova aplicação React
2. Instalar dependências: \`npm install\`
3. Adaptar o código conforme necessário
4. Testar a aplicação: \`npm run dev\`

## Análise Original:

- Título: ${analysis.title}
- Scripts: ${analysis.scripts.length}
- Estilos: ${analysis.styles.length}
- Seções: ${analysis.sections.length}
- Elementos: ${analysis.elements.length}
`
  
  fs.writeFileSync(path.join(conversionDir, 'README.md'), readme)
  
  console.log(`\n✅ Conversão criada em: ${conversionDir}`)
  return conversionDir
}

function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log(`
🔄 Analisador de Aplicação de RA para React

Uso: node scripts/analyze-ar-app.js <caminho-do-projeto>

Exemplo: node scripts/analyze-ar-app.js ../minha-app-ar

O script irá:
1. Analisar o index.html
2. Identificar telas e componentes
3. Gerar componentes React
4. Criar estrutura de conversão
`)
    return
  }

  const projectPath = path.resolve(args[0])
  const htmlPath = path.join(projectPath, 'index.html')
  
  try {
    console.log(`🔍 Analisando projeto: ${projectPath}`)
    
    const analysis = analyzeHTMLFile(htmlPath)
    if (!analysis) {
      console.error('❌ Não foi possível analisar o arquivo HTML')
      return
    }
    
    console.log('\n📊 Análise do HTML:')
    console.log(`- Título: ${analysis.title}`)
    console.log(`- Scripts: ${analysis.scripts.length}`)
    console.log(`- Estilos: ${analysis.styles.length}`)
    console.log(`- Seções: ${analysis.sections.length}`)
    console.log(`- Elementos: ${analysis.elements.length}`)
    
    if (analysis.scripts.length > 0) {
      console.log('\n📜 Scripts encontrados:')
      analysis.scripts.forEach(script => console.log(`  - ${script}`))
    }
    
    if (analysis.sections.length > 0) {
      console.log('\n📱 Seções/Telas encontradas:')
      analysis.sections.forEach((section, index) => {
        console.log(`  ${index + 1}. ${section.id || `Seção ${index + 1}`}`)
      })
    }
    
    const components = generateReactComponents(analysis)
    const conversionDir = createConversionFiles(projectPath, analysis, components)
    
    console.log('\n🎯 Conversão concluída!')
    console.log(`📁 Arquivos criados em: ${conversionDir}`)
    console.log('\n📝 Próximos passos:')
    console.log('1. Revisar os componentes gerados')
    console.log('2. Adaptar o código conforme necessário')
    console.log('3. Copiar para uma nova aplicação React')
    console.log('4. Instalar dependências e testar')
    
  } catch (error) {
    console.error('❌ Erro durante análise:', error.message)
  }
}

if (require.main === module) {
  main()
}

module.exports = { analyzeHTMLFile, generateReactComponents }
