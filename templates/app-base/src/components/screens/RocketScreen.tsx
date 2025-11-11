import React, { useState, useEffect } from 'react'
import type { ScreenType, TransitionType, TransitionDirection } from '../../types/screens'
import '../../styles/rocket-screen.css'

interface RocketScreenProps {
    onNavigate: (screen: ScreenType, transition?: TransitionType, direction?: TransitionDirection) => void
    title?: string
    subtitle?: string
    backgroundImage?: string
}

export const RocketScreen: React.FC<RocketScreenProps> = ({
    onNavigate,
    backgroundImage
}) => {
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState(1)
    // Estado para armazenar qual peça está selecionada para cada parte (0 = nenhuma, 1, 2 ou 3)
    // Ponta sempre começa com 01 (não pode ser 0)
    const [selectedPieces, setSelectedPieces] = useState({
        ponta: 1,
        corpo: 0,
        janela: 0,
        asa: 0,
        jato: 0
    })

    // Mapeamento de abas para partes do foguete
    const tabToPart: Record<number, 'ponta' | 'corpo' | 'janela' | 'asa' | 'jato'> = {
        1: 'ponta',
        2: 'corpo',
        3: 'janela',
        4: 'asa',
        5: 'jato'
    }
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

    const bgImage = backgroundImage || normalizePath('assets/images/bg-capa.png')
    const fogueteTopImage = normalizePath('assets/images/foguete-top.png')
    const fogueteBottomImage = normalizePath('assets/images/foguete-bottom.png')
    const fogueteMontagemImage = normalizePath('assets/images/foguete-montagem.png')
    const btnJogarFogueteImage = normalizePath('assets/images/btn-jogar-foguete.png')
    const btnJogarFogueteDisableImage = normalizePath('assets/images/btn-jogar-foguete-disable.png')
    const btnNextImage = normalizePath('assets/images/btn-next.png')
    const btnBackImage = normalizePath('assets/images/btn-back.png')

    // Função para obter o caminho da peça baseado na parte e número
    const getPieceImage = (part: 'ponta' | 'corpo' | 'janela' | 'asa' | 'jato', pieceNumber: number) => {
        if (pieceNumber === 0) return null // Nenhuma peça selecionada
        const pieceNumberStr = pieceNumber.toString().padStart(2, '0')
        return normalizePath(`assets/images/pecas/${part}/${pieceNumberStr}.png`)
    }

    // Obter imagens das peças baseado no estado (retorna null se não houver peça selecionada)
    const ponta = getPieceImage('ponta', selectedPieces.ponta)
    const corpo = getPieceImage('corpo', selectedPieces.corpo)
    const janela = getPieceImage('janela', selectedPieces.janela)
    const asa = getPieceImage('asa', selectedPieces.asa)
    const jato = getPieceImage('jato', selectedPieces.jato)

    // Função para obter a imagem da aba
    const getTabImage = (tabNumber: number) => {
        const isActive = activeTab === tabNumber
        const suffix = isActive ? '' : '-disable'
        return normalizePath(`assets/images/abas/0${tabNumber}${suffix}.png`)
    }

    const handleTabClick = (tabNumber: number) => {
        setActiveTab(tabNumber)
        const part = tabToPart[tabNumber]
        const currentPiece = selectedPieces[part]

        // Se a peça estiver em 0 (vazio), automaticamente colocar em 01
        // Exceto para ponta que sempre deve ter pelo menos 01
        if (currentPiece === 0 && part !== 'ponta') {
            setSelectedPieces(prev => ({
                ...prev,
                [part]: 1
            }))
        }
    }

    const handleNext = () => {
        const currentPart = tabToPart[activeTab]
        const currentPiece = selectedPieces[currentPart]

        if (currentPiece === 0) {
            // Se não há peça selecionada, começar com a primeira
            setSelectedPieces(prev => ({
                ...prev,
                [currentPart]: 1
            }))
        } else if (currentPiece < 3) {
            setSelectedPieces(prev => ({
                ...prev,
                [currentPart]: currentPiece + 1
            }))
        }
    }

    const handleBack = () => {
        const currentPart = tabToPart[activeTab]
        const currentPiece = selectedPieces[currentPart]

        // Só pode voltar se estiver acima de 1 (não pode voltar para 0)
        // Ponta nunca pode voltar, sempre deve ter pelo menos 01
        if (currentPiece > 1 && currentPart !== 'ponta') {
            setSelectedPieces(prev => ({
                ...prev,
                [currentPart]: currentPiece - 1
            }))
        }
    }

    // Verificar se pode navegar para frente/trás nas peças
    const currentPart = tabToPart[activeTab]
    const currentPiece = selectedPieces[currentPart]
    const canGoNext = currentPiece < 3
    // Não pode voltar para 0, e ponta nunca pode voltar (sempre deve ter pelo menos 01)
    const canGoBack = currentPiece > 1 && currentPart !== 'ponta'

    // Obter imagem de preview da peça selecionada (null se não houver)
    const previewImage = currentPiece > 0 ? getPieceImage(currentPart, currentPiece) : null

    // Verificar se todas as peças estão selecionadas (todas > 0)
    const allPiecesSelected = selectedPieces.ponta > 0 &&
        selectedPieces.corpo > 0 &&
        selectedPieces.janela > 0 &&
        selectedPieces.asa > 0 &&
        selectedPieces.jato > 0

    // Pré-carregar todas as imagens
    useEffect(() => {
        const loadImages = async () => {
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

            const images = [
                '/assets/images/foguete-top.png',
                '/assets/images/foguete-bottom.png',
                '/assets/images/foguete-montagem.png',
                '/assets/images/btn-jogar-foguete.png',
                '/assets/images/btn-jogar-foguete-disable.png',
                '/assets/images/btn-next.png',
                '/assets/images/btn-back.png',
                '/assets/images/pecas/ponta/01.png',
                '/assets/images/pecas/ponta/02.png',
                '/assets/images/pecas/ponta/03.png',
                '/assets/images/pecas/corpo/01.png',
                '/assets/images/pecas/corpo/02.png',
                '/assets/images/pecas/corpo/03.png',
                '/assets/images/pecas/janela/01.png',
                '/assets/images/pecas/janela/02.png',
                '/assets/images/pecas/janela/03.png',
                '/assets/images/pecas/asa/01.png',
                '/assets/images/pecas/asa/02.png',
                '/assets/images/pecas/asa/03.png',
                '/assets/images/pecas/jato/01.png',
                '/assets/images/pecas/jato/02.png',
                '/assets/images/pecas/jato/03.png',
                '/assets/images/abas/01.png',
                '/assets/images/abas/02.png',
                '/assets/images/abas/03.png',
                '/assets/images/abas/04.png',
                '/assets/images/abas/05.png',
                '/assets/images/abas/01-disable.png',
                '/assets/images/abas/02-disable.png',
                '/assets/images/abas/03-disable.png',
                '/assets/images/abas/04-disable.png',
                '/assets/images/abas/05-disable.png'
            ]

            try {
                const loadPromises = images.map((imagePath) => {
                    return new Promise<void>((resolve) => {
                        const img = new Image()
                        img.onload = () => resolve()
                        img.onerror = () => {
                            console.warn(`Failed to load image: ${imagePath}`)
                            resolve() // Continuar mesmo se falhar
                        }
                        img.src = normalizePath(imagePath)
                    })
                })

                await Promise.all(loadPromises)
                setIsLoading(false)
            } catch (error) {
                console.error('Erro ao carregar imagens:', error)
                setIsLoading(false) // Continuar mesmo com erro
            }
        }

        loadImages()
    }, [])

    // Mostrar overlay de carregamento enquanto as imagens não estiverem carregadas
    if (isLoading) {
        return (
            <div className="rocket-screen rocket-loading-overlay">
                <div className="rocket-loading-content">
                    <div className="rocket-loading-spinner"></div>
                    <p className="rocket-loading-text">Carregando...</p>
                </div>
            </div>
        )
    }

    return (
        <div
            className="rocket-screen"
            style={{
                backgroundImage: `url("${bgImage}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Foguete Top */}
            <div className="rocket-top-image">
                <img
                    src={fogueteTopImage}
                    alt="Foguete Top"
                    className="rocket-top-img"
                />
            </div>

            {/* Sistema de Abas */}
            <div className="rocket-tabs-container">
                {[1, 2, 3, 4, 5].map((tabNumber) => (
                    <button
                        key={tabNumber}
                        className={`rocket-tab ${activeTab === tabNumber ? 'active' : ''}`}
                        onClick={() => handleTabClick(tabNumber)}
                        style={{
                            backgroundImage: `url("${getTabImage(tabNumber)}")`,
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center'
                        }}
                    />
                ))}
            </div>

            {/* Foguete Montagem - Centro */}
            <div className="rocket-montagem-container">
                <img
                    src={fogueteMontagemImage}
                    alt="Foguete Montagem"
                    className="rocket-montagem-img"
                />

                {ponta && (
                    <img
                        src={ponta}
                        alt="Ponta"
                        className="rocket-ponta"
                    />
                )}
                {corpo && (
                    <img
                        src={corpo}
                        alt="Corpo"
                        className="rocket-corpo"
                    />
                )}
                {janela && (
                    <img
                        src={janela}
                        alt="Janela"
                        className="rocket-janela"
                    />
                )}
                {asa && (
                    <img
                        src={asa}
                        alt="Asa"
                        className="rocket-asa"
                    />
                )}
                {jato && (
                    <img
                        src={jato}
                        alt="Jato"
                        className="rocket-jato"
                    />
                )}
            </div>

            {/* Foguete Bottom com Botões */}
            <div className="rocket-bottom-image">
                <img
                    src={fogueteBottomImage}
                    alt="Foguete Bottom"
                    className="rocket-bottom-img"
                />
                {/* Preview da Peça Selecionada */}
                {previewImage && (
                    <div className="rocket-preview-container">
                        <img
                            src={previewImage}
                            alt={`Preview ${currentPart}`}
                            className="rocket-preview-image"
                        />
                    </div>
                )}

                {/* Botões Next e Back */}
                <div className="rocket-navigation-buttons">
                    <button
                        className="rocket-button-back"
                        onClick={handleBack}
                        disabled={!canGoBack}
                        style={{
                            backgroundImage: `url("${btnBackImage}")`,
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center'
                        }}
                    />
                    <button
                        className="rocket-button-jogar"
                        onClick={() => {
                            // Salvar peças selecionadas no localStorage antes de navegar
                            try {
                                localStorage.setItem('rocket-pieces', JSON.stringify(selectedPieces))
                                console.log('✅ Peças do foguete salvas:', selectedPieces)
                            } catch (e) {
                                console.error('❌ Erro ao salvar peças do foguete:', e)
                            }
                            onNavigate('tutorial2', 'fade', 'right')
                        }}
                        disabled={!allPiecesSelected}
                        style={{
                            backgroundImage: `url("${allPiecesSelected ? btnJogarFogueteImage : btnJogarFogueteDisableImage}")`,
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center'
                        }}
                    />
                    <button
                        className="rocket-button-next"
                        onClick={handleNext}
                        disabled={!canGoNext}
                        style={{
                            backgroundImage: `url("${btnNextImage}")`,
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center'
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

