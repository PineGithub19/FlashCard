'use client';

import { create } from 'zustand';
import type { GameConfig, GameState, GameActions } from '@/types/game';

type GameStore = GameState & GameActions;

const initialState: GameState = {
    config: null,
    revealedCards: [],
    activeCardIndex: null,
    correctAnswered: false,
    phase: 'setup',
};

export const useGameStore = create<GameStore>((set, get) => ({
    ...initialState,

    setConfig: (config: GameConfig) => {
        set({ config, phase: 'ready' });
    },

    startGame: () => {
        set({ phase: 'playing', revealedCards: [], activeCardIndex: null, correctAnswered: false });
    },

    revealCard: (index: number) => {
        const { revealedCards, config } = get();
        if (revealedCards.includes(index)) return;
        const newRevealed = [...revealedCards, index];
        const isComplete = config ? newRevealed.length >= config.cardCount : false;
        set({
            revealedCards: newRevealed,
            activeCardIndex: null,
            correctAnswered: false,
            phase: isComplete ? 'won' : 'playing',
        });
    },

    setActiveCard: (index: number | null) => {
        set({ activeCardIndex: index, correctAnswered: false });
    },

    setCorrectAnswered: (value: boolean) => {
        set({ correctAnswered: value });
    },

    resetGame: () => {
        set({ ...initialState });
    },

    isGameComplete: () => {
        const { revealedCards, config } = get();
        return config ? revealedCards.length >= config.cardCount : false;
    },
}));
