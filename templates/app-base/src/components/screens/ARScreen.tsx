import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { FaceTracker } from '../FaceTracker'
import { ARSceneAFrame } from '../ARSceneAFrame'
import { useRA } from '../../contexts/RAContext'
import type { ScreenType, TransitionType, TransitionDirection } from '../../types/screens'
import '../../styles/ar-screen.css'

interface ARScreenProps {
  onNavigate: (screen: ScreenType, transition?: TransitionType, direction?: TransitionDirection) => void
  title?: string
  subtitle?: string
  backgroundImage?: string
}

interface FallingObject {
  id: string
  type: 'star' | 'comet'
  x: number
  y: number
  speed: number
}

export const ARScreen: React.FC<ARScreenProps> = ({
  onNavigate
}) => {
  const { raData } = useRA()
  const config = raData?.configuracoes || {}
  const usarAFrame = config.usarAFrame !== false
  const usarVideo = config.usarVideo !== false
  const usarFaceTracking = config.usarFaceTracking !== false

  const gameCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60) // 1 minuto em segundos
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [progress, setProgress] = useState(0)
  const [feedback, setFeedback] = useState<'acerto' | 'erro' | null>(null)
  const [arLoading, setArLoading] = useState(true)
  const [countdown, setCountdown] = useState<number | null>(null)

  const fallingObjectsRef = useRef<FallingObject[]>([])
  const navePositionRef = useRef({ x: 0.5, y: 0.5 })
  const faceDetectedRef = useRef(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  // Mostrar vídeo - usar o vídeo global (se habilitado)
  useEffect(() => {
    if (!usarVideo) {
      setArLoading(false)
      return
    }

    async function setupCamera() {
      try {
        // Usar o vídeo global que já foi criado
        const video = document.getElementById('arjs-video') as HTMLVideoElement
        if (!video || !video.srcObject) {
          console.warn('Vídeo global não encontrado, aguardando...')
          await new Promise(resolve => setTimeout(resolve, 1000))
          const retryVideo = document.getElementById('arjs-video') as HTMLVideoElement
          if (!retryVideo || !retryVideo.srcObject) {
            console.error('Vídeo ainda não disponível')
            setArLoading(false)
            return
          }
        }

        const videoElement = video || (document.getElementById('arjs-video') as HTMLVideoElement)
        if (videoElement && videoElement.srcObject) {
          // Vídeo já existe, apenas mostrar
          videoElement.classList.add('ar-video-visible')
          videoRef.current = videoElement
          mediaStreamRef.current = videoElement.srcObject as MediaStream

          setArLoading(false)
        } else {
          console.error('Vídeo não tem stream')
          setArLoading(false)
        }
      } catch (err) {
        console.error('Erro ao configurar câmera:', err)
        setArLoading(false)
      }
    }

    setupCamera()

    return () => {
      // Não limpar aqui - deixar o vídeo para o FaceTracker
    }
  }, [usarVideo])

  // Contagem regressiva após loading
  useEffect(() => {
    if (!arLoading && !gameStarted && countdown === null) {
      setCountdown(3)
    }
  }, [arLoading, gameStarted, countdown])

  useEffect(() => {
    if (countdown === null || countdown <= 0) {
      if (countdown === 0) {
        // "Vai!" - iniciar jogo
        setTimeout(() => {
          setCountdown(null)
          setGameStarted(true)
        }, 500)
      }
      return
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown])

  // Get base URL
  const getBaseUrl = () => {
    const base = (import.meta as any)?.env?.BASE_URL || (document?.baseURI ? new URL(document.baseURI).pathname : '/')
    const b = base && base !== '/' ? (base.endsWith('/') ? base : base + '/') : '/'
    return b === '/' ? '' : b.endsWith('/') ? b.slice(0, -1) : b
  }

  const baseUrl = useMemo(() => getBaseUrl(), [])
  const normalizePath = useCallback((path: string) => {
    if (baseUrl === '') {
      return path.startsWith('/') ? path : `/${path}`
    }
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    return `${baseUrl}/${cleanPath}`
  }, [baseUrl])

  const images = useMemo(() => ({
    nave: normalizePath('assets/images/sprites/nave.png'),
    estrela: normalizePath('assets/images/sprites/estrela.png'),
    cometa: normalizePath('assets/images/sprites/cometa.png'),
    barraProgresso: normalizePath('assets/images/sprites/barra-progresso.png'),
    contador: normalizePath('assets/images/sprites/contador.png'),
    feedbackAcerto: normalizePath('assets/images/sprites/feedback-acerto.png'),
    feedbackErro: normalizePath('assets/images/sprites/feedback-erro.png'),
    bgAcerto: normalizePath('assets/images/bg_acerto.png'),
    bgErro: normalizePath('assets/images/bg_erro.png'),
    estrelaProgresso: normalizePath('assets/images/estrela-progresso.png'),
  }), [normalizePath])

  const imagesLoadedRef = useRef<Record<string, HTMLImageElement>>({})
  const [rocketPieces, setRocketPieces] = useState<{
    ponta: number
    corpo: number
    janela: number
    asa: number
    jato: number
  } | null>(null)
  const rocketPiecesImagesRef = useRef<Record<string, HTMLImageElement>>({})

  // Carregar peças do foguete do localStorage
  useEffect(() => {
    try {
      const savedPieces = localStorage.getItem('rocket-pieces')
      if (savedPieces) {
        const pieces = JSON.parse(savedPieces)
        setRocketPieces(pieces)
        console.log('✅ Peças do foguete carregadas:', pieces)
      } else {
        console.warn('⚠️ Nenhuma peça do foguete encontrada no localStorage, usando nave padrão')
      }
    } catch (e) {
      console.error('❌ Erro ao carregar peças do foguete:', e)
    }
  }, [])

  // Carregar imagens das peças do foguete
  useEffect(() => {
    if (!rocketPieces) return

    const loadRocketPieces = async () => {
      const pieces = rocketPieces
      const parts: Array<'ponta' | 'corpo' | 'janela' | 'asa' | 'jato'> = ['ponta', 'corpo', 'janela', 'asa', 'jato']

      const promises = parts.map((part) => {
        const pieceNumber = pieces[part]
        if (pieceNumber === 0) return Promise.resolve() // Pular se não houver peça

        const pieceNumberStr = pieceNumber.toString().padStart(2, '0')
        const src = normalizePath(`assets/images/pecas/${part}/${pieceNumberStr}.png`)
        const key = `rocket-${part}-${pieceNumberStr}`

        return new Promise<void>((resolve) => {
          const img = new Image()
          img.onload = () => {
            rocketPiecesImagesRef.current[key] = img
            resolve()
          }
          img.onerror = () => {
            console.warn(`Failed to load rocket piece: ${src}`)
            resolve()
          }
          img.src = src
        })
      })

      await Promise.all(promises)
      console.log('✅ Todas as peças do foguete carregadas')
    }

    loadRocketPieces()
  }, [rocketPieces, normalizePath])

  // Carregar imagens
  useEffect(() => {
    const loadImages = async () => {
      const promises = Object.entries(images).map(([key, src]) => {
        return new Promise<void>((resolve) => {
          const img = new Image()
          img.onload = () => {
            imagesLoadedRef.current[key] = img
            resolve()
          }
          img.onerror = () => {
            console.warn(`Failed to load image: ${src}`)
            resolve()
          }
          img.src = src
        })
      })
      await Promise.all(promises)
      // Não setar gameStarted aqui - será setado após countdown
    }
    loadImages()
  }, [images])

  // Timer
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [gameStarted, gameOver])

  // Detectar posição do nariz através do evento customizado do FaceTracker
  useEffect(() => {
    const handleNosePosition = (event: CustomEvent<{ x: number; y: number; detected: boolean }>) => {
      const { x, y, detected } = event.detail
      faceDetectedRef.current = detected
      if (detected) {
        navePositionRef.current = { x, y }
      }
    }

    window.addEventListener('nave-position' as any, handleNosePosition as EventListener)
    return () => {
      window.removeEventListener('nave-position' as any, handleNosePosition as EventListener)
    }
  }, [])

  // Criar objetos caindo
  const createFallingObject = useCallback(() => {
    const type = Math.random() > 0.5 ? 'star' : 'comet'
    const obj: FallingObject = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: Math.random() * 0.8 + 0.1, // Entre 10% e 90% da largura
      y: -0.1, // Começa acima da tela
      speed: 0.0035 + Math.random() * 0.003 // Velocidade ajustada (um pouco mais rápido que 0.002)
    }
    fallingObjectsRef.current.push(obj)
  }, [])

  // Spawn de objetos
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const spawnInterval = setInterval(() => {
      createFallingObject()
    }, 1000) // Spawn a cada 1 segundo

    return () => clearInterval(spawnInterval)
  }, [gameStarted, gameOver, createFallingObject])

  // Detectar colisões
  const checkCollisions = useCallback(() => {
    const nave = navePositionRef.current
    const naveRadius = 0.08 // Raio de colisão da nave (aumentado proporcionalmente)

    fallingObjectsRef.current = fallingObjectsRef.current.filter((obj) => {
      const dx = obj.x - nave.x
      const dy = obj.y - nave.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < naveRadius + 0.03) {
        // Colisão detectada
        if (obj.type === 'star') {
          setScore((prev) => prev + 10)
          setProgress((prev) => Math.min(100, prev + 5))
          setFeedback('acerto')
          setTimeout(() => setFeedback(null), 500)
        } else {
          setScore((prev) => Math.max(0, prev - 5))
          setProgress((prev) => Math.max(0, prev - 5))
          setFeedback('erro')
          setTimeout(() => setFeedback(null), 500)
        }
        return false // Remove objeto
      }

      // Remove se saiu da tela
      if (obj.y > 1.1) {
        return false
      }

      return true
    })
  }, [])

  // Adicionar elementos do A-Frame Scene (skybox, câmera, luzes, objetos)
  useEffect(() => {
    if (!usarAFrame || !gameStarted || gameOver) return

    const sceneEl = document.querySelector('a-scene#ar-scene-main') as any
    if (!sceneEl) {
      console.warn('A-Frame Scene não encontrado')
      return
    }

    // Adicionar assets (sky texture)
    let assets = sceneEl.querySelector('a-assets')
    if (!assets) {
      assets = document.createElement('a-assets')
      const skyImg = document.createElement('img')
      skyImg.id = 'skyTexture'
      const base = (import.meta as any)?.env?.BASE_URL || (document?.baseURI ? new URL(document.baseURI).pathname : '/')
      const normalizePath = (path: string) => {
        if (!base || base === '/') return path.startsWith('/') ? path : `/${path}`
        const b = base.endsWith('/') ? base : base + '/'
        return path.startsWith('/') ? b + path.slice(1) : b + path
      }
      skyImg.src = normalizePath('assets/images/SKY.jpg')
      skyImg.setAttribute('crossorigin', 'anonymous')
      assets.appendChild(skyImg)
      sceneEl.appendChild(assets)
    }

    // Adicionar skybox
    let sky = sceneEl.querySelector('a-sky')
    if (!sky) {
      sky = document.createElement('a-sky')
      sky.setAttribute('rotation', '0 -90 0')
      sky.setAttribute('material', 'src: #skyTexture; opacity: 0.5; transparent: true')
      sceneEl.appendChild(sky)
    }

    // Adicionar câmera
    let camera = document.getElementById('camera')
    if (!camera) {
      camera = document.createElement('a-entity')
      camera.id = 'camera'
      camera.setAttribute('camera', 'active: true')
      camera.setAttribute('look-controls', 'enabled: true; reverseMouseDrag: false; touchEnabled: true; magicWindowTrackingEnabled: true; pointerLockEnabled: false; touchSensitivity: 1; mouseSensitivity: 1')
      camera.setAttribute('wasd-controls', 'enabled: false')
      camera.setAttribute('position', '0 1.6 0')
      sceneEl.appendChild(camera)
    }

    // Adicionar luzes
    let ambientLight = sceneEl.querySelector('#ambient-light')
    if (!ambientLight) {
      ambientLight = document.createElement('a-entity')
      ambientLight.id = 'ambient-light'
      ambientLight.setAttribute('light', 'type: ambient; color: #888')
      sceneEl.appendChild(ambientLight)
    }

    let directionalLight = sceneEl.querySelector('#directional-light')
    if (!directionalLight) {
      directionalLight = document.createElement('a-entity')
      directionalLight.id = 'directional-light'
      directionalLight.setAttribute('light', 'type: directional; color: #fff; intensity: 0.6')
      directionalLight.setAttribute('position', '1 1 1')
      sceneEl.appendChild(directionalLight)
    }

    // Adicionar head-cube (seguir rotação da cabeça)
    let headCube = document.getElementById('head-cube')
    if (!headCube) {
      headCube = document.createElement('a-entity')
      headCube.id = 'head-cube'
      headCube.setAttribute('geometry', 'primitive: box; width: 0.3; height: 0.3; depth: 0.3')
      headCube.setAttribute('material', 'color: #FF6B6B; opacity: 0; transparent: true')
      headCube.setAttribute('position', '0 1 -1.2')
      headCube.setAttribute('rotation', '0 0 0')
      sceneEl.appendChild(headCube)
    }

    // Limpar objetos quando o jogo terminar
    return () => {
      // Remover elementos quando o jogo terminar
      const cube = document.getElementById('head-cube')
      if (cube) {
        cube.remove()
      }
      const skyEl = sceneEl.querySelector('a-sky')
      if (skyEl) {
        skyEl.remove()
      }
      const cameraEl = document.getElementById('camera')
      if (cameraEl) {
        cameraEl.remove()
      }
      const ambientLightEl = sceneEl.querySelector('#ambient-light')
      if (ambientLightEl) {
        ambientLightEl.remove()
      }
      const directionalLightEl = sceneEl.querySelector('#directional-light')
      if (directionalLightEl) {
        directionalLightEl.remove()
      }
      const assetsEl = sceneEl.querySelector('a-assets')
      if (assetsEl) {
        assetsEl.remove()
      }
    }
  }, [gameStarted, gameOver])

  // Loop do jogo
  useEffect(() => {
    if (!gameStarted || gameOver) return

    // ARScreen cria seu próprio canvas 2D para o jogo - funciona independentemente
    let canvas = gameCanvasRef.current
    if (!canvas) {
      canvas = document.createElement('canvas')
      canvas.id = 'ar-game-canvas'
      canvas.className = 'ar-game-canvas'
      canvas.style.position = 'fixed'
      canvas.style.top = '0'
      canvas.style.left = '0'
      canvas.style.width = '100vw'
      canvas.style.height = '100vh'
      canvas.style.zIndex = '9999' // Abaixo do A-Frame
      document.body.appendChild(canvas)
      gameCanvasRef.current = canvas
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('Não foi possível criar contexto 2D')
      return
    }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const gameLoop = () => {
      if (!ctx) return

      // Limpar canvas antes de desenhar tudo
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Atualizar posição dos objetos
      fallingObjectsRef.current.forEach((obj) => {
        obj.y += obj.speed
      })

      // Desenhar nave (mesma posição da máscara/nariz)
      const naveX = navePositionRef.current.x * canvas.width
      const naveY = navePositionRef.current.y * canvas.height
      const naveSize = canvas.width * 0.15 // Tamanho reduzido das peças

      // Se houver peças do foguete montadas, desenhar as peças combinadas
      if (rocketPieces && Object.keys(rocketPiecesImagesRef.current).length > 0) {
        const pieces = rocketPieces
        const parts: Array<'ponta' | 'corpo' | 'janela' | 'asa' | 'jato'> = ['ponta', 'corpo', 'janela', 'asa', 'jato']

        // Escalas individuais para cada peça
        const pieceScales: Record<string, number> = {
          ponta: 1,    // Ponta menor
          corpo: 1.0,    // Corpo tamanho padrão
          janela: 0.7,   // Janela menor
          asa: 1.7,      // Asa maior
          jato: 0.9      // Jato um pouco maior
        }

        // Desenhar cada peça na ordem correta (de baixo para cima)
        parts.forEach((part) => {
          const pieceNumber = pieces[part]
          if (pieceNumber === 0) return // Pular se não houver peça

          const pieceNumberStr = pieceNumber.toString().padStart(2, '0')
          const key = `rocket-${part}-${pieceNumberStr}`
          const pieceImg = rocketPiecesImagesRef.current[key]

          if (pieceImg) {
            // Escala individual da peça
            const pieceScale = pieceScales[part] || 1.0
            const baseWidth = naveSize * pieceScale

            // Calcular dimensões mantendo proporção original da imagem
            const imgAspectRatio = pieceImg.naturalHeight / pieceImg.naturalWidth
            const pieceWidth = baseWidth
            const pieceHeight = baseWidth * imgAspectRatio

            // Calcular offset baseado na parte (similar ao CSS da RocketScreen)
            let offsetY = 0
            switch (part) {
              case 'ponta':
                offsetY = -naveSize * 1.2 // Topo
                break
              case 'corpo':
                offsetY = -naveSize * 0.1 // Meio superior
                break
              case 'janela':
                offsetY = naveSize * -0.35 // Meio
                break
              case 'asa':
                offsetY = naveSize * 0.1 // Meio inferior
                break
              case 'jato':
                offsetY = naveSize * 1 // Base
                break
            }

            ctx.drawImage(
              pieceImg,
              naveX - pieceWidth / 2,
              naveY - pieceHeight / 2 + offsetY,
              pieceWidth,
              pieceHeight
            )
          }
        })
      } else {
        // Fallback: usar nave padrão se não houver peças montadas
        const naveImg = imagesLoadedRef.current.nave
        if (naveImg) {
          ctx.drawImage(
            naveImg,
            naveX - naveSize / 2,
            naveY - naveSize / 2,
            naveSize,
            naveSize
          )
        }
      }

      // Desenhar objetos caindo
      fallingObjectsRef.current.forEach((obj) => {
        const img = imagesLoadedRef.current[obj.type === 'star' ? 'estrela' : 'cometa']
        if (img) {
          const objX = obj.x * canvas.width
          const objY = obj.y * canvas.height
          const objSize = canvas.width * 0.12 // Aumentado de 0.08 para 0.12
          ctx.drawImage(
            img,
            objX - objSize / 2,
            objY - objSize / 2,
            objSize,
            objSize
          )
        }
      })

      // Verificar colisões
      checkCollisions()

      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameStarted, gameOver, checkCollisions])

  // Navegar para tela de resultado quando terminar
  useEffect(() => {
    if (gameOver && timeLeft === 0) {
      // Determinar resultado baseado no progresso (acerto se >= 50%)
      const isAcerto = progress >= 50
      const result = isAcerto ? 'acerto' : 'erro'

      // Limpar canvas e vídeo antes de navegar
      if (gameCanvasRef.current) {
        gameCanvasRef.current.remove()
        gameCanvasRef.current = null
      }

      const video = document.getElementById('arjs-video') as HTMLVideoElement
      if (video) {
        video.classList.remove('ar-video-visible')
        video.style.display = 'none'
        video.style.visibility = 'hidden'
        video.style.opacity = '0'
      }

      // Salvar resultado no localStorage - usar try/catch e garantir que foi salvo
      try {
        // Limpar valores antigos primeiro
        localStorage.removeItem('ar-result')
        localStorage.removeItem('ar-score')
        localStorage.removeItem('ar-progress')

        // Salvar novos valores
        localStorage.setItem('ar-result', result)
        localStorage.setItem('ar-score', score.toString())
        localStorage.setItem('ar-progress', progress.toString())

        // Forçar sincronização (alguns navegadores precisam disso)
        if (localStorage.getItem('ar-result') !== result) {
          // Tentar novamente
          localStorage.setItem('ar-result', result)
        }

        // Verificar imediatamente se foi salvo
        const verify = localStorage.getItem('ar-result')
        console.log('✅ Resultado salvo:', verify, 'Progress:', progress, 'Score:', score, 'IsAcerto:', isAcerto)

        if (!verify || verify !== result) {
          console.error('❌ Erro: resultado não foi salvo corretamente. Tentando novamente...')
          // Tentar mais uma vez
          localStorage.setItem('ar-result', result)
          localStorage.setItem('ar-score', score.toString())
          localStorage.setItem('ar-progress', progress.toString())
        }
      } catch (e) {
        console.error('❌ Erro ao salvar no localStorage:', e)
      }

      // Navegar para tela de resultado - usar setTimeout para garantir que localStorage foi persistido
      setTimeout(() => {
        const finalCheck = localStorage.getItem('ar-result')
        console.log('🔍 Verificação final antes de navegar:', finalCheck)
        onNavigate('resultado', 'flip', 'right')
      }, 150)
    }
  }, [gameOver, timeLeft, progress, score, onNavigate])


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="ar-game-screen">
      {/* Loading overlay */}
      {arLoading && (
        <div className="ar-loading-overlay">
          <div className="ar-loading-content">
            <div className="ar-loading-spinner"></div>
            <p className="ar-loading-text">Preparando AR...</p>
          </div>
        </div>
      )}

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="ar-countdown-overlay">
          <div className="ar-countdown-content">
            {countdown > 0 ? (
              <div className="ar-countdown-number">{countdown}</div>
            ) : (
              <div className="ar-countdown-go">Vai!</div>
            )}
          </div>
        </div>
      )}

      {/* A-Frame Scene (se habilitado) */}
      {usarAFrame && (
        <ARSceneAFrame />
      )}

      {/* Canvas do jogo - compartilhado com FaceTracker */}
      {/* O canvas é criado pelo FaceTracker ou aqui se não existir */}

      {/* Face Tracker (se habilitado) */}
      {usarFaceTracking && (
        <FaceTracker enabled={true} />
      )}

      {/* Contador de tempo */}
      <div className="ar-timer-container">
        <img
          src={images.contador}
          alt="Timer"
          className="ar-timer-bg"
        />
        <div className="ar-timer-text">{formatTime(timeLeft)}</div>
      </div>

      {/* Barra de progresso */}
      <div className="ar-progress-container">
        <div className="ar-progress-wrapper">
          <img
            src={images.barraProgresso}
            alt="Progress Bar"
            className="ar-progress-bg"
          />
          <div
            className="ar-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <img
          src={images.estrelaProgresso}
          alt="Estrela Progresso"
          className="ar-progress-star"
        />
      </div>

      {/* Overlay de fundo que pisca ao acertar/errar */}
      {feedback && (
        <div
          className={`ar-feedback-overlay ar-feedback-overlay-${feedback}`}
          style={{
            backgroundImage: `url("${feedback === 'acerto' ? images.bgAcerto : images.bgErro}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      )}

      {/* Feedback */}
      {feedback && (
        <div className={`ar-feedback ar-feedback-${feedback}`}>
          <img
            src={feedback === 'acerto' ? images.feedbackAcerto : images.feedbackErro}
            alt={feedback}
            className="ar-feedback-image"
          />
        </div>
      )}

      {/* Pontuação */}
      <div className="ar-score">Pontos: {score}</div>
    </div>
  )
}
