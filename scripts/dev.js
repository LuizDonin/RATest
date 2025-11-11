#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function listApps() {
  const appsDir = path.join(__dirname, '../apps')
  if (!fs.existsSync(appsDir)) {
    console.log('❌ Nenhuma aplicação encontrada')
    return []
  }
  
  const apps = fs.readdirSync(appsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
  
  return apps
}

function runDev(appName) {
  const appsDir = path.join(__dirname, '../apps')
  const appPath = path.join(appsDir, appName)
  
  if (!fs.existsSync(appPath)) {
    console.error(`❌ Aplicação "${appName}" não encontrada`)
    console.log('\n📋 Aplicações disponíveis:')
    const apps = listApps()
    if (apps.length === 0) {
      console.log('   Nenhuma aplicação criada ainda')
      console.log('   Use: npm run create-app <nome>')
    } else {
      apps.forEach(app => console.log(`   - ${app}`))
    }
    process.exit(1)
  }
  
  try {
    console.log(`🚀 Iniciando desenvolvimento da aplicação: ${appName}`)
    process.chdir(appPath)
    execSync('npm run dev', { stdio: 'inherit' })
  } catch (error) {
    console.error('❌ Erro ao iniciar desenvolvimento:', error.message)
    process.exit(1)
  }
}

function showHelp() {
  console.log(`
🛠️  Scripts de Desenvolvimento - AR Monorepo

Uso:
  node scripts/dev.js <nome-da-app>    # Iniciar desenvolvimento de uma app
  node scripts/dev.js --list           # Listar aplicações disponíveis
  node scripts/dev.js --help           # Mostrar esta ajuda

Exemplos:
  node scripts/dev.js exemplo-ar
  node scripts/dev.js --list

Comandos disponíveis:
  npm run create-app <nome>            # Criar nova aplicação
  npm run dev <nome>                   # Desenvolvimento (alternativo)
`)
}

// Executar se chamado diretamente
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp()
    process.exit(0)
  }
  
  if (args.includes('--list') || args.includes('-l')) {
    console.log('📋 Aplicações disponíveis:')
    const apps = listApps()
    if (apps.length === 0) {
      console.log('   Nenhuma aplicação criada ainda')
      console.log('   Use: npm run create-app <nome>')
    } else {
      apps.forEach(app => console.log(`   - ${app}`))
    }
    process.exit(0)
  }
  
  const appName = args[0]
  runDev(appName)
}

module.exports = { listApps, runDev }
