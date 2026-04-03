export interface EnhanceOptions {
  imageBase64: string;
  mimeType: string;
  mood: string;
  style?: 'anime' | 'cinematic' | 'painting' | 'dreamy' | 'vintage';
}

const STYLE_PROMPTS: Record<string, string> = {
  anime: 'anime style illustration, studio ghibli, soft lighting, warm colors, detailed background, cel shading',
  cinematic: 'cinematic film still, dramatic lighting, shallow depth of field, color graded, moody atmosphere, 35mm film',
  painting: 'oil painting, impressionist brushstrokes, rich colors, artistic, gallery quality, painterly texture',
  dreamy: 'ethereal dreamlike quality, soft focus, pastel colors, light leaks, magical atmosphere, bokeh',
  vintage: 'vintage film photography, kodak portra 400, film grain, warm tones, nostalgic, faded colors',
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
  const { imageBase64, mood, style = 'cinematic' } = options;

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error('Cloudflare credentials not configured');
  }

  const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.cinematic;
  const moodModifier = MOOD_MODIFIERS[mood] || '';

  const prompt = `${stylePrompt}, ${moodModifier}, high quality, detailed`;

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/runwayml/stable-diffusion-v1-5-img2img`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_b64: imageBase64,
        strength: 0.65,
        guidance: 7.5,
        num_steps: 20,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudflare AI error: ${response.status} ${error}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
