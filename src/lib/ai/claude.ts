import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateCaption(prompt: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 100,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = message.content.find((block) => block.type === 'text');
  return textBlock?.text?.trim() || '';
}
