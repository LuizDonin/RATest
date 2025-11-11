import React, { useEffect, useRef } from 'react'

interface FaceTrackerProps {
  enabled: boolean
}

declare global {
  interface Window { faceapi?: any }
}

export const FaceTracker: React.FC<FaceTrackerProps> = ({ enabled }) => {
  const rafRef = useRef<number | null>(null)
  const modelsLoadedRef = useRef<boolean>(false)
  const prevRotRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 })
  const prevPosRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 1, z: -1.2 })
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  useEffect(() => {
    // FaceTracker funciona independentemente - apenas detecta e emite eventos
    // Não precisa de canvas, câmera ou A-Frame - funciona sozinho

    // face-api.js já foi carregado em globalInit

    async function loadModels() {
      if (modelsLoadedRef.current) return
      const faceapi = window.faceapi
      const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'
      if (isMobile) {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
        ])
      } else {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ])
      }
      modelsLoadedRef.current = true
      console.log('Modelos de face-api carregados')
    }

    async function start() {
      // face-api.js já foi carregado em globalInit
      if (!window.faceapi) {
        console.warn('face-api.js não carregado ainda, aguardando...')
        await new Promise(resolve => setTimeout(resolve, 1000))
        if (!window.faceapi) {
          console.error('face-api.js ainda não disponível')
          return
        }
      }
      await loadModels()

      // Usar o vídeo global que já foi criado
      const video = document.getElementById('arjs-video') as HTMLVideoElement
      if (!video || !video.srcObject) {
        console.warn('FaceTracker: vídeo global não encontrado')
        return
      }

      // Aguardar vídeo estar pronto
      if (video.readyState < 2) {
        await new Promise<void>((resolve) => {
          const onReady = () => {
            video.removeEventListener('loadedmetadata', onReady)
            video.removeEventListener('playing', onReady)
            resolve()
          }
          video.addEventListener('loadedmetadata', onReady, { once: true })
          video.addEventListener('playing', onReady, { once: true })
          if (video.readyState >= 2) {
            resolve()
          }
        })
      }

      if (!video) {
        return
      }

      const faceapi = window.faceapi

      // Função para obter dimensões da tela (não precisa de canvas)
      const getScreenDimensions = () => {
        return {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }

      const detect = async () => {
        try {
          if (!enabled) return
          if (!video.videoWidth) {
            scheduleNext()
            return
          }

          // iOS/Android: tentar retomar play (gesture unlock simplificado)
          if (isMobile && video.paused) {
            const unlock = () => {
              video.muted = true
              video.play().catch(() => { })
              window.removeEventListener('touchstart', unlock)
              window.removeEventListener('click', unlock)
            }
            window.addEventListener('touchstart', unlock, { passive: true })
            window.addEventListener('click', unlock)
          }

          const isMirrored = (getComputedStyle(video).transform || '').includes('matrix(-1') || (video.style.transform || '').includes('scaleX(-1)')

          const options = new faceapi.TinyFaceDetectorOptions({ inputSize: isMobile ? 160 : 224, scoreThreshold: isMobile ? 0.35 : 0.5 })
          let pipeline: any = window.faceapi
            .detectAllFaces(video, options)
            .withFaceLandmarks()
          if (!isMobile && window.faceapi.nets.faceExpressionNet.isLoaded) {
            pipeline = pipeline.withFaceExpressions()
          }
          const detections = await pipeline

          // Apenas detectar e emitir eventos - não desenhar nada

          const screenDims = getScreenDimensions()
          const scaleX = screenDims.width / video.videoWidth
          const scaleY = screenDims.height / video.videoHeight

          const mapX = (x: number, w = 0) => {
            const raw = x * scaleX
            return isMirrored ? (screenDims.width - (raw + w)) : raw
          }
          const mapY = (y: number) => y * scaleY

          if (detections && detections.length) {
            detections.forEach((det: any) => {
              const box = det.detection.box

              const pts: Array<{ x: number; y: number }> = det.landmarks?.positions || []
              if (pts.length === 68) {
                const noseTip = pts[30]
                const leftEyeIdx = [36, 37, 38, 39, 40, 41]
                const rightEyeIdx = [42, 43, 44, 45, 46, 47]
                const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
                const eyeCenter = (ids: number[]) => ({ x: avg(ids.map(i => pts[i].x)), y: avg(ids.map(i => pts[i].y)) })
                const leftEye = eyeCenter(leftEyeIdx)
                const rightEye = eyeCenter(rightEyeIdx)

                const midEyes = { x: (leftEye.x + rightEye.x) / 2, y: (leftEye.y + rightEye.y) / 2 }
                const midEyesPx = { x: mapX(midEyes.x), y: mapY(midEyes.y) }

                const dxEyes = rightEye.x - leftEye.x
                const dyEyes = rightEye.y - leftEye.y
                let rollDeg = (Math.atan2(dyEyes, dxEyes) * 180) / Math.PI
                const eyeDist = Math.hypot(dxEyes, dyEyes) || 1
                let yawDeg = ((noseTip.x - midEyes.x) / eyeDist) * 60
                let pitchDeg = (-(noseTip.y - midEyes.y) / eyeDist) * 50
                if (isMirrored) {
                  yawDeg = -yawDeg
                  rollDeg = -rollDeg
                }
                const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
                yawDeg = clamp(yawDeg, -60, 60)
                pitchDeg = clamp(pitchDeg, -50, 50)
                rollDeg = clamp(rollDeg, -45, 45)

                // Emitir posição do nariz (onde está a máscara) para o jogo AR
                const centerX = mapX(midEyes.x)
                const centerY = mapY(midEyes.y) + (box.height * scaleY) * 0.10

                const normalizedX = centerX / screenDims.width
                const normalizedY = centerY / screenDims.height
                window.dispatchEvent(new CustomEvent('nave-position', {
                  detail: { x: normalizedX, y: normalizedY, detected: true }
                }))

                const alphaR = 0.25
                const prevR = prevRotRef.current
                const smoothedR = {
                  x: prevR.x + (pitchDeg - prevR.x) * alphaR,
                  y: prevR.y + (yawDeg - prevR.y) * alphaR,
                  z: prevR.z + (rollDeg - prevR.z) * alphaR
                }
                prevRotRef.current = smoothedR

                const cameraEl = document.getElementById('camera') as any
                const headEl = document.getElementById('head-cube') as any
                if (cameraEl && headEl) {
                  const threeCam = cameraEl.getObject3D && cameraEl.getObject3D('camera')
                  if (threeCam && (window as any).THREE) {
                    const THREE = (window as any).THREE
                    const nx = (midEyesPx.x / screenDims.width) * 2 - 1
                    const ny = -((midEyesPx.y / screenDims.height) * 2 - 1)
                    const depth = 1.2

                    const origin = new THREE.Vector3()
                    const dir = new THREE.Vector3()

                    const ndc = new THREE.Vector3(nx, ny, 0.5)
                    ndc.unproject(threeCam)
                    origin.copy(threeCam.position)
                    dir.copy(ndc).sub(origin).normalize()

                    const targetPos = origin.clone().add(dir.multiplyScalar(depth))

                    const alphaP = 0.35
                    const prevP = prevPosRef.current
                    const smoothedP = {
                      x: prevP.x + (targetPos.x - prevP.x) * alphaP,
                      y: prevP.y + (targetPos.y - prevP.y) * alphaP,
                      z: prevP.z + (targetPos.z - prevP.z) * alphaP
                    }
                    prevPosRef.current = smoothedP

                    headEl.setAttribute('position', `${smoothedP.x.toFixed(3)} ${smoothedP.y.toFixed(3)} ${smoothedP.z.toFixed(3)}`)
                    headEl.setAttribute('rotation', `${smoothedR.x.toFixed(2)} ${smoothedR.y.toFixed(2)} ${smoothedR.z.toFixed(2)}`)
                  } else if (headEl.setAttribute) {
                    headEl.setAttribute('rotation', `${smoothedR.x.toFixed(2)} ${smoothedR.y.toFixed(2)} ${smoothedR.z.toFixed(2)}`)
                  }
                }
              }
            })
          } else {
            // Emitir que não há face detectada
            window.dispatchEvent(new CustomEvent('nave-position', {
              detail: { x: 0.5, y: 0.5, detected: false }
            }))
          }
        } catch (e) {
          console.error('FaceTracker detect error:', e)
        }
        scheduleNext()
      }

      const scheduleNext = () => {
        if (isMobile) {
          // Throttle ~12fps para reduzir CPU/bateria
          setTimeout(() => { rafRef.current = requestAnimationFrame(detect) }, 80)
        } else {
          rafRef.current = requestAnimationFrame(detect)
        }
      }

      rafRef.current = requestAnimationFrame(detect)
    }

    if (enabled) {
      start().catch(err => {
        console.error('FaceTracker start error:', err)
      })
    } else {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [enabled])

  return null
}
