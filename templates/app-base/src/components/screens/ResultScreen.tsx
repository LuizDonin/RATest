import React, { useEffect, useState } from 'react'
import type { ScreenType, TransitionType, TransitionDirection } from '../../types/screens'
import '../../styles/result-screen.css'

interface ResultScreenProps {
    onNavigate: (screen: ScreenType, transition?: TransitionType, direction?: TransitionDirection) => void
    title?: string
    subtitle?: string
    backgroundImage?: string
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
    onNavigate
}) => {
    const [resultType, setResultType] = useState<'acerto' | 'erro' | null>(null)

    useEffect(() => {
        // Ler dados do resultado do localStorage - verificar múltiplas vezes se necessário
        const checkResult = (attempt = 0) => {
            const result = localStorage.getItem('ar-result') as 'acerto' | 'erro' | null

            console.log(`Tentativa ${attempt + 1}: resultado no localStorage =`, result)
            console.log('Todos os itens:', {
                result: localStorage.getItem('ar-result'),
                score: localStorage.getItem('ar-score'),
                progress: localStorage.getItem('ar-progress')
            })

            if (result === 'acerto' || result === 'erro') {
                setResultType(result)
            } else if (attempt < 5) {
                // Tentar novamente até 5 vezes (500ms total)
                setTimeout(() => checkResult(attempt + 1), 100)
            } else {
                // Só navegar para cover se realmente não houver resultado após todas as tentativas
                console.error('Resultado não encontrado no localStorage após múltiplas tentativas, voltando para cover')
                onNavigate('cover', 'zoom-in', 'left')
            }
        }

        // Começar a verificar imediatamente
        checkResult(0)
    }, [onNavigate])

    // Get base URL
    const getBaseUrl = () => {
        const base = (import.meta as any)?.env?.BASE_URL || (document?.baseURI ? new URL(document.baseURI).pathname : '/')
        const b = base && base !== '/' ? (base.endsWith('/') ? base : base + '/') : '/'
        return b === '/' ? '' : b.endsWith('/') ? b.slice(0, -1) : b
    }

    const baseUrl = getBaseUrl()
    const normalizePath = (path: string) => {
        if (baseUrl === '') {
            return path.startsWith('/') ? path : `/${path}`
        }
        const cleanPath = path.startsWith('/') ? path.slice(1) : path
        return `${baseUrl}/${cleanPath}`
    }

    const images = {
        bgCapa: normalizePath('assets/images/bg-capa.png'),
        modalAcerto: normalizePath('assets/images/modal-acerto.png'),
        modalErro: normalizePath('assets/images/modal-erro.png'),
        btnRegistrar: normalizePath('assets/images/btn-registrar.png'),
        btnInicio: normalizePath('assets/images/btn-inicio.png'),
        btnVoltar: normalizePath('assets/images/btn-voltar.png')
    }

    const handleRegistrar = () => {
        onNavigate('selfie', 'fade', 'up')
    }

    const handleInicio = () => {
        onNavigate('cover', 'zoom-in', 'left')
    }

    const handleVoltar = () => {
        onNavigate('ar', 'fade', 'left')
    }

    if (!resultType) {
        return null
    }

    return (
        <div
            className="result-screen"
            style={{
                backgroundImage: `url("${images.bgCapa}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="result-content">
                <img
                    src={resultType === 'acerto' ? images.modalAcerto : images.modalErro}
                    alt={resultType === 'acerto' ? 'Acerto' : 'Erro'}
                    className="result-modal-image"
                />

                {/* Botões para acerto */}
                {resultType === 'acerto' && (
                    <div className="result-modal-buttons">
                        <button
                            className="result-button result-button-registrar"
                            onClick={handleRegistrar}
                            style={{
                                backgroundImage: `url(${images.btnRegistrar})`,
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center'
                            }}
                        />
                        <button
                            className="result-button result-button-inicio"
                            onClick={handleInicio}
                            style={{
                                backgroundImage: `url(${images.btnInicio})`,
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center'
                            }}
                        />
                    </div>
                )}

                {/* Botão para erro */}
                {resultType === 'erro' && (
                    <div className="result-modal-buttons">
                        <button
                            className="result-button result-button-voltar"
                            onClick={handleVoltar}
                            style={{
                                backgroundImage: `url(${images.btnVoltar})`,
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center'
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

