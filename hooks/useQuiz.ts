import { useMutation, useQuery } from '@tanstack/react-query';
import { quizService } from '@/services/quizService';
import type { GameConfig, MediaQuizData } from '@/types/game';

// Helper to convert base64 data URL back to a File object for FormData upload
function dataUrlToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

export function useSaveQuiz() {
    return useMutation({
        mutationFn: async (config: GameConfig) => {
            // 1. Deep clone the config to avoid mutating frontend state during upload
            const configToSave: GameConfig = JSON.parse(JSON.stringify(config));

            // 2. Upload main background image if it is a local data URL
            if (configToSave.imageSource.startsWith('data:')) {
                const file = dataUrlToFile(configToSave.imageSource, 'background-image');
                const uploadedUrl = await quizService.uploadMedia(file, 'image');
                configToSave.imageSource = uploadedUrl;
            }

            // 3. Upload any media sources within individual cards
            for (const card of configToSave.cards) {
                if (card.quiz.type === 'media') {
                    const mediaQuiz = card.quiz as MediaQuizData;
                    for (let i = 0; i < mediaQuiz.mediaSources.length; i++) {
                        const src = mediaQuiz.mediaSources[i];
                        if (src.startsWith('data:')) {
                            // Extract a generic filename based on type
                            const typeArg = mediaQuiz.mediaType === 'images' ? 'image' : 'video';
                            const file = dataUrlToFile(src, `quiz-media-${i}`);
                            const uploadedUrl = await quizService.uploadMedia(file, typeArg);
                            mediaQuiz.mediaSources[i] = uploadedUrl;
                        }
                    }
                }
            }

            // 4. Save the finalized configuration to the database
            return await quizService.saveQuiz(configToSave);
        },
    });
}

export function useFetchQuiz(quizId: string) {
    return useQuery({
        queryKey: ['quiz', quizId],
        queryFn: () => quizService.getQuiz(quizId),
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        enabled: !!quizId,
    });
}
