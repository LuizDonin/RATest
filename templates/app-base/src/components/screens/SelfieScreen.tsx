import React, { useEffect, useRef, useState } from 'react'
import type { ScreenType } from '../../types/screens'
import '../../styles/selfie-screen.css'

interface SelfieScreenProps {
    onNavigate: (screen: ScreenType) => void
}

export const SelfieScreen: React.FC<SelfieScreenProps> = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const mediaStreamRef = useRef<MediaStream | null>(null)
    const topImageRef = useRef<HTMLImageElement | null>(null)
    const bottomImageRef = useRef<HTMLImageElement | null>(null)
    const [isCapturing, setIsCapturing] = useState(false)

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

    const topImage = normalizePath('assets/images/selfie-top.png')
    const bottomImage = normalizePath('assets/images/selfie-bottom.png')
    const cameraIcon = normalizePath('assets/images/camera-icon.png')

    // Setup camera
    useEffect(() => {
        async function setupCamera() {
            try {
                // Verificar se já existe vídeo
                let video = document.getElementById('selfie-video') as HTMLVideoElement
                if (video && video.srcObject) {
                    video.classList.add('selfie-video-visible')
                    videoRef.current = video
                    return
                }

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: { ideal: 'user' } // Câmera frontal para selfie
                    },
                    audio: false
                })

                if (!video) {
                    video = document.createElement('video')
                    video.setAttribute('id', 'selfie-video')
                    video.setAttribute('playsinline', '')
                    video.setAttribute('autoplay', '')
                    video.muted = true
                    video.style.position = 'fixed'
                    video.style.top = '0'
                    video.style.left = '0'
                    video.style.width = '100vw'
                    video.style.height = '100vh'
                    video.style.objectFit = 'cover'
                    video.style.zIndex = '0'
                    video.classList.add('selfie-video-visible')
                    document.body.appendChild(video)
                }

                video.srcObject = stream
                mediaStreamRef.current = stream
                videoRef.current = video

                await video.play()
            } catch (err) {
                console.error('Erro ao inicializar câmera:', err)
            }
        }

        setupCamera()

        return () => {
            // Não limpar aqui - deixar o vídeo para ser usado
        }
    }, [])

    // Carregar imagens top e bottom
    useEffect(() => {
        const loadImages = () => {
            // Carregar top image
            const topImg = new Image()
            topImg.crossOrigin = 'anonymous'
            topImg.onload = () => {
                topImageRef.current = topImg
            }
            topImg.onerror = () => {
                console.warn('Erro ao carregar imagem top')
            }
            topImg.src = topImage

            // Carregar bottom image
            const bottomImg = new Image()
            bottomImg.crossOrigin = 'anonymous'
            bottomImg.onload = () => {
                bottomImageRef.current = bottomImg
            }
            bottomImg.onerror = () => {
                console.warn('Erro ao carregar imagem bottom')
            }
            bottomImg.src = bottomImage
        }

        loadImages()
    }, [topImage, bottomImage])

    // Capturar foto com overlays
    const capturePhoto = async () => {
        if (!videoRef.current || isCapturing) return

        setIsCapturing(true)

        try {
            const video = videoRef.current
            const canvas = document.createElement('canvas')

            // Usar dimensões da tela para capturar tudo
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            const ctx = canvas.getContext('2d')

            if (!ctx) {
                setIsCapturing(false)
                return
            }

            // Desenhar vídeo no canvas (preencher toda a tela)
            const videoAspectRatio = (video.videoWidth || video.clientWidth) / (video.videoHeight || video.clientHeight)
            const canvasAspectRatio = canvas.width / canvas.height

            let drawWidth = canvas.width
            let drawHeight = canvas.height
            let drawX = 0
            let drawY = 0

            if (videoAspectRatio > canvasAspectRatio) {
                // Vídeo é mais largo, ajustar altura
                drawHeight = canvas.width / videoAspectRatio
                drawY = (canvas.height - drawHeight) / 2
            } else {
                // Vídeo é mais alto, ajustar largura
                drawWidth = canvas.height * videoAspectRatio
                drawX = (canvas.width - drawWidth) / 2
            }

            ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight)

            // Aguardar carregamento das imagens se necessário
            const waitForImages = () => {
                return new Promise<void>((resolve) => {
                    if (topImageRef.current && bottomImageRef.current) {
                        resolve()
                    } else {
                        const checkInterval = setInterval(() => {
                            if (topImageRef.current && bottomImageRef.current) {
                                clearInterval(checkInterval)
                                resolve()
                            }
                        }, 50)
                        // Timeout após 2 segundos
                        setTimeout(() => {
                            clearInterval(checkInterval)
                            resolve()
                        }, 2000)
                    }
                })
            }

            await waitForImages()

            // Desenhar top overlay
            if (topImageRef.current) {
                const topImg = topImageRef.current
                const topAspectRatio = topImg.naturalWidth / topImg.naturalHeight
                const topHeight = canvas.width / topAspectRatio
                ctx.drawImage(topImg, 0, 0, canvas.width, topHeight)
            }

            // Desenhar bottom overlay
            if (bottomImageRef.current) {
                const bottomImg = bottomImageRef.current
                const bottomAspectRatio = bottomImg.naturalWidth / bottomImg.naturalHeight
                const bottomHeight = canvas.width / bottomAspectRatio
                ctx.drawImage(
                    bottomImg,
                    0,
                    canvas.height - bottomHeight,
                    canvas.width,
                    bottomHeight
                )
            }

            // Converter para blob e compartilhar
            canvas.toBlob(async (blob) => {
                if (blob) {
                    try {
                        // Verificar se Web Share API está disponível
                        if (navigator.share && navigator.canShare) {
                            const file = new File([blob], `selfie-${Date.now()}.png`, { type: 'image/png' })

                            if (navigator.canShare({ files: [file] })) {
                                await navigator.share({
                                    files: [file],
                                    title: 'Minha Selfie',
                                    text: 'Confira minha selfie!'
                                })
                            } else {
                                // Fallback: compartilhar via URL
                                const url = URL.createObjectURL(blob)
                                await navigator.share({
                                    title: 'Minha Selfie',
                                    text: 'Confira minha selfie!',
                                    url: url
                                })
                                URL.revokeObjectURL(url)
                            }
                        } else {
                            // Fallback para navegadores sem Web Share API: fazer download
                            const url = URL.createObjectURL(blob)
                            const link = document.createElement('a')
                            link.href = url
                            link.download = `selfie-${Date.now()}.png`
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                            URL.revokeObjectURL(url)
                        }
                    } catch (err) {
                        // Se o usuário cancelar o compartilhamento, não fazer nada
                        if (err instanceof Error && err.name !== 'AbortError') {
                            console.error('Erro ao compartilhar:', err)
                            // Fallback: fazer download
                            const url = URL.createObjectURL(blob)
                            const link = document.createElement('a')
                            link.href = url
                            link.download = `selfie-${Date.now()}.png`
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                            URL.revokeObjectURL(url)
                        }
                    }
                }
                setIsCapturing(false)
            }, 'image/png')
        } catch (err) {
            console.error('Erro ao capturar foto:', err)
            setIsCapturing(false)
        }
    }

    return (
        <div className="selfie-screen">
            {/* Video element será criado dinamicamente */}

            {/* Top overlay */}
            <div className="selfie-top-overlay">
                <img
                    src={topImage}
                    alt="Top"
                    className="selfie-top-img"
                />
            </div>

            {/* Bottom overlay */}
            <div className="selfie-bottom-overlay">
                <img
                    src={bottomImage}
                    alt="Bottom"
                    className="selfie-bottom-img"
                />
            </div>

            {/* Camera button */}
            <button
                className="selfie-camera-button"
                onClick={capturePhoto}
                disabled={isCapturing}
                style={{
                    backgroundImage: `url(${cameraIcon})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                }}
            />
        </div>
    )
}

