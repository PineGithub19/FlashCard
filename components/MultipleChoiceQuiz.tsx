'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Answer } from '@/types/game';

interface MultipleChoiceQuizProps {
    question: string;
    answers: Answer[];
    onCorrectAnswer: () => void;
}

export default function MultipleChoiceQuiz({
    question,
    answers,
    onCorrectAnswer,
}: MultipleChoiceQuizProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);

    const handleSelect = (answer: Answer) => {
        if (showResult && selectedId) return; // already answered correctly
        setSelectedId(answer.id);
        setShowResult(true);

        if (answer.isCorrect) {
            onCorrectAnswer();
        } else {
            // Reset after a short delay for wrong answers
            setTimeout(() => {
                setShowResult(false);
                setSelectedId(null);
            }, 800);
        }
    };

    const getButtonClass = (answer: Answer) => {
        const base =
            'relative p-4 rounded-xl text-left font-medium transition-all duration-200 border cursor-pointer text-sm md:text-base';

        if (!showResult || selectedId !== answer.id) {
            return `${base} bg-white/5 border-white/10 hover:bg-white/10 hover:border-violet-400/50 text-white`;
        }

        if (answer.isCorrect) {
            return `${base} bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/20`;
        }

        return `${base} bg-red-500/20 border-red-400 text-red-300 shadow-lg shadow-red-500/20 animate-[shake_0.5s_ease-in-out]`;
    };

    const gridCols = answers.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full space-y-6"
        >
            <h2 className="text-xl md:text-2xl font-bold text-white text-center leading-relaxed">
                {question}
            </h2>
            <div className={`grid ${gridCols} gap-3`}>
                {answers.map((answer, index) => (
                    <motion.button
                        key={answer.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={getButtonClass(answer)}
                        onClick={() => handleSelect(answer)}
                    >
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10 text-xs font-bold mr-3">
                            {String.fromCharCode(65 + index)}
                        </span>
                        {answer.text}
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}
