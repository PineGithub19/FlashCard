import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { GameConfig, QuizData, MultipleChoiceData, MediaQuizData } from '@/types/game';

// Helper to convert the camelCase config to the db schema snake_case and insert
export async function POST(request: Request) {
    try {
        const config: GameConfig = await request.json();

        if (!config || !config.cards || config.cards.length === 0) {
            return NextResponse.json({ error: 'Invalid game configuration' }, { status: 400 });
        }

        // 1. Create the Quiz record
        // Note: Assuming the user has added 'background_image_url' and 'card_count' to the quizzes table.
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
            return NextResponse.json({ error: 'Failed to create quiz record. Ensure background_image_url and card_count columns exist on the quizzes table.' }, { status: 500 });
        }

        const quizId = quizData.id;

        // 2. Insert Questions, Answers, and Media
        // To maintain foreign keys correctly, we process each card sequentially
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
                    position: i + 1, // Store 1-based order
                })
                .select('id')
                .single();

            if (questionError) {
                console.error('Question insertion error:', questionError);
                continue;
            }

            const questionId = questionData.id;

            // Insert relative data based on type
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
                // mediaType in our state is 'images' or 'video'. Map to db 'image' | 'video'
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

        return NextResponse.json({ quiz_id: quizId, play_url: `/play/${quizId}` });

    } catch (error) {
        console.error('Game saving API error:', error);
        return NextResponse.json({ error: 'Internal server error during game saving' }, { status: 500 });
    }
}
