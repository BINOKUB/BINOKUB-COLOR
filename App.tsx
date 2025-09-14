import React,
{ useState, useEffect, useCallback, useRef } from 'react';
import { GameBoard } from './components/GameBoard';
import { TilePalette } from './components/TilePalette';
import { GameEndModal } from './components/GameEndModal';
import { InstructionsModal } from './components/InstructionsModal';
import { generateGameData, calculateBase } from './lib/game';
import type { TileData, BoardCell, Difficulty, ThemeName, TFunction } from './types';
import { GRID_SIZE } from './constants';
import { themes } from './themes';
import { useSounds } from './hooks/useSounds';
import { useGameTimer } from './hooks/useGameTimer';
import { translations, Language, TranslationKey } from './lib/translations';

const SoundOnIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
  </svg>
);

const SoundOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9l4 4m0-4l-4 4" />
    </svg>
);

const InstructionsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093v.216c0 .546.452 1 .994 1.093m0 3.812V18m0-12.002C6.582 5.998 3 7.89 3 10.5c0 1.63.832 3.09 2.053 4.028M12 21a9 9 0 100-18 9 9 0 000 18z" />
    </svg>
);

const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
};

const App: React.FC = () => {
  const [solution, setSolution] = useState<number[][]>([]);
  const [boardState, setBoardState] = useState<BoardCell[][]>([]);
  const [paletteTiles, setPaletteTiles] = useState<TileData[]>([]);
  const [draggedTile, setDraggedTile] = useState<TileData | null>(null);
  const [correctTilesCount, setCorrectTilesCount] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [themeName, setThemeName] = useState<ThemeName>('default');
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('binokub-language');
    return (savedLang as Language) || 'fr';
  });
  
  const [gamePhase, setGamePhase] = useState<'placing' | 'final_challenge' | 'won'>('placing');
  const [blinkingCell, setBlinkingCell] = useState<{r: number, c: number} | null>(null);
  const [finalCodeAnswer, setFinalCodeAnswer] = useState<number | null>(null);
  const [finalCodeInput, setFinalCodeInput] = useState('');
  const [challengeShake, setChallengeShake] = useState(false);
  
  const { time, startTimer, stopTimer, resetTimer } = useGameTimer();

  const t: TFunction = useCallback((key: TranslationKey) => {
    return translations[language]?.[key] || key;
  }, [language]);

  useEffect(() => {
    localStorage.setItem('binokub-language', language);
  }, [language]);

  const currentTheme = themes[themeName];
  const { playSound, toggleMute, isMuted } = useSounds();
  const isUIInteractive = gamePhase === 'placing';

  const initializeBoard = useCallback(() => {
    const newBoard: BoardCell[][] = Array(GRID_SIZE)
      .fill(null)
      .map(() =>
        Array(GRID_SIZE)
          .fill(null)
          .map(() => ({ tile: null, status: 'empty', isHint: false }))
      );
    setBoardState(newBoard);
  }, []);

  const newGame = useCallback(() => {
    const { solutionGrid, shuffledTiles } = generateGameData(difficulty);
    setSolution(solutionGrid);
    setPaletteTiles(shuffledTiles);
    initializeBoard();
    
    setGamePhase('placing');
    setCorrectTilesCount(0);
    setHintsUsed(0);
    setBlinkingCell(null);
    setFinalCodeAnswer(null);
    setFinalCodeInput('');
    resetTimer();
    startTimer();
  }, [initializeBoard, difficulty, resetTimer, startTimer]);

  const handleNewGameClick = useCallback(() => {
    playSound('click');
    newGame();
  }, [newGame, playSound]);

  const handleDifficultyChange = (level: Difficulty) => {
    playSound('click');
    setDifficulty(level);
  }

  const handleThemeChange = (themeKey: ThemeName) => {
    playSound('click');
    setThemeName(themeKey);
  }

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  }

  useEffect(() => {
    newGame();
  }, [difficulty]); // newGame is memoized, this is safe
  
  const handleDragStart = (tile: TileData) => {
    if (!isUIInteractive) return;
    setDraggedTile(tile);
  };

  const handleDrop = (row: number, col: number) => {
    if (!isUIInteractive || !draggedTile || boardState[row][col].tile) {
      return;
    }

    const targetColumnBase = col + 1;
    if (draggedTile.base !== targetColumnBase) {
      playSound('incorrect');
      return;
    }

    let isSequenceValid = true;
    if (row > 0 && boardState[row - 1][col].tile) {
        if (boardState[row - 1][col].tile!.value !== draggedTile.value - 9) isSequenceValid = false;
    }
    if (row < GRID_SIZE - 1 && boardState[row + 1][col].tile) {
        if (boardState[row + 1][col].tile!.value !== draggedTile.value + 9) isSequenceValid = false;
    }
    if (col > 0 && boardState[row][col - 1].tile) {
        if (boardState[row][col - 1].tile!.value !== draggedTile.value - 1) isSequenceValid = false;
    }
    if (col < GRID_SIZE - 1 && boardState[row][col + 1].tile) {
        if (boardState[row][col + 1].tile!.value !== draggedTile.value + 1) isSequenceValid = false;
    }

    if (!isSequenceValid) {
        playSound('incorrect');
        return;
    }
    
    const isCorrectPosition = solution[row][col] === draggedTile.value;
    const newBoardState = [...boardState.map(r => [...r])];
    
    newBoardState[row][col] = { tile: draggedTile, status: isCorrectPosition ? 'correct' : 'incorrect', isHint: false };
    
    setBoardState(newBoardState);
    setPaletteTiles(paletteTiles.filter(t => t.value !== draggedTile.value));
    
    if (isCorrectPosition) {
        playSound('correct');
        setCorrectTilesCount(prev => prev + 1);
    } else {
        playSound('incorrect');
    }
    
    setDraggedTile(null);
  };
  
  const handleTileReturn = (tile: TileData, fromRow: number, fromCol: number) => {
      if (!isUIInteractive) return;
      const newBoardState = [...boardState.map(r => [...r])];
      
      if(newBoardState[fromRow][fromCol].status === 'correct'){ return; }
      
      const hasDependentTile = 
        (fromRow < GRID_SIZE - 1 && newBoardState[fromRow + 1][fromCol].tile) ||
        (fromCol < GRID_SIZE - 1 && newBoardState[fromRow][fromCol + 1].tile);

      if (hasDependentTile) {
          playSound('incorrect');
          return;
      }

      playSound('return');
      newBoardState[fromRow][fromCol] = { tile: null, status: 'empty', isHint: false };
      setBoardState(newBoardState);
      const newPaletteTiles = [...paletteTiles, tile];
      setPaletteTiles(newPaletteTiles);
  };

  const handleHint = useCallback(() => {
    if (!isUIInteractive) return;

    playSound('hint');
    const unsolvedCells: { r: number; c: number }[] = [];
    boardState.forEach((row, r) => row.forEach((cell, c) => {
        if (cell.status !== 'correct') unsolvedCells.push({ r, c });
    }));

    if (unsolvedCells.length === 0) return;

    const { r: hintRow, c: hintCol } = unsolvedCells[Math.floor(Math.random() * unsolvedCells.length)];
    const correctValue = solution[hintRow][hintCol];
    const correctTileData: TileData = { value: correctValue, base: calculateBase(correctValue) };
    const newBoardState = boardState.map(row => row.map(cell => ({ ...cell })));
    let newPaletteTiles = [...paletteTiles];

    const tileAtTarget = newBoardState[hintRow][hintCol].tile;
    if (tileAtTarget) newPaletteTiles.push(tileAtTarget);

    let tileFoundOnBoard = false;
    for (let r = 0; r < GRID_SIZE && !tileFoundOnBoard; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newBoardState[r][c].tile?.value === correctValue) {
          newBoardState[r][c] = { tile: null, status: 'empty', isHint: false };
          tileFoundOnBoard = true;
          break;
        }
      }
    }

    if (!tileFoundOnBoard) {
      newPaletteTiles = newPaletteTiles.filter(t => t.value !== correctValue);
    }
    
    if(newBoardState[hintRow][hintCol].status !== 'correct'){
        setCorrectTilesCount(prev => prev + 1);
    }

    newBoardState[hintRow][hintCol] = { tile: correctTileData, status: 'correct', isHint: true };

    setBoardState(newBoardState);
    setPaletteTiles(newPaletteTiles);
    setHintsUsed(prev => prev + 1);
  }, [boardState, paletteTiles, solution, playSound, isUIInteractive]);

  const handleFinalCodeSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const answer = parseInt(finalCodeInput, 10);
    if (answer === finalCodeAnswer) {
        playSound('win');
        setGamePhase('won');
        setBlinkingCell(null);
    } else {
        playSound('incorrect');
        setChallengeShake(true);
        setFinalCodeInput('');
        setTimeout(() => setChallengeShake(false), 500);
    }
  }, [finalCodeInput, finalCodeAnswer, playSound]);

  useEffect(() => {
    if (gamePhase === 'placing' && correctTilesCount === GRID_SIZE * GRID_SIZE && correctTilesCount > 0) {
      stopTimer();
      playSound('win');

      // Start the Final Challenge
      const randomRow = Math.floor(Math.random() * GRID_SIZE);
      const randomCol = Math.floor(Math.random() * GRID_SIZE);
      const finalNumber = solution[randomRow][randomCol];
      
      setBlinkingCell({ r: randomRow, c: randomCol });
      setFinalCodeAnswer(calculateBase(finalNumber));
      setGamePhase('final_challenge');
    }
  }, [correctTilesCount, gamePhase, playSound, stopTimer, solution]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans">
      <header className="text-center mb-6 relative w-full max-w-7xl">
        <div className="flex justify-between items-center">
            <div className="flex-1 flex items-center gap-2">
                <select 
                    value={language} 
                    onChange={handleLanguageChange}
                    disabled={!isUIInteractive}
                    className="bg-slate-800 text-white rounded-md p-2 border-2 border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Select language"
                >
                    <option value="fr">Français 🇫🇷</option>
                    <option value="en">English 🇬🇧</option>
                    <option value="es">Español 🇪🇸</option>
                    <option value="de">Deutsch 🇩🇪</option>
                </select>
                <button
                    onClick={() => setIsInstructionsModalOpen(true)}
                    disabled={!isUIInteractive}
                    className="text-slate-400 hover:text-white transition-colors p-2 rounded-md hover:bg-slate-800 border-2 border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={t('instructions')}
                >
                    <InstructionsIcon />
                </button>
            </div>
            <div className="flex-1 text-center">
                <h1 className="text-5xl font-bold text-cyan-400 tracking-wider">BINOKUB 9</h1>
            </div>
            <div className="flex-1 flex justify-end items-center gap-4">
                <button onClick={toggleMute} className="text-slate-400 hover:text-white transition-colors" aria-label={t(isMuted ? 'soundOn' : 'soundOff')}>
                    {isMuted ? <SoundOffIcon /> : <SoundOnIcon />}
                </button>
            </div>
        </div>
        <p className="text-slate-400 mt-2">{t('tagline')}</p>
      </header>
      
      <div className="flex flex-col items-center w-full max-w-7xl mx-auto relative">
        <div className="flex flex-col lg:flex-row items-start gap-8 w-full">
            <div className="flex-grow flex flex-col items-center">
                <main className="flex justify-center">
                    <GameBoard 
                      boardState={boardState} 
                      onDrop={handleDrop} 
                      onTileReturn={handleTileReturn} 
                      theme={currentTheme}
                      blinkingCell={blinkingCell}
                    />
                </main>
                {gamePhase === 'final_challenge' && (
                  <div className="w-full max-w-md mx-auto mt-6">
                    <div className={`p-4 bg-slate-800 rounded-lg text-center animate-fade-in-up border-2 border-yellow-500 shadow-lg ${challengeShake ? 'animate-shake' : ''}`}>
                       <h3 className="text-xl font-bold text-yellow-400 mb-2">{t('finalChallengeTitle')}</h3>
                       <p className="text-slate-400 text-sm mb-4">{t('finalChallengeDesc')}</p>
                       <form onSubmit={handleFinalCodeSubmit} className="flex items-center justify-center gap-2">
                         <input 
                           type="number"
                           value={finalCodeInput}
                           onChange={(e) => setFinalCodeInput(e.target.value.slice(0, 1))}
                           min="1" max="9"
                           required
                           autoFocus
                           className="w-24 h-12 bg-slate-900 text-white text-center text-2xl font-mono rounded-md border-2 border-slate-600 focus:border-cyan-500 focus:ring-cyan-500 focus:outline-none"
                           placeholder={t('enterBaseCode')}
                         />
                         <button 
                           type="submit"
                           className="h-12 bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-bold py-2 px-6 rounded-md transition-colors"
                         >
                           {t('unlockFireworks')}
                         </button>
                       </form>
                    </div>
                  </div>
                )}
            </div>

            <aside className="w-full lg:w-64 lg:max-w-xs shrink-0">
              <TilePalette tiles={paletteTiles} onDragStart={handleDragStart} theme={currentTheme} t={t} />
              <div className="mt-4 p-4 bg-slate-800 rounded-lg">
                  <div className="mb-4">
                    <h3 className="text-lg text-slate-300 text-center mb-2 font-semibold">{t('difficulty')}</h3>
                    <div className="flex justify-between gap-2">
                      {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                        <button
                          key={level}
                          onClick={() => handleDifficultyChange(level)}
                          disabled={!isUIInteractive}
                          className={`w-full text-white font-bold py-2 px-2 rounded-md transition-colors duration-200 text-sm capitalize ${
                            difficulty === level
                              ? 'bg-cyan-600 cursor-default'
                              : 'bg-slate-700 hover:bg-slate-600'
                          } disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {t(level as TranslationKey)}
                        </button>
                      ))}
                    </div>
                  </div>

                   <div className="mb-4">
                    <h3 className="text-lg text-slate-300 text-center mb-2 font-semibold">{t('theme')}</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(themes) as ThemeName[]).map((themeKey) => (
                        <button
                          key={themeKey}
                          onClick={() => handleThemeChange(themeKey)}
                           disabled={!isUIInteractive}
                          className={`w-full text-white font-bold py-2 px-1 rounded-md transition-colors duration-200 text-xs capitalize ${
                            themeName === themeKey
                              ? 'bg-cyan-600 cursor-default'
                              : 'bg-slate-700 hover:bg-slate-600'
                          } disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {t(themes[themeKey].nameKey)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                            <div className="text-sm text-slate-400">{t('correctlyPlaced')}</div>
                            <div className="text-2xl font-bold text-green-400">{correctTilesCount} / {GRID_SIZE * GRID_SIZE}</div>
                        </div>
                        <div>
                            <div className="text-sm text-slate-400">{t('timer')}</div>
                            <div className="text-2xl font-bold text-cyan-400">{formatTime(time)}</div>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                          onClick={handleNewGameClick}
                          disabled={!isUIInteractive}
                          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {t('newGame')}
                      </button>
                      <button
                        onClick={handleHint}
                        disabled={!isUIInteractive || paletteTiles.length === 0}
                        className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-slate-700 disabled:cursor-not-allowed"
                      >
                        {t('hint')} ({hintsUsed})
                      </button>
                    </div>
                  </div>
              </div>
            </aside>
        </div>

      </div>

      <GameEndModal 
        isOpen={gamePhase === 'won'}
        onPlayAgain={handleNewGameClick}
        t={t}
      />
      <InstructionsModal isOpen={isInstructionsModalOpen} onClose={() => setIsInstructionsModalOpen(false)} t={t} />
      <div className="fixed bottom-4 right-4 text-xs text-slate-500 font-mono" aria-hidden="true">
        REV 3.3.0
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
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;