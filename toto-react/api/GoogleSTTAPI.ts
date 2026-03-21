/**
 * API to transcribe audio using Google Cloud Speech-to-Text
 */
export class GoogleSTTAPI {

  async transcribeAudio(audioBlob: Blob): Promise<STTResponse> {

    const formData = new FormData();
    const fileName = audioBlob.type.includes('mp4') ? 'audio.mp4' : 'audio.webm';

    formData.append('file', audioBlob, fileName);

    const response = await fetch('/api/stt', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error(`STT request failed: ${response.statusText}`);

    return response.json() as Promise<STTResponse>;
  }
}

interface STTResponse {
  text?: string;
}
