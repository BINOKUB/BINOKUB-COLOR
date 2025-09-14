import React, { useState, useEffect, useRef } from 'react';
import type { TileData, TileStatus, ColorTheme } from '../types';

interface TileProps {
  tile: TileData;
  theme: ColorTheme;
  isPlaced?: boolean;
  status?: TileStatus;
  isHint?: boolean;
  style?: React.CSSProperties;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const Tile: React.FC<TileProps> = ({ tile, theme, isPlaced = false, status = 'empty', isHint = false, style, onDragStart }) => {
  const colorClasses = theme.tiles[tile.base] || 'bg-gray-500 text-white';
  const [isShaking, setIsShaking] = useState(false);
  // FIX: Explicitly initialize useRef with undefined to satisfy a TypeScript error expecting an argument.
  const prevStatusRef = useRef<TileStatus | undefined>(undefined);

  useEffect(() => {
    // Only trigger shake when status *changes* to 'incorrect' to avoid continuous shaking on re-renders.
    if (prevStatusRef.current !== 'incorrect' && status === 'incorrect') {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500); // Must match animation duration
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = status;
  }, [status]);


  let borderClass = '';
  if (isPlaced) {
    if (isHint) {
      borderClass = 'ring-4 ring-cyan-400 ring-inset';
    } else if (status === 'correct') {
      borderClass = 'ring-4 ring-green-400 ring-inset';
    } else if (status === 'incorrect') {
      borderClass = 'ring-4 ring-red-500 ring-inset';
    }
  }

  const isDraggable = status !== 'correct';

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isDraggable) {
        e.preventDefault();
        return;
    }
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(e);
  };
  
  const animationClass = isPlaced ? 'animate-drop-in' : '';
  const shakeClass = isShaking ? 'animate-shake' : '';

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      style={style}
      className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-md font-bold text-xl md:text-2xl transition-all duration-200 
      ${colorClasses} ${borderClass} 
      ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} 
      ${status === 'correct' ? 'opacity-100' : 'opacity-95 hover:opacity-100 hover:scale-105'}
      ${animationClass} ${shakeClass}`}
    >
      {tile.value}
    </div>
  );
};