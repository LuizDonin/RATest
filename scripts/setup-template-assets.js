#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

function setupTemplateAssets() {
  const sourceDir = path.join(__dirname, '../apps/AF/public/images')
  const targetDir = path.join(__dirname, '../templates/app-base/public/images')

  try {
    console.log('🔄 Configurando assets do template...')

    // Criar diretório de imagens se não existir
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
      console.log('✅ Diretório de imagens criado')
    }

    // Copiar assets do Landscape Blocker
    const landscapeAssets = ['rotate-icon.png', 'rotate.png']
    
    for (const asset of landscapeAssets) {
      const srcAsset = path.join(sourceDir, asset)
      const destAsset = path.join(targetDir, asset)
      
      if (fs.existsSync(srcAsset)) {
        fs.copyFileSync(srcAsset, destAsset)
        console.log(`✅ Copiado: ${asset}`)
      } else {
        console.log(`⚠️ Asset não encontrado: ${asset}`)
      }
    }

    console.log('✅ Assets do template configurados com sucesso!')

  } catch (error) {
    console.error('❌ Erro ao configurar assets:', error.message)
    process.exit(1)
  }
}

setupTemplateAssets()
