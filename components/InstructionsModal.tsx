
import React from 'react';
import type { TFunction } from '../types';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TFunction;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-xl p-6 md:p-8 text-left shadow-2xl border border-cyan-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all animate-fade-in-up"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <h2 className="text-3xl font-bold text-cyan-400 mb-4 text-center">{t('instructionsTitle')}</h2>
        
        <div className="space-y-4 text-slate-300">
          <div>
            <h3 className="text-xl font-semibold text-yellow-400 mb-1">{t('baseTitle')}</h3>
            <p className="text-base">{t('baseExplanation')}</p>
            <p className="text-base italic text-slate-400 mt-1">{t('baseExample')}</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-yellow-400 mb-1">{t('suiteTitle')}</h3>
            <p className="text-base">{t('suiteExplanation')}</p>
            <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
              <li><strong>{t('verticalRuleTitle')}:</strong> {t('verticalRuleDesc')}</li>
              <li><strong>{t('horizontalRuleTitle')}:</strong> {t('horizontalRuleDesc')}</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-yellow-400 mb-1">{t('goalTitle')}</h3>
            <p className="text-base">{t('goalExplanation')}</p>
          </div>
        </div>

        <div className="text-center mt-6">
            <button
              onClick={onClose}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-8 rounded-lg text-lg transition-transform duration-200 transform hover:scale-105"
            >
              {t('gotIt')}
            </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
