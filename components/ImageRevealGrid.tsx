'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { computeGridDimensions } from '@/lib/imageUtils';

interface ImageRevealGridProps {
    imageSource: string;
    cardCount: number;
    revealedCards: number[];
}

export default function ImageRevealGrid({
    imageSource,
    cardCount,
    revealedCards,
}: ImageRevealGridProps) {
    const { cols, rows } = computeGridDimensions(cardCount);

    return (
        <div
            className="absolute inset-0 grid gap-0.5"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
            {Array.from({ length: cardCount }, (_, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const isRevealed = revealedCards.includes(i);

                // backgroundSize stretches the full image across the entire grid.
                // backgroundPosition offsets so this cell shows only its slice.
                const backgroundSize = `${cols * 100}% ${rows * 100}%`;
                const backgroundPositionX = cols === 1 ? '0%' : `${(col / (cols - 1)) * 100}%`;
                const backgroundPositionY = rows === 1 ? '0%' : `${(row / (rows - 1)) * 100}%`;

                return (
                    <div key={`img-piece-${i}`} className="relative overflow-hidden rounded-lg">
                        <AnimatePresence>
                            {isRevealed && (
                                <motion.div
                                    key={`reveal-${i}`}
                                    className="absolute inset-0"
                                    style={{
                                        backgroundImage: `url(${imageSource})`,
                                        backgroundSize,
                                        backgroundPosition: `${backgroundPositionX} ${backgroundPositionY}`,
                                        backgroundRepeat: 'no-repeat',
                                    }}
                                    initial={{ scale: 1.3, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
}
