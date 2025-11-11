import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Tipos para os dados do RA
interface RAMetadados {
  marca: string
  codigo: string
}

interface RAConfiguracoes {
  usarAFrame?: boolean
  usarVideo?: boolean
  usarFaceTracking?: boolean
  cameraFacing?: 'user' | 'environment'
}

interface RAData {
  metadados: RAMetadados
  configuracoes?: RAConfiguracoes
}

interface RAContextType {
  raData: RAData | null
  loading: boolean
  error: string | null
  refreshData: () => void
}

// Criar o contexto
const RAContext = createContext<RAContextType | undefined>(undefined)

// Hook personalizado para usar o contexto
export const useRA = () => {
  const context = useContext(RAContext)
  if (context === undefined) {
    throw new Error('useRA deve ser usado dentro de um RAProvider')
  }
  return context
}

// Props do provider
interface RAProviderProps {
  children: ReactNode
}

// Provider do contexto
export const RAProvider: React.FC<RAProviderProps> = ({ children }) => {
  const [raData, setRaData] = useState<RAData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRAData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔄 Carregando dados do RA...')

      const base = (import.meta as any)?.env?.BASE_URL || (document?.baseURI ? new URL(document.baseURI).pathname : '/')
      const b = base && base !== '/' ? (base.endsWith('/') ? base : base + '/') : '/'
      const url = `${b}assets/data/ra.json`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Erro ao carregar dados: ${response.status}`)
      }

      const data: RAData = await response.json()

      console.log('✅ Dados do RA carregados:', data)
      setRaData(data)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      console.error('❌ Erro ao carregar dados do RA:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    loadRAData()
  }

  useEffect(() => {
    loadRAData()
  }, [])

  const value: RAContextType = {
    raData,
    loading,
    error,
    refreshData
  }

  return (
    <RAContext.Provider value={value}>
      {children}
    </RAContext.Provider>
  )
}
