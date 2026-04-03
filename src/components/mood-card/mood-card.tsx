'use client';

import { MoodBadge } from './mood-badge';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import type { MoodCard as MoodCardType } from '@/types/card';

interface MoodCardProps {
  card: MoodCardType;
  onClick?: () => void;
  className?: string;
}

export function MoodCard({ card, onClick, className }: MoodCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative aspect-[3/4] rounded-lg overflow-hidden bg-background-raised shadow-card',
        'transition-all duration-300 cursor-pointer group',
        'hover:scale-[1.02] hover:shadow-card-hover',
        className
      )}
    >
      {/* Photo */}
      <img
        src={card.image_url}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {/* Mood badge */}
      <div className="absolute top-3 right-3">
        <MoodBadge mood={card.mood} size="sm" />
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-5">
        <p className="text-white text-lg font-light leading-relaxed line-clamp-3">
          {card.caption}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-white/40">
            {formatDate(card.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}
