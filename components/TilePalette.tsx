
import React from 'react';
import type { TileData, ColorTheme, TFunction } from '../types';
import { Tile } from './Tile';

interface TilePaletteProps {
  tiles: TileData[];
  onDragStart: (tile: TileData) => void;
  theme: ColorTheme;
  t: TFunction;
}

export const TilePalette: React.FC<TilePaletteProps> = ({ tiles, onDragStart, theme, t }) => {
  return (
    <div className="p-4 bg-slate-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-center mb-4 text-slate-300">{t('numberPalette')}</h2>
      <div 
        className="h-96 lg:h-[34rem] overflow-y-auto pr-2 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2"
        onDrop={(e) => {
             e.preventDefault();
             // This is to handle dropping a tile back into the palette area
             // The logic in App.tsx already handles the state update via onTileReturn
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        {tiles.map((tile) => (
          <Tile key={tile.value} tile={tile} onDragStart={() => onDragStart(tile)} theme={theme} />
        ))}
      </div>
    </div>
  );
};
