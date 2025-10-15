import { useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import type { UserState } from '../types';
import { MAX_FREE_GENERATIONS } from '../types';

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

const getInitialUserState = (): UserState => {
  return {
    isPro: false,
    generationsLeft: MAX_FREE_GENERATIONS,
    lastGenerationDate: null,
  };
};

const useUser = () => {
  const [user, setUser] = useLocalStorage<UserState>('pin4you-user', getInitialUserState());

  const checkAndResetGenerations = useCallback(() => {
    const today = new Date();
    const lastDate = user.lastGenerationDate ? new Date(user.lastGenerationDate) : null;

    if (!lastDate || !isSameDay(today, lastDate)) {
      setUser(prev => ({
        ...prev,
        generationsLeft: MAX_FREE_GENERATIONS,
        lastGenerationDate: today.toISOString(),
      }));
    }
  }, [user.lastGenerationDate, setUser]);

  const decrementGenerations = useCallback(() => {
    if (user.isPro) return; // Pro users have unlimited generations

    setUser(prev => ({
      ...prev,
      generationsLeft: Math.max(0, prev.generationsLeft - 1),
      lastGenerationDate: new Date().toISOString(),
    }));
  }, [user.isPro, setUser]);
  
  const canGenerate = !user.isPro && user.generationsLeft <= 0;

  // In a real app, this would involve a backend and payment provider
  const upgradeToPro = useCallback(() => {
    setUser(prev => ({
      ...prev,
      isPro: true,
      generationsLeft: 999, // Effectively unlimited for the UI
    }));
  }, [setUser]);

  return {
    user,
    checkAndResetGenerations,
    decrementGenerations,
    canGenerate,
    upgradeToPro,
  };
};

export default useUser;
