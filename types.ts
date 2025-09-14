import type { TranslationKey as TK } from './lib/translations';

export interface TileData {
  value: number;
  base: number;
}

export type TileStatus = 'empty' | 'correct' | 'incorrect';

export interface BoardCell {
  tile: TileData | null;
  status: TileStatus;
  isHint?: boolean;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

// This is now an alias to the automatically inferred key type
export type TranslationKey = TK;

export interface ColorTheme {
  nameKey: TranslationKey;
  tiles: { [key: number]: string };
  board: {
    background: { [key: number]: string };
    border: { [key: number]: string };
  };
}

export type ThemeName = 'default' | 'neon' | 'pastel' | 'monochrome' | 'translucent';

export type TFunction = (key: TranslationKey) => string;