'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { CardConfig } from '@/types/game';
import MultipleChoiceQuiz from './MultipleChoiceQuiz';
import MediaQuiz from './MediaQuiz';

interface QuizPanelProps {
    card: CardConfig | null;
    onCorrectAnswer: () => void;
}

export default function QuizPanel({ card, onCorrectAnswer }: QuizPanelProps) {
    return (
        <AnimatePresence mode="wait">
            {card && (
                <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="w-full"
                >
                    {card.quiz.type === 'multiple-choice' ? (
                        <MultipleChoiceQuiz
                            question={card.quiz.question}
                            answers={card.quiz.answers}
                            onCorrectAnswer={onCorrectAnswer}
                        />
                    ) : (
                        <MediaQuiz quiz={card.quiz} />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
