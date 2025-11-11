import React from 'react'
import type { ScreenType, TransitionType, TransitionDirection } from '../../types/screens'
import '../../styles/tutorial-screen.css'

interface TutorialScreen2Props {
    onNavigate: (screen: ScreenType, transition?: TransitionType, direction?: TransitionDirection) => void
    title?: string
    subtitle?: string
    backgroundImage?: string
}

export const TutorialScreen2: React.FC<TutorialScreen2Props> = ({
    onNavigate
}) => {
    // Get base URL from vite config or use current location
    const getBaseUrl = () => {
        const base = (import.meta as any)?.env?.BASE_URL || (document?.baseURI ? new URL(document.baseURI).pathname : '/')
        const b = base && base !== '/' ? (base.endsWith('/') ? base : base + '/') : '/'
        return b === '/' ? '' : b.endsWith('/') ? b.slice(0, -1) : b
    }

    const baseUrl = getBaseUrl()
    // Garantir que o caminho comece com / se baseUrl estiver vazio
    const normalizePath = (path: string) => {
        if (baseUrl === '') {
            return path.startsWith('/') ? path : `/${path}`
        }
        const cleanPath = path.startsWith('/') ? path.slice(1) : path
        return `${baseUrl}/${cleanPath}`
    }

    const bgImage = normalizePath('assets/images/bg-capa.png')
    const tutorialPanelImage = normalizePath('assets/images/tutorial-panel-2.png')
    const btnComecarImage = normalizePath('assets/images/btn-comecar.png')

    return (
        <div
            className="tutorial-screen"
            style={{
                backgroundImage: `url("${bgImage}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Imagem central do tutorial */}
            <div className="tutorial-panel-container">
                <img
                    src={tutorialPanelImage}
                    alt="Tutorial Panel 2"
                    className="tutorial-panel-image"
                />
            </div>

            {/* Botão Começar RA */}
            <div className="tutorial-button-container">
                <button
                    className="tutorial-button-comecar"
                    onClick={() => onNavigate('ar', 'fade', 'right')}
                    style={{
                        backgroundImage: `url("${btnComecarImage}")`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center'
                    }}
                />
            </div>
        </div>
    )
}

