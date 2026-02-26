'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { computeGridDimensions } from '@/lib/imageUtils';

interface CardGridProps {
    cardCount: number;
    revealedCards: number[];
    activeCardIndex: number | null;
    onCardClick: (index: number) => void;
}

export default function CardGrid({
    cardCount,
    revealedCards,
    activeCardIndex,
    onCardClick,
}: CardGridProps) {
    const { cols } = computeGridDimensions(cardCount);

    return (
        <div
            className="absolute inset-0 grid z-10"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
            {Array.from({ length: cardCount }, (_, i) => {
                const isRevealed = revealedCards.includes(i);
                const isActive = activeCardIndex === i;

                return (
                    <div key={`cell-${i}`} className="relative">
                        <AnimatePresence>
                            {!isRevealed && (
                                <motion.button
                                    key={`card-${i}`}
                                    initial={{ rotateY: 0, opacity: 1, scale: 1 }}
                                    exit={{
                                        rotateY: 180,
                                        opacity: 0,
                                        scale: 0.7,
                                        transition: { duration: 0.6, ease: 'easeInOut' },
                                    }}
                                    whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(139,92,246,0.5)' }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => onCardClick(i)}
                                    className={`
                    absolute inset-0 cursor-pointer rounded-lg
                    bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700
                    backdrop-blur-sm border border-white/10
                    flex items-center justify-center
                    text-white font-bold text-2xl
                    transition-shadow duration-200
                    ${isActive ? 'ring-2 ring-violet-400 ring-offset-2 ring-offset-gray-900 shadow-lg shadow-violet-500/30' : ''}
                  `}
                                    style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
                                >
                                    <div className="absolute inset-0 rounded-lg bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15)_0%,transparent_60%)]" />
                                    <span className="relative z-10 drop-shadow-lg text-lg md:text-2xl">
                                        {i + 1}
                                    </span>
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
}
