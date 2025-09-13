import { useState, useCallback, useEffect, useRef } from 'react';

type SoundType = 'correct' | 'incorrect' | 'hint' | 'win' | 'click' | 'return';

// A simple sound player using the Web Audio API
const createSoundPlayer = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const play = (type: SoundType) => {
    if (!audioContext) return;
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    let oscillatorType: OscillatorType = 'sine';
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case 'correct':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
        break;

      case 'incorrect':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(164.81, audioContext.currentTime); // E3
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.3);
        break;

      case 'return':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
        oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
        break;
        
      case 'hint':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.3);
        setTimeout(() => {
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.type = 'triangle';
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            gain2.gain.setValueAtTime(0.15, audioContext.currentTime);
            osc2.frequency.setValueAtTime(783.99, audioContext.currentTime); // G5
            gain2.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.3);
            osc2.start(audioContext.currentTime);
            osc2.stop(audioContext.currentTime + 0.3);
        }, 100);
        break;

      case 'win':
        const winNotes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        winNotes.forEach((freq, i) => {
          setTimeout(() => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            gain.gain.setValueAtTime(0.1, audioContext.currentTime);
            osc.frequency.setValueAtTime(freq, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
            osc.start(audioContext.currentTime);
            osc.stop(audioContext.currentTime + 0.2);
          }, i * 120);
        });
        return; // Don't play default oscillator

      case 'click':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.1);
        break;
    }

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  return { play };
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

    const soundPlayer = useRef(typeof window !== 'undefined' ? createSoundPlayer() : null);

    useEffect(() => {
        try {
            window.localStorage.setItem('binokub-muted', JSON.stringify(isMuted));
        } catch (error) {
            console.error(error);
        }
    }, [isMuted]);

    const playSound = useCallback((type: SoundType) => {
        if (!isMuted && soundPlayer.current) {
            soundPlayer.current.play(type);
        }
    }, [isMuted]);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    return { playSound, toggleMute, isMuted };
};
