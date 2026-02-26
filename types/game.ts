export type QuizType = 'multiple-choice' | 'media';

export interface Answer {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface MultipleChoiceData {
    type: 'multiple-choice';
    question: string;
    answers: Answer[];
}

export interface MediaQuizData {
    type: 'media';
    question: string;
    mediaType: 'video' | 'images';
    mediaSources: string[]; // URLs or object-URLs
}

export type QuizData = MultipleChoiceData | MediaQuizData;

export interface CardConfig {
    id: string;
    index: number;
    quiz: QuizData;
}

export interface GameConfig {
    imageSource: string; // data-URL or external URL
    cardCount: number;
    cards: CardConfig[];
}

export type GamePhase = 'setup' | 'ready' | 'playing' | 'won';

export interface GameState {
    config: GameConfig | null;
    revealedCards: number[]; // indices of removed cards
    activeCardIndex: number | null;
    correctAnswered: boolean; // whether the current quiz has been answered correctly
    phase: GamePhase;
}

export interface GameActions {
    setConfig: (config: GameConfig) => void;
    startGame: () => void;
    revealCard: (index: number) => void;
    setActiveCard: (index: number | null) => void;
    setCorrectAnswered: (value: boolean) => void;
    resetGame: () => void;
    isGameComplete: () => boolean;
}
