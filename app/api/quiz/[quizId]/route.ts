import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { GameConfig, CardConfig, QuizData, MultipleChoiceData, MediaQuizData } from '@/types/game';
// import { generateId } from '@/lib/imageUtils';

export async function GET(request: Request, { params }: { params: Promise<{ quizId: string }> }) {
    try {
        const { quizId } = await params;

        // Fetch quiz with all relations nested
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
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
        }

        // Sort questions by position
        const questions = quizData.questions || [];
        questions.sort((a: any, b: any) => a.position - b.position);

        // Map database rows back into our frontend GameConfig
        const config: GameConfig = {
            imageSource: quizData.background_image_url as string,
            cardCount: quizData.card_count as number,
            cards: questions.map((q: any, index: number) => {
                let quiz: QuizData;

                if (q.quiz_type === 'multiple_choice') {
                    // Sort answers by position
                    const sortedAnswers = (q.answers || []).sort((a: any, b: any) => a.position - b.position);

                    quiz = {
                        type: 'multiple-choice',
                        question: q.question_text,
                        answers: sortedAnswers.map((ans: any) => ({
                            id: ans.id, // Or generate new client ID
                            text: ans.answer_text,
                            isCorrect: ans.is_correct,
                        })),
                    } as MultipleChoiceData;

                } else {
                    // Sort media by position
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
                    id: q.id, // Or generate client ID
                    index: index, // frontend grid expects 0-based
                    quiz,
                } as CardConfig;
            }),
        };

        return NextResponse.json(config);

    } catch (error) {
        console.error('Quiz view API error:', error);
        return NextResponse.json({ error: 'Internal server error while fetching quiz' }, { status: 500 });
    }
}
