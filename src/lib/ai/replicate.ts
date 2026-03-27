import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export interface EnhanceOptions {
  imageUrl: string;
  mood: string;
  style?: 'anime' | 'cinematic' | 'painting' | 'dreamy' | 'vintage';
}

const STYLE_PROMPTS: Record<string, string> = {
  anime: 'anime style illustration, studio ghibli inspired, soft lighting, warm colors, detailed background',
  cinematic: 'cinematic film still, dramatic lighting, shallow depth of field, color graded, moody atmosphere',
  painting: 'oil painting style, impressionist brushstrokes, rich colors, artistic interpretation, gallery quality',
  dreamy: 'ethereal dreamlike quality, soft focus, pastel colors, light leaks, magical atmosphere',
  vintage: 'vintage film photography, kodak portra 400, film grain, warm tones, nostalgic feeling',
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

export async function enhanceImage(options: EnhanceOptions): Promise<string> {
  const { imageUrl, mood, style = 'cinematic' } = options;

  const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.cinematic;
  const moodModifier = MOOD_MODIFIERS[mood] || '';

  const output = await replicate.run(
    'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
    {
      input: {
        image: imageUrl,
        prompt: `${stylePrompt}, ${moodModifier}, masterpiece, high quality`,
        negative_prompt: 'ugly, blurry, low quality, distorted, deformed',
        prompt_strength: 0.35,
        num_inference_steps: 30,
        guidance_scale: 7.5,
      },
    }
  );

  // Replicate returns an array of URLs or a single URL
  if (Array.isArray(output)) {
    return output[0] as string;
  }
  return output as unknown as string;
}

export const ENHANCE_STYLES = [
  { id: 'cinematic', name: '电影感', emoji: '🎬' },
  { id: 'anime', name: '动漫风', emoji: '🎨' },
  { id: 'painting', name: '油画', emoji: '🖼️' },
  { id: 'dreamy', name: '梦境', emoji: '✨' },
  { id: 'vintage', name: '复古胶片', emoji: '📷' },
] as const;
