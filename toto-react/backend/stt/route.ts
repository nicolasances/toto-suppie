import { NextRequest, NextResponse } from 'next/server';
import * as speech from '@google-cloud/speech';

export async function POST(request: NextRequest) {

    try {
        const formData = await request.formData();
        const audioFile = formData.get('file') as File | null;

        if (!audioFile) {
            return NextResponse.json({ message: 'Audio file is required' }, { status: 400 });
        }

        const audioBytes = Buffer.from(await audioFile.arrayBuffer()).toString('base64');

        const client = new speech.SpeechClient();

        const isMp4 = audioFile.type.includes('mp4');
        const encoding = isMp4
            ? speech.protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3
            : speech.protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.WEBM_OPUS;

        const [response] = await client.recognize({
            audio: { content: audioBytes },
            config: {
                encoding,
                sampleRateHertz: isMp4 ? 44100 : 48000,
                languageCode: 'en-US',
            },
        });

        const transcription = response.results
            ?.map(result => result.alternatives?.[0]?.transcript)
            .filter(Boolean)
            .join(' ') ?? '';

        return NextResponse.json({ text: transcription });
    } catch (error) {
        console.error('STT Error:', error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
