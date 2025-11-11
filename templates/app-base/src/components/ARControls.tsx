import React from 'react'
import { ARSceneAFrameRef } from './ARSceneAFrame'

interface ARControlsProps {
  className?: string
  sceneRef?: React.RefObject<ARSceneAFrameRef>
  onToggleFacing?: () => void
  onToggleFaceTracking?: () => void
  faceTrackingEnabled?: boolean
}

export const ARControls: React.FC<ARControlsProps> = ({ className = '', sceneRef, onToggleFacing, onToggleFaceTracking, faceTrackingEnabled }) => {
  const handleCapture = () => {
    if (sceneRef?.current) {
      const screenshot = sceneRef.current.captureScreenshot()
      if (screenshot) {
        const link = document.createElement('a')
        link.href = screenshot
        link.download = `ar-screenshot-${Date.now()}.png`
        link.click()
      }
    } else {
      const sceneEl = document.querySelector('a-scene')
      if (sceneEl) {
        const renderer = (sceneEl as any).renderer
        if (renderer && renderer.domElement) {
          const screenshot = renderer.domElement.toDataURL('image/png')
          const link = document.createElement('a')
          link.href = screenshot
          link.download = `ar-screenshot-${Date.now()}.png`
          link.click()
        }
      }
    }
  }

  return (
    <>
      <div className={`ar-controls ${className}`}>
        <button className="ar-button" onClick={handleCapture}>
          📷 Capturar
        </button>
        {onToggleFacing && (
          <button className="ar-button" onClick={onToggleFacing}>
            🔄 Trocar câmera
          </button>
        )}
        {onToggleFaceTracking && (
          <button className="ar-button" onClick={onToggleFaceTracking}>
            {faceTrackingEnabled ? '🧠 FaceTracking: ON' : '🧠 FaceTracking: OFF'}
          </button>
        )}
      </div>
    </>
  )
}
