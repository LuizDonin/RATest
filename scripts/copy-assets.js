#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Caminhos
const sourceDir = path.join(__dirname, '../apps/AF/public')
const targetDir = path.join(__dirname, '../templates/app-base/public')

console.log('🔄 Copiando assets para o template...')
console.log(`📁 Origem: ${sourceDir}`)
console.log(`📁 Destino: ${targetDir}`)

try {
  // Criar diretório de destino se não existir
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
    console.log('✅ Diretório criado:', targetDir)
  }

  // Função para copiar diretório recursivamente
  function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true })
    }

    const items = fs.readdirSync(src)
    
    for (const item of items) {
      const srcPath = path.join(src, item)
      const destPath = path.join(dest, item)
      
      if (fs.statSync(srcPath).isDirectory()) {
        copyDirectory(srcPath, destPath)
      } else {
        fs.copyFileSync(srcPath, destPath)
      }
    }
  }

  // Copiar toda a estrutura de assets
  copyDirectory(sourceDir, targetDir)
  
  console.log('✅ Assets copiados com sucesso!')
  console.log(' Estrutura copiada:')
  console.log('   - /assets/images/')
  console.log('   - /assets/data/ra.json')
  
} catch (error) {
  console.error('❌ Erro:', error.message)
}
