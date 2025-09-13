
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameBoard } from './components/GameBoard';
import { TilePalette } from './components/TilePalette';
import { GameEndModal } from './components/GameEndModal';
import { InstructionsModal } from './components/InstructionsModal';
import { HistoryModal } from './components/HistoryModal';
import { generateGameData, calculateBase } from './lib/game';
import type { TileData, BoardCell, Difficulty, ThemeName, TFunction, GameRecord } from './types';
import { GRID_SIZE } from './constants';
import { themes } from './themes';
import { useSounds } from './hooks/useSounds';
import { useGameTimer } from './hooks/useGameTimer';
import { useGameHistory } from './hooks/useGameHistory';
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

const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
  const [isGameWon, setIsGameWon] = useState(false);
  const [correctTilesCount, setCorrectTilesCount] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [themeName, setThemeName] = useState<ThemeName>('default');
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('binokub-language');
    return (savedLang as Language) || 'fr';
  });
  
  const { time, startTimer, stopTimer, resetTimer } = useGameTimer();
  const { history, addGameRecord, clearHistory } = useGameHistory();

  const t: TFunction = useCallback((key: TranslationKey) => {
    return translations[language][key] || key;
  }, [language]);

  useEffect(() => {
    localStorage.setItem('binokub-language', language);
  }, [language]);

  const currentTheme = themes[themeName];
  const { playSound, toggleMute, isMuted } = useSounds();
  const isGameInProgress = correctTilesCount > 0 && !isGameWon;


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
    setIsGameWon(false);
    setCorrectTilesCount(0);
    setHintsUsed(0);
    resetTimer();
    startTimer();
  }, [initializeBoard, difficulty, resetTimer, startTimer]);

  const handleNewGameClick = useCallback(() => {
    playSound('click');
     if (isGameInProgress) {
        addGameRecord({
            id: Date.now(),
            date: new Date().toISOString(),
            difficulty,
            status: 'abandoned',
            time,
            hintsUsed,
        });
    }
    newGame();
  }, [newGame, playSound, addGameRecord, difficulty, time, hintsUsed, isGameInProgress]);

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
  }, [difficulty]);
  
  const handleDragStart = (tile: TileData) => {
    setDraggedTile(tile);
  };

  const handleDrop = (row: number, col: number) => {
    if (!draggedTile || boardState[row][col].tile) {
      return;
    }

    // Rule 1: The base of the tile must match the column.
    const targetColumnBase = col + 1;
    if (draggedTile.base !== targetColumnBase) {
      playSound('incorrect');
      return;
    }

    // Rule 2: Sequence validation. Placement is valid if it doesn't contradict any existing neighbors.
    // If there are no adjacent tiles, placement is allowed by default.
    let isSequenceValid = true;

    // Check UP
    if (row > 0 && boardState[row - 1][col].tile) {
        if (boardState[row - 1][col].tile!.value !== draggedTile.value - 9) {
            isSequenceValid = false;
        }
    }
    // Check DOWN
    if (row < GRID_SIZE - 1 && boardState[row + 1][col].tile) {
        if (boardState[row + 1][col].tile!.value !== draggedTile.value + 9) {
            isSequenceValid = false;
        }
    }
    // Check LEFT
    if (col > 0 && boardState[row][col - 1].tile) {
        if (boardState[row][col - 1].tile!.value !== draggedTile.value - 1) {
            isSequenceValid = false;
        }
    }
    // Check RIGHT
    if (col < GRID_SIZE - 1 && boardState[row][col + 1].tile) {
        if (boardState[row][col + 1].tile!.value !== draggedTile.value + 1) {
            isSequenceValid = false;
        }
    }

    if (!isSequenceValid) {
        playSound('incorrect');
        return;
    }
    
    // --- If all rules pass, proceed with placement ---
    const isCorrectPosition = solution[row][col] === draggedTile.value;
    const newBoardState = [...boardState.map(r => [...r])];
    
    newBoardState[row][col] = {
      tile: draggedTile,
      status: isCorrectPosition ? 'correct' : 'incorrect',
    };
    
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
      const newBoardState = [...boardState.map(r => [...r])];
      
      if(newBoardState[fromRow][fromCol].status === 'correct'){
          return; // Correct tiles cannot be removed
      }
      
      // An incorrect tile can only be removed if it's not supporting other tiles below or to its right.
      const hasTileBelow = fromRow < GRID_SIZE - 1 && newBoardState[fromRow + 1][fromCol].tile;
      const hasTileToTheRight = fromCol < GRID_SIZE - 1 && newBoardState[fromRow][fromCol + 1].tile;

      if (hasTileBelow || hasTileToTheRight) {
          playSound('incorrect');
          return; // This tile is supporting others. Remove them first.
      }

      playSound('return');
      newBoardState[fromRow][fromCol] = { tile: null, status: 'empty' };
      setBoardState(newBoardState);
      setPaletteTiles([...paletteTiles, tile].sort((a,b) => a.value - b.value));
  };

  const handleHint = useCallback(() => {
    if (isGameWon) return;

    playSound('hint');
    const unsolvedCells: { r: number; c: number }[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (boardState[r][c].status !== 'correct') {
          unsolvedCells.push({ r, c });
        }
      }
    }

    if (unsolvedCells.length === 0) {
      return;
    }

    const hintCell = unsolvedCells[Math.floor(Math.random() * unsolvedCells.length)];
    const { r: hintRow, c: hintCol } = hintCell;

    const correctValue = solution[hintRow][hintCol];
    const correctTileData: TileData = { value: correctValue, base: calculateBase(correctValue) };

    const newBoardState = boardState.map(row => row.map(cell => ({ ...cell })));
    let newPaletteTiles = [...paletteTiles];

    const tileAtTarget = newBoardState[hintRow][hintCol].tile;
    if (tileAtTarget) {
      newPaletteTiles.push(tileAtTarget);
    }

    let tileFoundOnBoard = false;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newBoardState[r][c].tile?.value === correctValue) {
          newBoardState[r][c] = { tile: null, status: 'empty', isHint: false };
          tileFoundOnBoard = true;
          break;
        }
      }
      if (tileFoundOnBoard) break;
    }

    if (!tileFoundOnBoard) {
      newPaletteTiles = newPaletteTiles.filter(t => t.value !== correctValue);
    }
    
    if(newBoardState[hintRow][hintCol].status !== 'correct'){
        setCorrectTilesCount(prev => prev + 1);
    }

    newBoardState[hintRow][hintCol] = { tile: correctTileData, status: 'correct', isHint: true };

    setBoardState(newBoardState);
    setPaletteTiles(newPaletteTiles.sort((a, b) => a.value - b.value));
    setHintsUsed(prev => prev + 1);
  }, [boardState, paletteTiles, solution, playSound, isGameWon]);

  useEffect(() => {
    if (correctTilesCount === GRID_SIZE * GRID_SIZE && correctTilesCount > 0 && !isGameWon) {
      stopTimer();
      addGameRecord({
        id: Date.now(),
        date: new Date().toISOString(),
        difficulty,
        status: 'won',
        time,
        hintsUsed,
      });
      setIsGameWon(true);
      playSound('win');
    }
  }, [correctTilesCount, playSound, stopTimer, addGameRecord, difficulty, time, hintsUsed, isGameWon]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans">
      <header className="text-center mb-6 relative w-full max-w-7xl">
        <div className="flex justify-between items-center">
            <div className="flex-1 flex items-center gap-2">
                <select 
                    value={language} 
                    onChange={handleLanguageChange}
                    className="bg-slate-800 text-white rounded-md p-2 border-2 border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    aria-label="Select language"
                >
                    <option value="fr">Français 🇫🇷</option>
                    <option value="en">English 🇬🇧</option>
                    <option value="es">Español 🇪🇸</option>
                    <option value="de">Deutsch 🇩🇪</option>
                </select>
                <button
                    onClick={() => setIsInstructionsModalOpen(true)}
                    className="text-slate-400 hover:text-white transition-colors p-2 rounded-md hover:bg-slate-800 border-2 border-transparent"
                    aria-label={t('instructions')}
                >
                    <InstructionsIcon />
                </button>
                 <button
                    onClick={() => setIsHistoryModalOpen(true)}
                    className="text-slate-400 hover:text-white transition-colors p-2 rounded-md hover:bg-slate-800 border-2 border-transparent"
                    aria-label={t('history')}
                >
                    <HistoryIcon />
                </button>
            </div>
            <div className="flex-1 text-center">
                <h1 className="text-5xl font-bold text-cyan-400 tracking-wider">BINOKUB 9</h1>
            </div>
            <div className="flex-1 flex justify-end">
                <button
                    onClick={toggleMute}
                    className="text-slate-400 hover:text-white transition-colors"
                    aria-label={t(isMuted ? 'soundOn' : 'soundOff')}
                >
                    {isMuted ? <SoundOffIcon /> : <SoundOnIcon />}
                </button>
            </div>
        </div>
        <p className="text-slate-400 mt-2">{t('tagline')}</p>
      </header>
      
      <div className="flex flex-col lg:flex-row items-start gap-8 w-full max-w-7xl mx-auto">
        <main className="flex-grow flex justify-center">
            <GameBoard 
              boardState={boardState} 
              onDrop={handleDrop} 
              onTileReturn={handleTileReturn} 
              isGameWon={isGameWon} 
              theme={currentTheme}
            />
        </main>

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
                      className={`w-full text-white font-bold py-2 px-2 rounded-md transition-colors duration-200 text-sm capitalize ${
                        difficulty === level
                          ? 'bg-cyan-600 cursor-default'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
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
                      className={`w-full text-white font-bold py-2 px-1 rounded-md transition-colors duration-200 text-xs capitalize ${
                        themeName === themeKey
                          ? 'bg-cyan-600 cursor-default'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
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
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
                  >
                      {t('newGame')}
                  </button>
                  <button
                    onClick={handleHint}
                    disabled={isGameWon}
                    className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-slate-700 disabled:cursor-not-allowed"
                  >
                    {t('hint')} ({hintsUsed})
                  </button>
                </div>
              </div>
          </div>
        </aside>
      </div>

      <GameEndModal isOpen={isGameWon} onPlayAgain={handleNewGameClick} t={t} />
      <InstructionsModal isOpen={isInstructionsModalOpen} onClose={() => setIsInstructionsModalOpen(false)} t={t} />
      <HistoryModal 
        isOpen={isHistoryModalOpen} 
        onClose={() => setIsHistoryModalOpen(false)} 
        history={history}
        onClearHistory={clearHistory}
        t={t} 
      />
      <div className="fixed bottom-4 right-4 text-xs text-slate-500 font-mono" aria-hidden="true">
        REV 2.0
      </div>
    </div>
  );
};

export default App;
