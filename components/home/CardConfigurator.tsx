'use client';

import { motion } from 'framer-motion';
import type { QuizData } from '@/types/game';
import QuizEditor from './QuizEditor';

interface CardConfiguratorProps {
    cardCount: number;
    onCardCountChange: (count: number) => void;
    quizzes: QuizData[];
    onQuizChange: (index: number, quiz: QuizData) => void;
}

export default function CardConfigurator({
    cardCount,
    onCardCountChange,
    quizzes,
    onQuizChange,
}: CardConfiguratorProps) {
    return (
        <div className="space-y-6">
            {/* Card Count */}
            <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Number of Cards
                </label>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min={2}
                        max={20}
                        value={cardCount}
                        onChange={(e) => onCardCountChange(Number(e.target.value))}
                        className="flex-1 accent-violet-500"
                    />
                    <motion.span
                        key={cardCount}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-400/30
              text-violet-300 font-bold text-xl"
                    >
                        {cardCount}
                    </motion.span>
                </div>
            </div>

            {/* Quiz Editors */}
            <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Configure Quiz for Each Card
                </label>
                <div className="space-y-3">
                    {quizzes.map((quiz, i) => (
                        <QuizEditor
                            key={i}
                            index={i}
                            quiz={quiz}
                            onChange={(q) => onQuizChange(i, q)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
