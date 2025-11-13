import React, { useEffect, useState, useRef, useCallback } from 'react'
import type { ScreenType, TransitionType, TransitionDirection } from '../../types/screens'
import { LandscapeBlocker } from '../LandscapeBlocker'
import '../../styles/quiz1screen.css'

interface Quiz2Props {
    onNavigate: (screen: ScreenType, transition?: TransitionType, direction?: TransitionDirection) => void
    title?: string
    subtitle?: string
    backgroundImage?: string
}

export const Quiz2: React.FC<Quiz2Props> = ({
    onNavigate
}) => {
    const [isMounted, setIsMounted] = useState(false)
    const [macacoScale, setMacacoScale] = useState(1)
    const [isCorrectAnswer, setIsCorrectAnswer] = useState(false)
    const [showColoredMacaco, setShowColoredMacaco] = useState(false)
    const [showMacacoTop, setShowMacacoTop] = useState(false)
    const quizSectionRef = useRef<HTMLDivElement>(null)
    const macacoImgRef = useRef<HTMLImageElement>(null)
    const macacoColoredImgRef = useRef<HTMLImageElement>(null)
    const macacoContainerRef = useRef<HTMLDivElement>(null)

    // Trigger das animações quando o componente monta
    useEffect(() => {
        // Pequeno delay para garantir que a transição de tela terminou
        const timer = setTimeout(() => {
            setIsMounted(true)
        }, 100)
        return () => clearTimeout(timer)
    }, [])

    // Função para obter baseUrl (copiada do RocketScreen)
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

    // Imagens
    const enunciadoImg = normalizePath('assets/images/enunciado2.png')
    const vacaImg = normalizePath('assets/images/Vaca.png')
    const macacoImg = normalizePath('assets/images/Macaco.png')
    const sabiaImg = normalizePath('assets/images/Sabia.png')
    const macaco1Img = normalizePath('assets/images/macaco1.png')
    const macacoColoredImg = normalizePath('assets/images/macacocor.png')
    const macacoTopImg = normalizePath('assets/images/macacotop.png')
    const bgCapaImg = normalizePath('assets/images/bg-capa.png')

    // Handler para respostas
    const handleResposta = (opcao: string) => {
        if (opcao === 'Macaco') {
            // Resposta correta
            console.log('[QUIZ2] Resposta CORRETA: Macaco')
            setIsCorrectAnswer(true)
            
            // Após a animação de movimento do macaco (1.2s), mostrar o macaco colorido e o macaco top
            setTimeout(() => {
                setShowColoredMacaco(true)
                setShowMacacoTop(true)
            }, 1200) // 1.2s (animação de movimento do macaco)
            
            // Após mostrar o macaco colorido, navegar para ResultScreen
            setTimeout(() => {
                onNavigate('resultado', 'fade', 'right')
            }, 3000) // 3s após a resposta correta (1.2s animação + tempo para ver o resultado)
        }
        // Não faz nada nas outras
    }

    // Função para calcular e ajustar o scale do macaco
    const adjustMacacoScale = useCallback(() => {
        if (!quizSectionRef.current || !macacoImgRef.current || !macacoContainerRef.current) {
            return
        }

        const quizSection = quizSectionRef.current
        const macacoImg = macacoImgRef.current
        const macacoContainer = macacoContainerRef.current

        // Obter dimensões
        const quizRect = quizSection.getBoundingClientRect()
        const macacoRect = macacoImg.getBoundingClientRect()
        const containerRect = macacoContainer.getBoundingClientRect()

        // Calcular se há sobreposição
        // O macaco está sobrepondo se o topo da imagem está acima do bottom do quiz
        const macacoTop = macacoRect.top
        const quizBottom = quizRect.bottom

        // Se houver sobreposição, calcular o scale necessário
        if (macacoTop < quizBottom) {
            // Calcular quanto precisa reduzir
            const overlap = quizBottom - macacoTop
            const macacoHeight = macacoRect.height || 1
            const scaleReduction = Math.max(0.3, Math.min(1, 1 - (overlap / macacoHeight)))
            setMacacoScale(scaleReduction)
        } else {
            // Sem sobreposição, usar scale 1 (ou o máximo que cabe no container)
            const availableHeight = containerRect.height
            const naturalHeight = macacoImg.naturalHeight || macacoRect.height || availableHeight
            
            // Se a imagem natural é maior que o espaço disponível, calcular scale
            if (naturalHeight > availableHeight && availableHeight > 0) {
                const maxScale = availableHeight / naturalHeight
                setMacacoScale(Math.min(1, maxScale))
            } else {
                setMacacoScale(1)
            }
        }
    }, [])

    // Sincronizar dimensões do macaco colorido com o original
    useEffect(() => {
        const syncMacacoDimensions = () => {
            if (macacoImgRef.current && macacoColoredImgRef.current) {
                const original = macacoImgRef.current
                const colored = macacoColoredImgRef.current
                
                // Obter dimensões reais da imagem original (sem transform)
                const width = original.offsetWidth || original.naturalWidth
                const height = original.offsetHeight || original.naturalHeight
                
                // Aplicar as mesmas dimensões ao macaco colorido
                if (width > 0 && height > 0) {
                    colored.style.width = width + 'px'
                    colored.style.height = height + 'px'
                }
            }
        }

        // Sincronizar quando as imagens carregarem
        const originalImg = macacoImgRef.current
        const coloredImg = macacoColoredImgRef.current

        if (originalImg) {
            if (originalImg.complete) {
                setTimeout(syncMacacoDimensions, 100)
            } else {
                originalImg.addEventListener('load', () => {
                    setTimeout(syncMacacoDimensions, 100)
                })
            }
        }

        if (coloredImg) {
            if (coloredImg.complete) {
                setTimeout(syncMacacoDimensions, 100)
            } else {
                coloredImg.addEventListener('load', () => {
                    setTimeout(syncMacacoDimensions, 100)
                })
            }
        }

        // Sincronizar quando o macaco centralizar
        if (isCorrectAnswer) {
            setTimeout(syncMacacoDimensions, 100) // Imediato
            setTimeout(syncMacacoDimensions, 850) // Após a animação de centralização
        }

        // Sincronizar quando mostrar o macaco colorido
        if (showColoredMacaco) {
            setTimeout(syncMacacoDimensions, 50)
        }

        return () => {
            if (originalImg) {
                originalImg.removeEventListener('load', syncMacacoDimensions)
            }
            if (coloredImg) {
                coloredImg.removeEventListener('load', syncMacacoDimensions)
            }
        }
    }, [isMounted, isCorrectAnswer, showColoredMacaco])

    // Monitorar mudanças de tamanho e ajustar scale
    useEffect(() => {
        if (!isMounted) return

        // Ajustar quando a imagem carregar
        const macacoImg = macacoImgRef.current
        if (macacoImg) {
            if (macacoImg.complete) {
                adjustMacacoScale()
            } else {
                macacoImg.addEventListener('load', adjustMacacoScale)
            }
        }

        // Ajustar em resize e orientation change
        const handleResize = () => {
            setTimeout(adjustMacacoScale, 100)
        }

        window.addEventListener('resize', handleResize)
        window.addEventListener('orientationchange', handleResize)

        // Usar ResizeObserver para detectar mudanças nos elementos
        const resizeObserver = new ResizeObserver(() => {
            setTimeout(adjustMacacoScale, 50)
        })

        if (quizSectionRef.current) {
            resizeObserver.observe(quizSectionRef.current)
        }
        if (macacoContainerRef.current) {
            resizeObserver.observe(macacoContainerRef.current)
        }
        if (macacoImgRef.current) {
            resizeObserver.observe(macacoImgRef.current)
        }

        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('orientationchange', handleResize)
            if (macacoImg) {
                macacoImg.removeEventListener('load', adjustMacacoScale)
            }
            resizeObserver.disconnect()
        }
    }, [isMounted, adjustMacacoScale])

    return (
        <>
            <LandscapeBlocker />
            <div
                className="quiz1-container"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    width: '100vw',
                    backgroundImage: `url("${bgCapaImg}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    position: 'relative',
                    overflow: 'hidden',
                    padding: 0,
                    margin: 0
                }}
            >
            {/* Macaco Top - aparece no topo após centralização */}
            {showMacacoTop && (
                <img
                    src={macacoTopImg}
                    alt="Macaco Top"
                    className="quiz1-pelicano-top"
                    style={{
                        position: 'fixed',
                        top: 20,
                        left: '50%',
                        width: 'auto',
                        height: 'auto',
                        maxWidth: 'min(300px, 80vw)',
                        maxHeight: '20vh',
                        objectFit: 'contain',
                        zIndex: 20,
                        pointerEvents: 'none'
                    }}
                />
            )}
            {/* Seção do Quiz - 65% da altura */}
            <div
                ref={quizSectionRef}
                className={`quiz1-quiz-section ${isCorrectAnswer ? 'quiz1-quiz-exit' : ''}`}
                style={{
                    flex: '0 0 65%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    width: '100%',
                    paddingTop: 'clamp(20px, 4vh, 40px)',
                    paddingBottom: 'clamp(10px, 2vh, 20px)',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    pointerEvents: isCorrectAnswer ? 'none' : 'auto'
                }}
            >
                {/* Enunciado no topo */}
                <div 
                    className={
                        !isMounted ? 'quiz1-enunciado-initial' :
                        isCorrectAnswer ? 'quiz1-enunciado-exit' :
                        'quiz1-enunciado'
                    }
                    style={{ 
                        width: '90%', 
                        maxWidth: '500px',
                        marginBottom: 'clamp(16px, 3vh, 26px)'
                    }}
                >
                    <img
                        src={enunciadoImg}
                        alt="Enunciado"
                        style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                            margin: '0 auto',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                        }}
                    />
                </div>

                {/* Opções */}
                <div
                    className={`quiz1-options-wrapper ${isCorrectAnswer ? 'quiz1-options-exit' : ''}`}
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: 'clamp(16px, 2.5vh, 26px)',
                        width: '100%',
                        padding: '0 5%'
                    }}
                >
                {/* Vaca */}
                <button
                    type="button"
                    className={
                        !isMounted ? 'quiz1-option-initial' :
                        isCorrectAnswer ? 'quiz1-option-exit' :
                        'quiz1-option'
                    }
                    onClick={() => handleResposta('Vaca')}
                    disabled={isCorrectAnswer}
                    style={{
                        background: 'none',
                        border: 'none',
                        outline: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        width: '100%',
                        maxWidth: 'min(270px, 85vw)'
                    }}
                >
                    <img
                        src={vacaImg}
                        alt="Vaca"
                        style={{
                            width: '100%',
                            height: 'auto',
                            borderRadius: 18,
                            boxShadow: '0 3px 12px rgba(40,40,40,0.07)'
                        }}
                    />
                </button>
                {/* Macaco (correta) */}
                <button
                    type="button"
                    className={
                        !isMounted ? 'quiz1-option-initial' :
                        isCorrectAnswer ? 'quiz1-option-exit' :
                        'quiz1-option'
                    }
                    onClick={() => handleResposta('Macaco')}
                    disabled={isCorrectAnswer}
                    style={{
                        background: 'none',
                        border: 'none',
                        outline: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        width: '100%',
                        maxWidth: 'min(270px, 85vw)'
                    }}
                >
                    <img
                        src={macacoImg}
                        alt="Macaco"
                        style={{
                            width: '100%',
                            height: 'auto',
                            borderRadius: 18,
                            boxShadow: '0 3px 12px rgba(40,40,40,0.07)'
                        }}
                    />
                </button>
                {/* Sabia */}
                <button
                    type="button"
                    className={
                        !isMounted ? 'quiz1-option-initial' :
                        isCorrectAnswer ? 'quiz1-option-exit' :
                        'quiz1-option'
                    }
                    onClick={() => handleResposta('Sabia')}
                    disabled={isCorrectAnswer}
                    style={{
                        background: 'none',
                        border: 'none',
                        outline: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        width: '100%',
                        maxWidth: 'min(270px, 85vw)'
                    }}
                >
                    <img
                        src={sabiaImg}
                        alt="Sabia"
                        style={{
                            width: '100%',
                            height: 'auto',
                            borderRadius: 18,
                            boxShadow: '0 3px 12px rgba(40,40,40,0.07)'
                        }}
                    />
                </button>
                </div>
            </div>

            {/* Seção do Macaco - 35% da altura */}
            <div 
                ref={macacoContainerRef}
                className={
                    !isMounted ? 'quiz1-pelicano-mascote-initial' :
                    isCorrectAnswer ? 'quiz1-pelicano-mascote quiz1-pelicano-center' :
                    'quiz1-pelicano-mascote'
                }
                style={{
                    flex: '0 0 35%',
                    width: '100%',
                    height: 'auto',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingBottom: 'clamp(12px, 2vh, 24px)',
                    overflow: 'hidden',
                    position: 'relative',
                    zIndex: isCorrectAnswer ? 10 : 1
                }}
            >
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                        ref={macacoImgRef}
                        src={macaco1Img}
                        alt="Macaco Mascote"
                        className={isCorrectAnswer ? 'quiz1-pelicano-img-center' : ''}
                        style={{
                            height: 'auto',
                            width: 'auto',
                            maxHeight: isCorrectAnswer ? '80vh' : '100%',
                            maxWidth: isCorrectAnswer ? 'min(500px, 90vw)' : 'min(350px, 90vw)',
                            objectFit: 'contain',
                            transform: isCorrectAnswer ? 'scale(1)' : `scale(${macacoScale})`,
                            transformOrigin: 'center center',
                            transition: isCorrectAnswer ? 'transform 1.2s ease-out, max-height 1.2s ease-out, max-width 1.2s ease-out' : 'transform 0.3s ease-out',
                            display: 'block',
                            verticalAlign: 'top'
                        }}
                    />
                    {/* Macaco colorido sobreposto */}
                    <img
                        ref={macacoColoredImgRef}
                        src={macacoColoredImg}
                        alt="Macaco Colorido"
                        className={showColoredMacaco ? 'quiz1-pelicano-colored-fade-in' : 'quiz1-pelicano-colored-hidden'}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: 'auto',
                            width: 'auto',
                            maxHeight: isCorrectAnswer ? '80vh' : '100%',
                            maxWidth: isCorrectAnswer ? 'min(500px, 90vw)' : 'min(350px, 90vw)',
                            objectFit: 'contain',
                            objectPosition: 'center',
                            transform: isCorrectAnswer ? 'scale(1)' : `scale(${macacoScale})`,
                            transformOrigin: 'center center',
                            pointerEvents: 'none',
                            transition: 'transform 1.2s ease-out, opacity 1.2s ease-in-out'
                        }}
                    />
                </div>
            </div>
        </div>
        </>
    )
}

export default Quiz2

