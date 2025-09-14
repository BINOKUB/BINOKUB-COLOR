import React from 'react';
import type { BoardCell, TileData, ColorTheme } from '../types';
import { Tile } from './Tile';
import { GRID_SIZE } from '../constants';

interface GameBoardProps {
  boardState: BoardCell[][];
  onDrop: (row: number, col: number) => void;
  onTileReturn: (tile: TileData, fromRow: number, fromCol: number) => void;
  theme: ColorTheme;
  blinkingCell: { r: number; c: number } | null;
}

export const GameBoard: React.FC<GameBoardProps> = ({ boardState, onDrop, onTileReturn, theme, blinkingCell }) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleCellDrop = (e: React.DragEvent<HTMLDivElement>, row: number, col: number) => {
    e.preventDefault();
    onDrop(row, col);
  };

  return (
    <div className="bg-slate-800 p-2 rounded-xl shadow-2xl relative">
      <div className={`grid grid-cols-${GRID_SIZE} gap-1`}>
        {boardState.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const columnBase = colIndex + 1;
            const bgColor = theme.board.background[columnBase] || 'bg-gray-900/40';
            const borderColor = theme.board.border[columnBase] || 'border-gray-700';
            const isBlinking = blinkingCell?.r === rowIndex && blinkingCell?.c === colIndex;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleCellDrop(e, rowIndex, colIndex)}
                className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-md transition-colors duration-200 border-2 border-dashed ${borderColor} ${bgColor}`}
              >
                {cell.tile && (
                  <div className={isBlinking ? 'animate-blink' : ''}>
                    <Tile 
                      tile={cell.tile}
                      isPlaced={true}
                      status={cell.status}
                      isHint={cell.isHint}
                      theme={theme}
                      onDragStart={() => {
                          onTileReturn(cell.tile!, rowIndex, colIndex)
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <style>{`
        @keyframes blink {
            0%, 100% {
                filter: brightness(1);
                transform: scale(1);
            }
            50% {
                filter: brightness(1.75) drop-shadow(0 0 8px #fde047);
                 transform: scale(1.05);
            }
        }
        .animate-blink {
            animation: blink 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};