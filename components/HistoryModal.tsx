
import React from 'react';
import type { TFunction, GameRecord } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: GameRecord[];
  onClearHistory: () => void;
  t: TFunction;
}

const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
};

const StatCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="bg-slate-700 p-3 rounded-lg text-center">
        <div className="text-2xl font-bold text-cyan-400">{value}</div>
        <div className="text-sm text-slate-400">{label}</div>
    </div>
);


export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onClearHistory, t }) => {
  if (!isOpen) return null;

  const wonGames = history.filter(r => r.status === 'won');
  const totalGames = history.length;
  const wins = wonGames.length;
  const winRate = totalGames > 0 ? `${Math.round((wins / totalGames) * 100)}%` : 'N/A';
  const totalTime = wonGames.reduce((acc, r) => acc + r.time, 0);
  const avgTime = wins > 0 ? formatTime(Math.round(totalTime / wins)) : 'N/A';

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-xl p-6 md:p-8 text-left shadow-2xl border border-cyan-700 max-w-3xl w-full flex flex-col max-h-[90vh] transform transition-all animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-cyan-400">{t('gameHistory')}</h2>
            <button
                onClick={onClose}
                className="text-slate-400 hover:text-white"
                aria-label="Close"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label={t('totalGames')} value={totalGames} />
            <StatCard label={t('wins')} value={wins} />
            <StatCard label={t('winRate')} value={winRate} />
            <StatCard label={t('avgTime')} value={avgTime} />
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2">
            {history.length === 0 ? (
                <div className="text-center py-12 text-slate-400">{t('noHistory')}</div>
            ) : (
                <div className="space-y-2">
                    {history.map(record => (
                        <div key={record.id} className="bg-slate-900/70 p-3 rounded-lg grid grid-cols-3 md:grid-cols-5 gap-2 items-center text-sm">
                            <div className="col-span-3 md:col-span-1 text-slate-300">{new Date(record.date).toLocaleDateString()}</div>
                            <div className="capitalize text-white">{t(record.difficulty as 'easy' | 'medium' | 'hard')}</div>
                            <div className={`font-semibold capitalize ${record.status === 'won' ? 'text-green-400' : 'text-yellow-500'}`}>{t(record.status)}</div>
                            <div className="text-slate-300">{formatTime(record.time)}</div>
                            <div className="text-slate-400 text-right">{record.hintsUsed} {t('hints')}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="text-center mt-6">
            <button
              onClick={onClearHistory}
              disabled={history.length === 0}
              className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 disabled:bg-slate-700 disabled:cursor-not-allowed"
            >
              {t('clearHistory')}
            </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};
