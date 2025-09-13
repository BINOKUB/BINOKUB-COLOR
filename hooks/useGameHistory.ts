
import { useState, useEffect, useCallback } from 'react';
import type { GameRecord } from '../types';

const STORAGE_KEY = 'binokub-game-history';

export const useGameHistory = () => {
  const [history, setHistory] = useState<GameRecord[]>(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error("Failed to load game history from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      // Keep only the latest 100 records to prevent excessive storage usage
      const recentHistory = history.slice(0, 100);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recentHistory));
    } catch (error) {
      console.error("Failed to save game history to localStorage", error);
    }
  }, [history]);

  const addGameRecord = useCallback((newRecord: GameRecord) => {
    setHistory(prevHistory => [newRecord, ...prevHistory]);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, addGameRecord, clearHistory };
};
