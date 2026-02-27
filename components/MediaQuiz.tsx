'use client';

import { motion } from 'framer-motion';
import type { MediaQuizData } from '@/types/game';

interface MediaQuizProps {
    quiz: MediaQuizData;
}

export default function MediaQuiz({ quiz }: MediaQuizProps) {
    const { question, mediaType, mediaSources } = quiz;

    const imageGridCols =
        mediaSources.length === 1
            ? 'grid-cols-1 max-w-lg mx-auto'
            : mediaSources.length === 2
                ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
                : 'grid-cols-2 max-w-2xl mx-auto';

    const getVideoType = (url: string) => {
        if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
        return "file";
    }

    const getYoutubeId = (url: string) => {
        const reg =
            /(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([^?&/]+)/;
        return url.match(reg)?.[1];
    }

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

            {mediaType === 'video' && mediaSources[0] && (
                <div className="flex justify-center">
                    {getVideoType(mediaSources[0]) === "youtube" ? (
                        <iframe
                            width="560"
                            height="315"
                            src={`https://www.youtube.com/embed/${getYoutubeId(mediaSources[0])}`}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="w-full max-w-2xl rounded-xl border border-white/10 shadow-2xl"
                        ></iframe>
                    ) : (
                        <video
                            src={mediaSources[0]}
                            controls
                            className="w-full max-w-2xl rounded-xl border border-white/10 shadow-2xl"
                        />
                    )}
                </div>
            )}

            {mediaType === 'images' && (
                <div className={`grid ${imageGridCols} gap-3`}>
                    {mediaSources.map((src, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative overflow-hidden rounded-xl border border-white/10 shadow-lg"
                        >
                            <img
                                src={src}
                                alt={`Media ${index + 1}`}
                                className="w-full h-48 sm:h-56 object-cover"
                            />
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
