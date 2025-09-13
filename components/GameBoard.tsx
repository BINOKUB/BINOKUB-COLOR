import React from 'react';
import type { BoardCell, TileData, ColorTheme } from '../types';
import { Tile } from './Tile';
import { GRID_SIZE } from '../constants';

interface GameBoardProps {
  boardState: BoardCell[][];
  onDrop: (row: number, col: number) => void;
  onTileReturn: (tile: TileData, fromRow: number, fromCol: number) => void;
  isGameWon: boolean;
  theme: ColorTheme;
}

export const GameBoard: React.FC<GameBoardProps> = ({ boardState, onDrop, onTileReturn, isGameWon, theme }) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleCellDrop = (e: React.DragEvent<HTMLDivElement>, row: number, col: number) => {
    e.preventDefault();
    onDrop(row, col);
  };
  
  const handleTileDragStart = (e: React.DragEvent<HTMLDivElement>, tile: TileData, row: number, col: number) => {
      e.dataTransfer.setData('tileValue', tile.value.toString());
      e.dataTransfer.setData('fromRow', row.toString());
      e.dataTransfer.setData('fromCol', col.toString());
  }

  return (
    <div className="bg-slate-800 p-2 rounded-xl shadow-2xl">
      <div className={`grid grid-cols-${GRID_SIZE} gap-1`}>
        {boardState.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const columnBase = colIndex + 1;
            const bgColor = theme.board.background[columnBase] || 'bg-gray-900/40';
            const borderColor = theme.board.border[columnBase] || 'border-gray-700';
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleCellDrop(e, rowIndex, colIndex)}
                className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-md transition-colors duration-200 border-2 border-dashed ${borderColor} ${bgColor}`}
              >
                {cell.tile && (
                  <Tile 
                    tile={cell.tile}
                    isPlaced={true}
                    status={cell.status}
                    isHint={cell.isHint}
                    isWinning={isGameWon}
                    theme={theme}
                    style={{ animationDelay: isGameWon ? `${(rowIndex * GRID_SIZE + colIndex) * 20}ms` : '0ms' }}
                    onDragStart={(e) => {
                      if (cell.status !== 'correct') {
                        // We are simulating a drag-and-return for incorrect tiles
                        // By calling onTileReturn immediately, we avoid complex state tracking
                        onTileReturn(cell.tile!, rowIndex, colIndex)
                      }
                    }}
                   />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
