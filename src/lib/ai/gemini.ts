import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function generateCaption(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      maxOutputTokens: 100,
    },
  });

  return response.text?.trim() || '';
}

export interface EnhanceOptions {
  imageBase64: string;
  mimeType: string;
  mood: string;
  style?: 'anime' | 'cinematic' | 'painting' | 'dreamy' | 'vintage';
}

const STYLE_PROMPTS: Record<string, string> = {
  anime: 'Transform this photo into anime style illustration, studio ghibli inspired, soft lighting, warm colors, detailed background',
  cinematic: 'Transform this photo into a cinematic film still, dramatic lighting, shallow depth of field, color graded, moody atmosphere',
  painting: 'Transform this photo into oil painting style, impressionist brushstrokes, rich colors, artistic interpretation, gallery quality',
  dreamy: 'Transform this photo to have an ethereal dreamlike quality, soft focus, pastel colors, light leaks, magical atmosphere',
  vintage: 'Transform this photo into vintage film photography style, kodak portra 400, film grain, warm tones, nostalgic feeling',
};

const MOOD_MODIFIERS: Record<string, string> = {
  joy: 'bright, warm, golden hour, cheerful',
  melancholy: 'moody, blue tones, rain, overcast',
  calm: 'serene, peaceful, soft light, minimal',
  anxious: 'tense, high contrast, unsettling, sharp',
  nostalgic: 'sepia, warm, old photos, memory-like',
  excited: 'vibrant, energetic, dynamic, bold colors',
  lonely: 'isolated, dark, cool tones, quiet',
  grateful: 'warm, soft, glowing, heartfelt',
  dreamy: 'ethereal, hazy, surreal, floating',
  rebellious: 'gritty, raw, high contrast, punk',
};

export async function enhanceImage(options: EnhanceOptions): Promise<Buffer> {
  const { imageBase64, mimeType, mood, style = 'cinematic' } = options;

  const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.cinematic;
  const moodModifier = MOOD_MODIFIERS[mood] || '';

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [
      {
        text: `${stylePrompt}. Mood: ${moodModifier}. Keep the composition and subject the same, only change the visual style. Output a high quality image.`,
      },
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
    ],
    config: {
      responseModalities: ['image', 'text'],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error('No response from Gemini');

  for (const part of parts) {
    if (part.inlineData) {
      return Buffer.from(part.inlineData.data!, 'base64');
    }
  }

  throw new Error('No image in Gemini response');
}

export const ENHANCE_STYLES = [
  { id: 'cinematic', name: '电影感', emoji: '🎬' },
  { id: 'anime', name: '动漫风', emoji: '🎨' },
  { id: 'painting', name: '油画', emoji: '🖼️' },
  { id: 'dreamy', name: '梦境', emoji: '✨' },
  { id: 'vintage', name: '复古胶片', emoji: '📷' },
] as const;
