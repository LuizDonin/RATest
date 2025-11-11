import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeGlobal } from './utils/globalInit'

// Inicializar ANTES do React renderizar
initializeGlobal()
  .then(() => {
    console.log('Inicialização global completa, iniciando React...')
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  })
  .catch((error) => {
    console.error('Erro na inicialização global:', error)
    // Mesmo com erro, iniciar o app
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  })
