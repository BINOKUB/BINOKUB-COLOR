import React, { useState, useEffect } from 'react';
import type { TFunction } from '../types';

interface GameEndModalProps {
  isOpen: boolean;
  onPlayAgain: () => void;
  t: TFunction;
}

const CONFETTI_COLORS = ['#FFC700', '#FF0000', '#00FF00', '#0000FF', '#FF00FF', '#00FFFF', '#FFA500', '#FFFFFF', '#ADFF2F', '#DA70D6'];
const NUM_BURSTS = 30;
const NUM_PARTICLES_PER_BURST = 25;

const ConfettiParticle: React.FC<{ color: string, angle: number, delay: number }> = ({ color, angle, delay }) => {
    const style: React.CSSProperties = {
        '--color': color,
        '--angle': `${angle}deg`,
        position: 'absolute',
        top: '0',
        left: '0',
        width: '8px',
        height: '4px',
        backgroundColor: 'var(--color)',
        animation: `explode 2s cubic-bezier(0.1, 0.8, 0.5, 1) ${delay}s forwards`,
    } as React.CSSProperties;
    return <div style={style}></div>;
};

const ConfettiBurst: React.FC<{ x: number, y: number, color: string, delay: number }> = ({ x, y, color, delay }) => {
    const particles = Array.from({ length: NUM_PARTICLES_PER_BURST }, (_, i) => ({
        id: i,
        angle: (360 / NUM_PARTICLES_PER_BURST) * i,
    }));
    
    const style: React.CSSProperties = {
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        opacity: 0,
        animation: `burst-appear 0.1s ${delay}s forwards`,
    } as React.CSSProperties;

    return (
        <div style={style}>
            {particles.map(p => <ConfettiParticle key={p.id} color={color} angle={p.angle} delay={delay} />)}
        </div>
    );
}

export const GameEndModal: React.FC<GameEndModalProps> = ({ isOpen, onPlayAgain, t }) => {
  const [showControls, setShowControls] = useState(false);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number; color: string; delay: number }[]>([]);

  useEffect(() => {
    if (isOpen) {
      setShowControls(false);

      const newBursts = Array.from({ length: NUM_BURSTS }).map((_, i) => ({
          id: i,
          x: Math.random() * 90 + 5, // 5% to 95% width
          y: Math.random() * 80 + 10, // 10% to 90% height
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          delay: Math.random() * 4,
      }));
      setBursts(newBursts);

      const timer = setTimeout(() => {
        setShowControls(true);
      }, 5000);

      return () => {
        clearTimeout(timer);
        setBursts([]);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 overflow-hidden pointer-events-none">
      {bursts.map(b => (
          <ConfettiBurst key={b.id} {...b} />
      ))}
      
      {showControls && (
         <div className="text-center animate-fade-in pointer-events-auto">
            <h2 className="text-5xl font-bold mb-4 text-cyan-400 drop-shadow-lg">{t('congratulations')}</h2>
            <p className="text-slate-300 text-xl mb-8 drop-shadow-md">{t('winMessage')}</p>
            <button
              onClick={onPlayAgain}
              className="bg-green-500 hover:bg-green-400 text-white font-bold py-3 px-8 rounded-lg text-2xl transition-transform duration-200 transform hover:scale-105"
            >
              {t('playAgain')}
            </button>
          </div>
      )}
      <style>{`
        @keyframes burst-appear {
            to { opacity: 1; }
        }
        @keyframes explode {
            0% { 
                transform: rotate(var(--angle)) translateY(0) rotate(0deg); 
                opacity: 1; 
            }
            100% { 
                transform: rotate(var(--angle)) translateY(150px) rotate(720deg); 
                opacity: 0; 
            }
        }
        @keyframes fade-in {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};