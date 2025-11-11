import React from 'react'
import type { ScreenType } from '../../types/screens'

interface FinalScreenProps {
    onNavigate: (screen: ScreenType) => void
}

export const FinalScreen: React.FC<FinalScreenProps> = ({ onNavigate }) => {
    const handleRestart = () => {
        onNavigate('cover')
    }

    return (
        <div className="final-screen">
            <div className="final-content">
                <div className="final-header">
                    <div className="final-icon">🎉</div>
                    <h1 className="final-title">Parabéns!</h1>
                    <p className="final-subtitle">Você completou a experiência de Realidade Aumentada</p>
                </div>

                <div className="final-body">
                    <div className="final-message">
                        <p>Esperamos que você tenha aproveitado essa jornada interativa!</p>
                    </div>

                    <div className="final-stats">
                        <div className="stat-item">
                            <div className="stat-value">✓</div>
                            <div className="stat-label">Experiência Completa</div>
                        </div>
                    </div>
                </div>

                <div className="final-footer">
                    <button
                        className="final-button primary"
                        onClick={handleRestart}
                    >
                        Jogar Novamente
                    </button>
                </div>
            </div>
        </div>
    )
}

