'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import CardGrid from '@/components/CardGrid';
import QuizPanel from '@/components/QuizPanel';
import GameFooter from '@/components/GameFooter';

export default function PlayPage() {
    const router = useRouter();
    const {
        config,
        revealedCards,
        activeCardIndex,
        correctAnswered,
        phase,
        startGame,
        revealCard,
        setActiveCard,
        setCorrectAnswered,
    } = useGameStore();

    // Redirect if no config
    useEffect(() => {
        if (!config) {
            router.replace('/');
        } else if (phase === 'ready') {
            startGame();
        }
    }, [config, phase, router, startGame]);

    // Reload protection while playing
    useBeforeUnload(phase === 'playing');

    // Active card object
    const activeCard = useMemo(() => {
        if (activeCardIndex === null || !config) return null;
        return config.cards.find((c) => c.index === activeCardIndex) ?? null;
    }, [activeCardIndex, config]);

    // Determine whether Next button should be enabled
    const isNextEnabled = useMemo(() => {
        if (!activeCard) return false;
        if (activeCard.quiz.type === 'media') return true;
        return correctAnswered;
    }, [activeCard, correctAnswered]);

    const handleCardClick = (index: number) => {
        if (revealedCards.includes(index)) return;
        setActiveCard(index);
    };

    const handleNext = () => {
        if (activeCardIndex !== null) {
            revealCard(activeCardIndex);
        }
    };

    const handleCancel = () => {
        setActiveCard(null);
    };

    const handleCorrectAnswer = () => {
        setCorrectAnswered(true);
    };

    if (!config) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-violet-950/30">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    const progress = Math.round((revealedCards.length / config.cardCount) * 100);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-violet-950/30">
            {/* Decorative background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/[0.07] blur-3xl" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/[0.05] blur-3xl" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-6 sm:py-10 flex flex-col items-center gap-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full flex items-center justify-between"
                >
                    <button
                        onClick={() => router.push('/')}
                        className="text-gray-400 hover:text-white text-sm font-medium transition-colors cursor-pointer"
                    >
                        ← Back
                    </button>
                    <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                        🃏 FlashCard Quiz
                    </h1>
                    {/* Progress */}
                    <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        <span className="text-xs text-gray-500">{revealedCards.length}/{config.cardCount}</span>
                    </div>
                </motion.div>

                {/* Game Board */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative w-full aspect-[4/3] max-h-[60vh] rounded-2xl overflow-hidden
            border border-white/[0.08] shadow-2xl shadow-violet-500/10 bg-gray-900/50"
                >
                    {/* Full image behind cards */}
                    <img
                        src={config.imageSource}
                        alt="Hidden picture"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Cards overlay on top */}
                    <CardGrid
                        cardCount={config.cardCount}
                        revealedCards={revealedCards}
                        activeCardIndex={activeCardIndex}
                        onCardClick={handleCardClick}
                    />
                </motion.div>

                {/* Quiz Section */}
                <div className="w-full max-w-2xl">
                    <AnimatePresence mode="wait">
                        {activeCard ? (
                            <motion.div
                                key={activeCard.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 space-y-4"
                            >
                                <QuizPanel card={activeCard} onCorrectAnswer={handleCorrectAnswer} />
                                <GameFooter
                                    nextEnabled={isNextEnabled}
                                    onNext={handleNext}
                                    onCancel={handleCancel}
                                />
                            </motion.div>
                        ) : phase === 'playing' ? (
                            <motion.p
                                key="select-hint"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center text-gray-500 text-sm py-8"
                            >
                                ← Click a card to start its quiz
                            </motion.p>
                        ) : null}
                    </AnimatePresence>
                </div>
            </div>

            {/* Win Overlay */}
            <AnimatePresence>
                {phase === 'won' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md"
                    >
                        {/* Floating particles */}
                        {Array.from({ length: 20 }, (_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 rounded-full"
                                style={{
                                    background: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#6366f1', '#818cf8'][i % 5],
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                                initial={{ opacity: 0, scale: 0, y: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1.5, 0],
                                    y: [0, -200 - Math.random() * 300],
                                    x: (Math.random() - 0.5) * 200,
                                }}
                                transition={{
                                    duration: 2 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: Math.random() * 2,
                                    ease: 'easeOut',
                                }}
                            />
                        ))}

                        <motion.div
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                            className="text-center space-y-6"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="text-7xl sm:text-9xl"
                            >
                                🎉
                            </motion.div>
                            <h2 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                You Win!
                            </h2>
                            <p className="text-gray-400 text-lg">All cards revealed — great job!</p>

                            {/* Revealed image */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mx-auto max-w-md rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                            >
                                <img src={config.imageSource} alt="Revealed" className="w-full" />
                            </motion.div>

                            <div className="flex gap-4 justify-center pt-4">
                                <button
                                    onClick={() => {
                                        useGameStore.getState().startGame();
                                    }}
                                    className="px-6 py-3 rounded-xl bg-white/10 border border-white/10 text-white font-medium
                    hover:bg-white/20 transition-all cursor-pointer"
                                >
                                    🔄 Play Again
                                </button>
                                <button
                                    onClick={() => router.push('/')}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium
                    shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all cursor-pointer"
                                >
                                    🏠 New Game
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
