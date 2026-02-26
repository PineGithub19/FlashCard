'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizData, Answer, MediaQuizData } from '@/types/game';
import { generateId } from '@/lib/imageUtils';

interface QuizEditorProps {
    index: number;
    quiz: QuizData;
    onChange: (quiz: QuizData) => void;
}

type MediaInputMode = 'upload' | 'url';

export default function QuizEditor({ index, quiz, onChange }: QuizEditorProps) {
    const [mediaInputMode, setMediaInputMode] = useState<MediaInputMode>('url');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const setQuizType = (type: QuizData['type']) => {
        if (type === 'multiple-choice') {
            onChange({
                type: 'multiple-choice',
                question: quiz.question,
                answers: [
                    { id: generateId(), text: '', isCorrect: true },
                    { id: generateId(), text: '', isCorrect: false },
                    { id: generateId(), text: '', isCorrect: false },
                    { id: generateId(), text: '', isCorrect: false },
                ],
            });
        } else {
            onChange({
                type: 'media',
                question: quiz.question,
                mediaType: 'images',
                mediaSources: [],
            });
        }
    };

    const updateQuestion = (question: string) => {
        onChange({ ...quiz, question });
    };

    // Multiple Choice helpers
    const updateAnswer = (answerId: string, text: string) => {
        if (quiz.type !== 'multiple-choice') return;
        onChange({
            ...quiz,
            answers: quiz.answers.map((a) => (a.id === answerId ? { ...a, text } : a)),
        });
    };

    const setCorrectAnswer = (answerId: string) => {
        if (quiz.type !== 'multiple-choice') return;
        onChange({
            ...quiz,
            answers: quiz.answers.map((a) => ({ ...a, isCorrect: a.id === answerId })),
        });
    };

    const addAnswer = () => {
        if (quiz.type !== 'multiple-choice') return;
        onChange({
            ...quiz,
            answers: [...quiz.answers, { id: generateId(), text: '', isCorrect: false }],
        });
    };

    const removeAnswer = (answerId: string) => {
        if (quiz.type !== 'multiple-choice' || quiz.answers.length <= 2) return;
        const filtered = quiz.answers.filter((a) => a.id !== answerId);
        // If we removed the correct answer, make the first one correct
        if (!filtered.some((a) => a.isCorrect)) {
            filtered[0].isCorrect = true;
        }
        onChange({ ...quiz, answers: filtered });
    };

    // Media helpers
    const updateMediaType = (mediaType: 'video' | 'images') => {
        if (quiz.type !== 'media') return;
        onChange({ ...quiz, mediaType, mediaSources: [] });
    };

    const addMediaUrl = (url: string) => {
        if (quiz.type !== 'media') return;
        const maxSources = quiz.mediaType === 'video' ? 1 : 4;
        if (quiz.mediaSources.length >= maxSources) return;
        onChange({ ...quiz, mediaSources: [...quiz.mediaSources, url] });
    };

    const removeMediaSource = (idx: number) => {
        if (quiz.type !== 'media') return;
        onChange({ ...quiz, mediaSources: quiz.mediaSources.filter((_, i) => i !== idx) });
    };

    const handleMediaFile = (file: File) => {
        if (quiz.type !== 'media') return;
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                addMediaUrl(e.target.result as string);
            }
        };
        reader.readAsDataURL(file);
    };

    const [urlInput, setUrlInput] = useState('');

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-violet-500/30 text-violet-300 text-xs font-bold">
                        {index + 1}
                    </span>
                    Card {index + 1} Quiz
                </h3>
                {/* Type Toggle */}
                <div className="flex gap-1 p-0.5 bg-white/5 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setQuizType('multiple-choice')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer
              ${quiz.type === 'multiple-choice'
                                ? 'bg-violet-500/80 text-white'
                                : 'text-gray-400 hover:text-white'
                            }
            `}
                    >
                        Multiple Choice
                    </button>
                    <button
                        type="button"
                        onClick={() => setQuizType('media')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer
              ${quiz.type === 'media'
                                ? 'bg-violet-500/80 text-white'
                                : 'text-gray-400 hover:text-white'
                            }
            `}
                    >
                        Media
                    </button>
                </div>
            </div>

            {/* Question */}
            <input
                type="text"
                value={quiz.question ?? ''}
                onChange={(e) => updateQuestion(e.target.value)}
                placeholder="Enter your question..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white
          placeholder-gray-500 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400
          transition-all duration-200 text-sm"
            />

            <AnimatePresence mode="wait">
                {quiz.type === 'multiple-choice' ? (
                    <motion.div
                        key="mc"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-2"
                    >
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Answers (select the correct one)
                        </label>
                        {quiz.answers.map((answer: Answer, i: number) => (
                            <div key={answer.id} className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCorrectAnswer(answer.id)}
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer
                    ${answer.isCorrect
                                            ? 'border-emerald-400 bg-emerald-400'
                                            : 'border-gray-500 hover:border-gray-300'
                                        }
                  `}
                                >
                                    {answer.isCorrect && (
                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                            <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    )}
                                </button>
                                <input
                                    type="text"
                                    value={answer.text ?? ''}
                                    onChange={(e) => updateAnswer(answer.id, e.target.value)}
                                    placeholder={`Answer ${String.fromCharCode(65 + i)}`}
                                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm
                    placeholder-gray-500 focus:outline-none focus:border-violet-400 transition-all duration-200"
                                />
                                {quiz.answers.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeAnswer(answer.id)}
                                        className="text-gray-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addAnswer}
                            className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors cursor-pointer"
                        >
                            + Add Answer
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="media"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                    >
                        {/* Media Type */}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => updateMediaType('images')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer
                  ${(quiz as MediaQuizData).mediaType === 'images'
                                        ? 'bg-violet-500/50 text-white border border-violet-400/50'
                                        : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
                                    }
                `}
                            >
                                🖼️ Images (max 4)
                            </button>
                            <button
                                type="button"
                                onClick={() => updateMediaType('video')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer
                  ${(quiz as MediaQuizData).mediaType === 'video'
                                        ? 'bg-violet-500/50 text-white border border-violet-400/50'
                                        : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
                                    }
                `}
                            >
                                🎬 Video (1)
                            </button>
                        </div>

                        {/* Input Mode */}
                        <div className="flex gap-1 p-0.5 bg-white/5 rounded-lg w-fit">
                            <button
                                type="button"
                                onClick={() => setMediaInputMode('url')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer
                  ${mediaInputMode === 'url' ? 'bg-white/10 text-white' : 'text-gray-400'}
                `}
                            >
                                URL
                            </button>
                            <button
                                type="button"
                                onClick={() => setMediaInputMode('upload')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer
                  ${mediaInputMode === 'upload' ? 'bg-white/10 text-white' : 'text-gray-400'}
                `}
                            >
                                Upload
                            </button>
                        </div>

                        {/* Add media — both always mounted to avoid controlled/uncontrolled input issues */}
                        <div className={mediaInputMode === 'url' ? 'flex gap-2' : 'hidden'}>
                            <input
                                type="url"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                placeholder="Enter media URL..."
                                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm
                    placeholder-gray-500 focus:outline-none focus:border-violet-400 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => { addMediaUrl(urlInput); setUrlInput(''); }}
                                className="px-3 py-2 rounded-lg bg-violet-500/60 text-white text-sm hover:bg-violet-500 transition-all cursor-pointer"
                            >
                                Add
                            </button>
                        </div>
                        <div className={mediaInputMode === 'upload' ? '' : 'hidden'}>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={(quiz as MediaQuizData).mediaType === 'video' ? 'video/*' : 'image/*'}
                                onChange={(e) => e.target.files?.[0] && handleMediaFile(e.target.files[0])}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 rounded-lg bg-white/5 border border-dashed border-white/10 text-gray-400
                    hover:border-violet-400/50 hover:text-white text-sm transition-all cursor-pointer"
                            >
                                📂 Choose File
                            </button>
                        </div>

                        {/* Media preview list */}
                        {(quiz as MediaQuizData).mediaSources.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {(quiz as MediaQuizData).mediaSources.map((src, i) => (
                                    <div key={i} className="relative group">
                                        {(quiz as MediaQuizData).mediaType === 'images' ? (
                                            <img src={src} alt={`Media ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border border-white/10" />
                                        ) : (
                                            <div className="w-32 h-20 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-xs text-gray-400">
                                                🎬 Video loaded
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeMediaSource(i)}
                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs
                        flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
