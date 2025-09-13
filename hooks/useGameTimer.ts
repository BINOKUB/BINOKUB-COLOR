
import { useState, useRef, useCallback, useEffect } from 'react';

export const useGameTimer = () => {
  const [time, setTime] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer(); // Ensure no multiple intervals are running
    intervalRef.current = window.setInterval(() => {
      setTime(prevTime => prevTime + 1);
    }, 1000);
  }, [stopTimer]);

  const resetTimer = useCallback(() => {
    stopTimer();
    setTime(0);
  }, [stopTimer]);

  useEffect(() => {
    // Cleanup on unmount
    return () => stopTimer();
  }, [stopTimer]);

  return { time, startTimer, stopTimer, resetTimer };
};
