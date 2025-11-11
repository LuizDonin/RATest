import { useState, useCallback, useRef } from 'react'
import type { 
  ScreenType, 
  Screen, 
  ScreenManagerState, 
  ScreenManagerActions,
  ScreenTransition 
} from '../types/screens'

const DEFAULT_TRANSITIONS: ScreenTransition[] = [
  { from: 'cover', to: 'tutorial', animation: 'slide', duration: 500 },
  { from: 'tutorial', to: 'ar', animation: 'fade', duration: 300 },
  { from: 'ar', to: 'settings', animation: 'slide', duration: 400 },
  { from: 'settings', to: 'ar', animation: 'slide', duration: 400 },
  { from: 'cover', to: 'ar', animation: 'fade', duration: 300 },
]

export function useScreenManager(initialScreen: ScreenType = 'cover') {
  const [state, setState] = useState<ScreenManagerState>({
    currentScreen: initialScreen,
    previousScreen: null,
    screens: [],
    isTransitioning: false,
    history: [initialScreen]
  })

  const transitionsRef = useRef<ScreenTransition[]>(DEFAULT_TRANSITIONS)

  const findScreen = useCallback((screenType: ScreenType): Screen | undefined => {
    return state.screens.find(screen => screen.type === screenType)
  }, [state.screens])

  const getTransition = useCallback((from: ScreenType, to: ScreenType): ScreenTransition | undefined => {
    return transitionsRef.current.find(t => t.from === from && t.to === to)
  }, [])

  const navigateTo = useCallback((screenType: ScreenType, props?: Record<string, any>) => {
    const screen = findScreen(screenType)
    if (!screen) {
      console.warn(`Screen ${screenType} not found`)
      return
    }

    const transition = getTransition(state.currentScreen, screenType)
    
    setState(prev => ({
      ...prev,
      isTransitioning: true,
      previousScreen: prev.currentScreen,
      currentScreen: screenType,
      history: [...prev.history, screenType]
    }))

    // Simular transição
    if (transition?.duration) {
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isTransitioning: false
        }))
      }, transition.duration)
    } else {
      setState(prev => ({
        ...prev,
        isTransitioning: false
      }))
    }
  }, [state.currentScreen, findScreen, getTransition])

  const goBack = useCallback(() => {
    if (state.history.length > 1) {
      const newHistory = [...state.history]
      newHistory.pop() // Remove current screen
      const previousScreen = newHistory[newHistory.length - 1]
      
      setState(prev => ({
        ...prev,
        isTransitioning: true,
        previousScreen: prev.currentScreen,
        currentScreen: previousScreen,
        history: newHistory
      }))

      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isTransitioning: false
        }))
      }, 300)
    }
  }, [state.history])

  const goNext = useCallback(() => {
    const currentScreen = findScreen(state.currentScreen)
    if (currentScreen?.canGoNext) {
      // Implementar lógica para próxima tela baseada no fluxo
      const nextScreenMap: Record<ScreenType, ScreenType> = {
        cover: 'tutorial',
        tutorial: 'ar',
        ar: 'settings',
        settings: 'ar',
        about: 'cover',
        custom: 'cover'
      }
      
      const nextScreen = nextScreenMap[state.currentScreen]
      if (nextScreen) {
        navigateTo(nextScreen)
      }
    }
  }, [state.currentScreen, findScreen, navigateTo])

  const addScreen = useCallback((screen: Screen) => {
    setState(prev => ({
      ...prev,
      screens: [...prev.screens, screen]
    }))
  }, [])

  const removeScreen = useCallback((screenId: string) => {
    setState(prev => ({
      ...prev,
      screens: prev.screens.filter(screen => screen.id !== screenId)
    }))
  }, [])

  const updateScreen = useCallback((screenId: string, updates: Partial<Screen>) => {
    setState(prev => ({
      ...prev,
      screens: prev.screens.map(screen => 
        screen.id === screenId ? { ...screen, ...updates } : screen
      )
    }))
  }, [])

  const getCurrentScreen = useCallback((): Screen | undefined => {
    return findScreen(state.currentScreen)
  }, [state.currentScreen, findScreen])

  const actions: ScreenManagerActions = {
    navigateTo,
    goBack,
    goNext,
    addScreen,
    removeScreen,
    updateScreen
  }

  return {
    state,
    actions,
    getCurrentScreen,
    findScreen,
    getTransition
  }
}
