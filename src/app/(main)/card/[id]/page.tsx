import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getMoodConfig, APP_NAME } from '@/lib/constants';
import { CardDetail } from '@/components/card/card-detail';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: card } = await supabase
    .from('mood_cards')
    .select('caption, mood, image_url')
    .eq('id', id)
    .single();

  if (!card) {
    return { title: '找不到卡片' };
  }

  const moodConfig = getMoodConfig(card.mood);
  const title = `${moodConfig.emoji} ${card.caption.slice(0, 30)}`;
  const shareImageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/cards/${id}/share`;

  return {
    title,
    description: card.caption,
    openGraph: {
      title: `${title} | ${APP_NAME}`,
      description: card.caption,
      images: [
        {
          url: shareImageUrl,
          width: 1080,
          height: 1440,
          alt: card.caption,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${APP_NAME}`,
      description: card.caption,
      images: [shareImageUrl],
    },
  };
}

export default async function CardPage({ params }: Props) {
  const { id } = await params;
  return <CardDetail id={id} />;
}
