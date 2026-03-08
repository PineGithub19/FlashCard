import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import type { GameConfig, CardConfig, QuizData, MultipleChoiceData, MediaQuizData } from '@/types/game';

export const quizService = {
    /**
     * Uploads a media file (image or video) directly to the Supabase backend.
     * Returns the public URL of the uploaded file.
     */
    async uploadMedia(file: File, type: 'image' | 'video'): Promise<string> {
        const bucketName = type === 'image' ? 'images/private' : 'videos/private';
        const ext = file.name.split('.').pop() || '';
        const filename = `${uuidv4()}${ext ? `.${ext}` : ''}`;

        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filename, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            throw new Error('Failed to upload file to storage');
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filename);

        return publicUrl;
    },

    /**
     * Saves the entire game configuration to Supabase directly from the client.
     * Returns the generated quiz_id and dynamic play_url.
     */
    async saveQuiz(config: GameConfig): Promise<{ quiz_id: string; play_url: string }> {
        if (!config || !config.cards || config.cards.length === 0) {
            throw new Error('Invalid game configuration');
        }

        // 1. Create the Quiz record
        const { data: quizData, error: quizError } = await supabase
            .from('quizzes')
            .insert({
                background_image_url: config.imageSource,
                card_count: config.cardCount,
            })
            .select('id')
            .single();

        if (quizError) {
            console.error('Quiz creation error:', quizError);
            throw new Error(`Failed to create quiz record: ${quizError.message}`);
        }

        const quizId = quizData.id;

        // 2. Insert Questions, Answers, and Media
        for (let i = 0; i < config.cards.length; i++) {
            const card = config.cards[i];
            const quiz: QuizData = card.quiz;
            const typeStr = quiz.type === 'multiple-choice' ? 'multiple_choice' : 'media';

            // Insert Question
            const { data: questionData, error: questionError } = await supabase
                .from('questions')
                .insert({
                    quiz_id: quizId,
                    question_text: quiz.question,
                    quiz_type: typeStr,
                    position: i + 1,
                })
                .select('id')
                .single();

            if (questionError) {
                console.error('Question insertion error:', questionError);
                continue;
            }

            const questionId = questionData.id;

            if (quiz.type === 'multiple-choice') {
                const mcQuiz = quiz as MultipleChoiceData;
                const answersToInsert = mcQuiz.answers.map((answer, ansIdx) => ({
                    question_id: questionId,
                    answer_text: answer.text,
                    is_correct: answer.isCorrect,
                    position: ansIdx + 1,
                }));

                if (answersToInsert.length > 0) {
                    const { error: answersError } = await supabase
                        .from('answers')
                        .insert(answersToInsert);
                    if (answersError) console.error('Answers insertion error:', answersError);
                }
            } else if (quiz.type === 'media') {
                const mediaQuiz = quiz as MediaQuizData;
                const dbMediaType = mediaQuiz.mediaType === 'images' ? 'image' : 'video';

                const mediaToInsert = mediaQuiz.mediaSources.map((url, medIdx) => ({
                    question_id: questionId,
                    media_type: dbMediaType,
                    url: url,
                    position: medIdx + 1,
                }));

                if (mediaToInsert.length > 0) {
                    const { error: mediaError } = await supabase
                        .from('question_media')
                        .insert(mediaToInsert);
                    if (mediaError) console.error('Media insertion error:', mediaError);
                }
            }
        }

        return { quiz_id: quizId, play_url: `/play/${quizId}` };
    },

    /**
     * Fetches the complete nested game configuration from Supabase by its ID.
     */
    async getQuiz(quizId: string): Promise<GameConfig> {
        const { data: quizData, error: quizError } = await supabase
            .from('quizzes')
            .select(`
        id,
        background_image_url,
        card_count,
        questions (
          id,
          question_text,
          quiz_type,
          position,
          answers (
            id,
            answer_text,
            is_correct,
            position
          ),
          question_media (
            id,
            media_type,
            url,
            position
          )
        )
      `)
            .eq('id', quizId)
            .single();

        if (quizError || !quizData) {
            console.error('Quiz fetch error:', quizError);
            throw new Error('Quiz not found');
        }

        const questions = quizData.questions || [];
        questions.sort((a: any, b: any) => a.position - b.position);

        const config: GameConfig = {
            imageSource: quizData.background_image_url as string,
            cardCount: quizData.card_count as number,
            cards: questions.map((q: any, index: number) => {
                let quiz: QuizData;

                if (q.quiz_type === 'multiple_choice') {
                    const sortedAnswers = (q.answers || []).sort((a: any, b: any) => a.position - b.position);
                    quiz = {
                        type: 'multiple-choice',
                        question: q.question_text,
                        answers: sortedAnswers.map((ans: any) => ({
                            id: ans.id,
                            text: ans.answer_text,
                            isCorrect: ans.is_correct,
                        })),
                    } as MultipleChoiceData;
                } else {
                    const sortedMedia = (q.question_media || []).sort((a: any, b: any) => a.position - b.position);
                    const firstMediaType = sortedMedia.length > 0 ? sortedMedia[0].media_type : 'image';
                    const frontendMediaType = firstMediaType === 'video' ? 'video' : 'images';

                    quiz = {
                        type: 'media',
                        question: q.question_text,
                        mediaType: frontendMediaType,
                        mediaSources: sortedMedia.map((media: any) => media.url),
                    } as MediaQuizData;
                }

                return {
                    id: q.id,
                    index: index,
                    quiz,
                } as CardConfig;
            }),
        };

        return config;
    },
};
