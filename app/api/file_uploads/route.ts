import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (type !== 'image' && type !== 'video') {
            return NextResponse.json({ error: 'Invalid media type. Must be "image" or "video"' }, { status: 400 });
        }

        const bucketName = type === 'image' ? 'images/private' : 'videos/private';

        // Create a unique filename while preserving extension
        const ext = file.name.split('.').pop() || '';
        const filename = `${uuidv4()}${ext ? `.${ext}` : ''}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filename, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            return NextResponse.json({ error: 'Failed to upload file to storage' }, { status: 500 });
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filename);

        return NextResponse.json({ url: publicUrl });

    } catch (error) {
        console.error('File upload API error:', error);
        return NextResponse.json({ error: 'Internal server error during upload' }, { status: 500 });
    }
}
