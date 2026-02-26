'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import { generateId } from '@/lib/imageUtils';
import type { QuizData, CardConfig } from '@/types/game';
import ImageUploader from '@/components/home/ImageUploader';
import CardConfigurator from '@/components/home/CardConfigurator';

function createDefaultQuiz(): QuizData {
  return {
    type: 'multiple-choice',
    question: '',
    answers: [
      { id: generateId(), text: '', isCorrect: true },
      { id: generateId(), text: '', isCorrect: false },
      { id: generateId(), text: '', isCorrect: false },
      { id: generateId(), text: '', isCorrect: false },
    ],
  };
}

export default function HomePage() {
  const router = useRouter();
  const setConfig = useGameStore((s) => s.setConfig);

  const [imageSource, setImageSource] = useState('');
  const [cardCount, setCardCount] = useState(6);
  const [quizzes, setQuizzes] = useState<QuizData[]>(() =>
    Array.from({ length: 6 }, () => createDefaultQuiz())
  );

  // Track if user has entered any data (for reload protection)
  const hasData = imageSource.length > 0 || quizzes.some((q) => q.question.length > 0);
  useBeforeUnload(hasData);

  // Sync quiz count with card count
  const handleCardCountChange = (count: number) => {
    setCardCount(count);
    setQuizzes((prev) => {
      if (count > prev.length) {
        return [...prev, ...Array.from({ length: count - prev.length }, () => createDefaultQuiz())];
      }
      return prev.slice(0, count);
    });
  };

  const handleQuizChange = (index: number, quiz: QuizData) => {
    setQuizzes((prev) => prev.map((q, i) => (i === index ? quiz : q)));
  };

  // Validation
  const validation = useMemo(() => {
    const errors: string[] = [];
    if (!imageSource) errors.push('Please upload or enter an image');
    quizzes.forEach((q, i) => {
      if (!q.question.trim()) errors.push(`Card ${i + 1}: Question is required`);
      if (q.type === 'multiple-choice') {
        if (q.answers.some((a) => !a.text.trim())) errors.push(`Card ${i + 1}: All answers must be filled`);
        if (!q.answers.some((a) => a.isCorrect)) errors.push(`Card ${i + 1}: Select a correct answer`);
      }
      if (q.type === 'media') {
        if (q.mediaSources.length === 0) errors.push(`Card ${i + 1}: Add at least one media source`);
      }
    });
    return errors;
  }, [imageSource, quizzes]);

  const isValid = validation.length === 0;

  const handleStartGame = () => {
    if (!isValid) return;

    const cards: CardConfig[] = quizzes.map((quiz, i) => ({
      id: generateId(),
      index: i,
      quiz,
    }));

    setConfig({
      imageSource,
      cardCount,
      cards,
    });

    router.push('/play');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-violet-950/30">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/[0.07] blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/[0.05] blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-3">
            🃏 FlashCard Quiz
          </h1>
          <p className="text-gray-400 text-lg">
            Create a hidden image and challenge players with quizzes
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-3xl p-6 sm:p-8"
        >
          {/* Step 1: Image */}
          <ImageUploader imageSource={imageSource} onImageChange={setImageSource} />

          {/* Divider */}
          <div className="border-t border-white/[0.06]" />

          {/* Step 2: Cards + Quizzes */}
          <CardConfigurator
            cardCount={cardCount}
            onCardCountChange={handleCardCountChange}
            quizzes={quizzes}
            onQuizChange={handleQuizChange}
          />

          {/* Divider */}
          <div className="border-t border-white/[0.06]" />

          {/* Validation errors */}
          {validation.length > 0 && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm font-semibold mb-2">Please fix the following:</p>
              <ul className="text-red-400/80 text-xs space-y-1 list-disc list-inside">
                {validation.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Start Button */}
          <motion.button
            whileHover={isValid ? { scale: 1.02 } : {}}
            whileTap={isValid ? { scale: 0.98 } : {}}
            onClick={handleStartGame}
            disabled={!isValid}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 cursor-pointer
              ${isValid
                ? 'bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 text-white shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50'
                : 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
              }
            `}
          >
            🚀 Start Game
          </motion.button>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-8">
          Data persists during navigation • Reload protection enabled
        </p>
      </div>
    </div>
  );
}
