
import { useState, useCallback, useEffect } from 'react';

export type SoundType = 'correct' | 'incorrect' | 'hint' | 'win' | 'click' | 'return';

// A singleton AudioContext instance, lazily initialized to comply with browser autoplay policies.
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API is not supported in this browser.", e);
      return null;
    }
  }
  return audioContext;
};

const playNote = (type: SoundType) => {
  const context = getAudioContext();
  if (!context) return;

  // Resume the context on a user gesture, which is a requirement for most browsers.
  if (context.state === 'suspended') {
    context.resume();
  }

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  gainNode.gain.setValueAtTime(0.15, context.currentTime);
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  switch (type) {
    case 'correct':
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, context.currentTime); // C5
      gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.2);
      break;

    case 'incorrect':
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(164.81, context.currentTime); // E3
      gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.3);
      break;

    case 'return':
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, context.currentTime); // A4
      oscillator.frequency.exponentialRampToValueAtTime(220, context.currentTime + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.2);
      break;
      
    case 'hint':
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(659.25, context.currentTime); // E5
      gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.3);
      setTimeout(() => {
          if(!getAudioContext()) return; // Re-check context in timeout
          const osc2 = getAudioContext()!.createOscillator();
          const gain2 = getAudioContext()!.createGain();
          osc2.type = 'triangle';
          osc2.connect(gain2);
          gain2.connect(getAudioContext()!.destination);
          gain2.gain.setValueAtTime(0.15, getAudioContext()!.currentTime);
          osc2.frequency.setValueAtTime(783.99, getAudioContext()!.currentTime); // G5
          gain2.gain.exponentialRampToValueAtTime(0.0001, getAudioContext()!.currentTime + 0.3);
          osc2.start(getAudioContext()!.currentTime);
          osc2.stop(getAudioContext()!.currentTime + 0.3);
      }, 100);
      break;

    case 'win':
      const winNotes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      winNotes.forEach((freq, i) => {
        setTimeout(() => {
          if(!getAudioContext()) return; // Re-check context in timeout
          const osc = getAudioContext()!.createOscillator();
          const gain = getAudioContext()!.createGain();
          osc.connect(gain);
          gain.connect(getAudioContext()!.destination);
          gain.gain.setValueAtTime(0.1, getAudioContext()!.currentTime);
          osc.frequency.setValueAtTime(freq, getAudioContext()!.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, getAudioContext()!.currentTime + 0.2);
          osc.start(getAudioContext()!.currentTime);
          osc.stop(getAudioContext()!.currentTime + 0.2);
        }, i * 120);
      });
      return; // Don't play default oscillator

    case 'click':
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, context.currentTime); // A5
      gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.1);
      break;
  }

  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + 0.5);
};


export const useSounds = () => {
    const [isMuted, setIsMuted] = useState(() => {
        try {
            const item = window.localStorage.getItem('binokub-muted');
            return item ? JSON.parse(item) : false;
        } catch (error) {
            console.error(error);
            return false;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem('binokub-muted', JSON.stringify(isMuted));
        } catch (error) {
            console.error(error);
        }
    }, [isMuted]);

    const playSound = useCallback((type: SoundType) => {
        if (!isMuted) {
            playNote(type);
        }
    }, [isMuted]);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    return { playSound, toggleMute, isMuted };
};
