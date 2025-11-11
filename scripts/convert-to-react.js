#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

function analyzeProject(projectPath) {
  console.log(`🔍 Analisando projeto em: ${projectPath}`)
  
  if (!fs.existsSync(projectPath)) {
    console.error('❌ Caminho do projeto não encontrado')
    return
  }

  const structure = {
    files: [],
    directories: [],
    packageJson: null,
    dependencies: [],
    mainFiles: []
  }

  function scanDirectory(dir, relativePath = '') {
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const relativeItemPath = path.join(relativePath, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        structure.directories.push(relativeItemPath)
        scanDirectory(fullPath, relativeItemPath)
      } else {
        structure.files.push(relativeItemPath)
        
        // Identificar arquivos principais
        if (item === 'package.json') {
          try {
            structure.packageJson = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
            if (structure.packageJson.dependencies) {
              structure.dependencies = Object.keys(structure.packageJson.dependencies)
            }
          } catch (error) {
            console.warn('⚠️ Erro ao ler package.json:', error.message)
          }
        }
        
        // Identificar arquivos principais por extensão
        if (['.html', '.js', '.ts', '.jsx', '.tsx', '.vue', '.py', '.java'].includes(path.extname(item))) {
          structure.mainFiles.push(relativeItemPath)
        }
      }
    }
  }

  scanDirectory(projectPath)
  
  return structure
}

function generateConversionPlan(structure) {
  console.log('\n📋 Plano de Conversão:')
  console.log('=' * 50)
  
  console.log('\n📁 Estrutura encontrada:')
  console.log(`- Arquivos: ${structure.files.length}`)
  console.log(`- Diretórios: ${structure.directories.length}`)
  console.log(`- Arquivos principais: ${structure.mainFiles.length}`)
  
  if (structure.packageJson) {
    console.log('\n📦 Dependências encontradas:')
    structure.dependencies.forEach(dep => {
      console.log(`  - ${dep}`)
    })
  }
  
  console.log('\n🔄 Sugestões de conversão:')
  
  // Analisar arquivos principais
  structure.mainFiles.forEach(file => {
    const ext = path.extname(file)
    console.log(`\n📄 ${file}:`)
    
    switch (ext) {
      case '.html':
        console.log('  → Converter para componente React')
        console.log('  → Mover conteúdo para src/components/')
        break
      case '.js':
      case '.ts':
        console.log('  → Converter para hook React ou utilitário')
        console.log('  → Mover para src/hooks/ ou src/utils/')
        break
      case '.jsx':
      case '.tsx':
        console.log('  → Já é React! Apenas adaptar para a estrutura')
        break
      case '.vue':
        console.log('  → Converter de Vue para React')
        console.log('  → Separar template, script e style')
        break
      case '.py':
        console.log('  → Backend Python - manter separado')
        console.log('  → Criar API endpoints')
        break
      case '.java':
        console.log('  → Backend Java - manter separado')
        console.log('  → Criar API endpoints')
        break
    }
  })
  
  return {
    needsReactConversion: structure.mainFiles.some(f => !['.jsx', '.tsx'].includes(path.extname(f))),
    hasBackend: structure.mainFiles.some(f => ['.py', '.java'].includes(path.extname(f))),
    dependencies: structure.dependencies
  }
}

function createConversionScript(projectPath, structure) {
  const scriptPath = path.join(projectPath, 'convert-to-react.sh')
  
  let script = `#!/bin/bash
# Script de conversão para React
# Gerado automaticamente

echo "🚀 Iniciando conversão para React..."

# Criar estrutura React
mkdir -p src/components
mkdir -p src/hooks
mkdir -p src/utils
mkdir -p src/types
mkdir -p src/styles
mkdir -p public

# Copiar arquivos estáticos
if [ -d "assets" ]; then
  cp -r assets/* public/
fi

if [ -d "images" ]; then
  cp -r images/* public/
fi

if [ -d "css" ]; then
  cp -r css/* src/styles/
fi

echo "✅ Estrutura criada!"
echo "📝 Próximos passos:"
echo "1. Converter arquivos HTML para componentes React"
echo "2. Adaptar JavaScript para hooks/utilitários"
echo "3. Configurar dependências no package.json"
echo "4. Testar a aplicação"
`

  fs.writeFileSync(scriptPath, script)
  fs.chmodSync(scriptPath, '755')
  
  console.log(`\n📜 Script de conversão criado: ${scriptPath}`)
}

function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log(`
🔄 Conversor de Projeto para React - AR Monorepo

Uso: node scripts/convert-to-react.js <caminho-do-projeto>

Exemplo: node scripts/convert-to-react.js ../minha-app-ar

O script irá:
1. Analisar a estrutura do projeto
2. Identificar arquivos principais
3. Sugerir plano de conversão
4. Criar script de conversão
`)
    return
  }

  const projectPath = path.resolve(args[0])
  
  try {
    const structure = analyzeProject(projectPath)
    const plan = generateConversionPlan(structure)
    createConversionScript(projectPath, structure)
    
    console.log('\n🎯 Resumo da conversão:')
    console.log(`- Precisa conversão React: ${plan.needsReactConversion ? 'Sim' : 'Não'}`)
    console.log(`- Tem backend: ${plan.hasBackend ? 'Sim' : 'Não'}`)
    console.log(`- Dependências: ${plan.dependencies.length}`)
    
  } catch (error) {
    console.error('❌ Erro durante análise:', error.message)
  }
}

if (require.main === module) {
  main()
}

module.exports = { analyzeProject, generateConversionPlan }
