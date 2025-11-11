import React from 'react'
import { useRA } from '../contexts/RAContext'

export const RADataDisplay: React.FC = () => {
  const { raData, loading, error, refreshData } = useRA()

  if (loading) {
    return (
      <div style={{ 
        padding: '10px', 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        🔄 Carregando dados do RA...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        padding: '10px', 
        background: 'rgba(255,0,0,0.8)', 
        color: 'white', 
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        ❌ Erro: {error}
        <button 
          onClick={refreshData}
          style={{ 
            marginLeft: '10px', 
            padding: '2px 8px',
            background: 'white',
            color: 'red',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          🔄 Tentar novamente
        </button>
      </div>
    )
  }

  if (!raData) {
    return (
      <div style={{ 
        padding: '10px', 
        background: 'rgba(255,165,0,0.8)', 
        color: 'white', 
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        ⚠️ Nenhum dado carregado
      </div>
    )
  }

  return (
    <div style={{ 
      padding: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <div>📊 Dados do RA:</div>
      <div>🏷️ Marca: {raData.metadados.marca}</div>
      <div>🔢 Código: {raData.metadados.codigo}</div>
      <button 
        onClick={refreshData}
        style={{ 
          marginTop: '5px', 
          padding: '2px 8px',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer',
          fontSize: '10px'
        }}
      >
        �� Atualizar
      </button>
    </div>
  )
}
