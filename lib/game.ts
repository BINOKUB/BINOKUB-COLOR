import type { TileData, Difficulty } from '../types';
import { GRID_SIZE } from '../constants';

/**
 * Calculates the 'Base' (digital root) of a number.
 * @param n The number to calculate the base for.
 * @returns A single digit from 1 to 9.
 */
export const calculateBase = (n: number): number => {
  if (n === 0) return 9; // Or handle as a special case
  const base = n % 9;
  return base === 0 ? 9 : base;
};

/**
 * Generates the complete 9x9 solution grid based on difficulty.
 * @param difficulty The selected game difficulty.
 * @returns A 9x9 array of numbers representing the solved puzzle.
 */
const generateSolutionGrid = (difficulty: Difficulty): number[][] => {
  let startNumber: number;
  let min: number, max: number;

  switch (difficulty) {
    case 'easy':
      min = 10; max = 100;
      break;
    case 'medium':
      min = 101; max = 300;
      break;
    case 'hard':
      min = 11; max = 300;
      break;
    default:
      min = 10; max = 100;
      break;
  }
  
  // Keep generating a random number within the difficulty range until we find one with a base of 1.
  // This ensures the fundamental rule (base === column number + 1) is always respected.
  do {
      startNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (calculateBase(startNumber) !== 1);
  
  const grid: number[][] = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(0));

  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      grid[i][j] = startNumber + i * 9 + j;
    }
  }
  return grid;
};

/**
 * Shuffles an array of tiles randomly.
 * @param array The array of tiles to shuffle.
 * @returns A new array with the tiles shuffled.
 */
const shuffle = <T,>(array: T[]): T[] => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

/**
 * Generates all the data needed for a new game session.
 * @param difficulty The selected game difficulty.
 * @returns An object containing the solution grid and the shuffled tiles for the palette.
 */
export const generateGameData = (difficulty: Difficulty): { solutionGrid: number[][]; shuffledTiles: TileData[] } => {
  const solutionGrid = generateSolutionGrid(difficulty);
  const allTiles: TileData[] = solutionGrid
    .flat()
    .map(value => ({
      value,
      base: calculateBase(value),
    }));
  
  const shuffledTiles = shuffle(allTiles);

  return { solutionGrid, shuffledTiles };
};