
import React from 'react';
import type { TFunction } from '../types';

interface GameEndModalProps {
  isOpen: boolean;
  onPlayAgain: () => void;
  t: TFunction;
}

export const GameEndModal: React.FC<GameEndModalProps> = ({ isOpen, onPlayAgain, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-8 text-center shadow-2xl border border-cyan-500 transform transition-all animate-fade-in-up">
        <h2 className="text-4xl font-bold text-cyan-400 mb-4">{t('congratulations')}</h2>
        <p className="text-slate-300 text-lg mb-6">{t('winMessage')}</p>
        <button
          onClick={onPlayAgain}
          className="bg-green-500 hover:bg-green-400 text-white font-bold py-3 px-6 rounded-lg text-xl transition-transform duration-200 transform hover:scale-105"
        >
          {t('playAgain')}
        </button>
      </div>
      <style>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
