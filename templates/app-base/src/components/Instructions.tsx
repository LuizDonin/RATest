


import React from 'react';

interface InstructionsProps {
  onPlay?: () => void;
}

const Instructions: React.FC<InstructionsProps> = ({ onPlay }) => {
  const handlePlayClick = () => {
    if (onPlay) {
      onPlay();
    }
  };

  // Estilo inline para o fundo
  const containerStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundSize: 'cover',
  };

  return (
    <div className="instructions-container" style={containerStyle}>
      <div className="instructions-modal">
        <div className="instructions-content">
          <h2 style={{ marginBottom: '2rem', color: 'white', textAlign: 'center' }}>
            Como usar a Realidade Aumentada
          </h2>

          <div style={{ color: 'white', textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ marginBottom: '1rem' }}>
              1. Permita o acesso à câmera quando solicitado
            </p>
            <p style={{ marginBottom: '1rem' }}>
              2. Aponte a câmera para uma superfície plana
            </p>
            <p style={{ marginBottom: '1rem' }}>
              3. Toque na tela para adicionar objetos 3D
            </p>
            <p>
              4. Use gestos para interagir com os objetos
            </p>
          </div>

          <button
            className="instructions-play-button"
            onClick={handlePlayClick}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              display: 'block',
              margin: '0 auto'
            }}
          >
            Iniciar RA
          </button>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
