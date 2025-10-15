import useLocalStorage from './useLocalStorage';
import type { UserState } from '../types';

const FREE_TIER_LIMIT = 20;

const initialUserState: UserState = {
    tier: 'free',
    generationCount: 0,
    lastGeneratedDate: new Date().toISOString().slice(0, 7), // YYYY-MM
};

export const useUser = () => {
    const [user, setUser] = useLocalStorage<UserState>('userState', initialUserState);

    // Check if the month has changed and reset count if necessary
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (user.lastGeneratedDate !== currentMonth) {
        setUser({
            ...user,
            generationCount: 0,
            lastGeneratedDate: currentMonth,
        });
    }

    const isPro = user.tier === 'pro';
    const limitReached = !isPro && user.generationCount >= FREE_TIER_LIMIT;

    const decrementCount = (amount: number = 1) => {
        if (isPro) return; // Pro users have unlimited generations
        setUser(prevUser => ({
            ...prevUser,
            generationCount: Math.min(prevUser.generationCount + amount, FREE_TIER_LIMIT),
            lastGeneratedDate: currentMonth,
        }));
    };

    return {
        user,
        setUser,
        generationCount: user.generationCount,
        isPro,
        limitReached,
        decrementCount,
    };
};
