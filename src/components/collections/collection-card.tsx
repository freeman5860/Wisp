'use client';

import type { Collection } from '@/types/collection';

interface CollectionCardProps {
  collection: Collection;
  onClick?: () => void;
}

export function CollectionCard({ collection, onClick }: CollectionCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-background-raised border border-border rounded-lg overflow-hidden hover:border-border-bright hover:scale-[1.02] transition-all cursor-pointer"
    >
      <div className="aspect-[16/9] bg-background-hover overflow-hidden">
        {collection.cover_url ? (
          <img
            src={collection.cover_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl text-text-tertiary">
            📁
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium truncate">{collection.name}</p>
        <p className="text-xs text-text-secondary mt-0.5">
          {collection.card_count} 张卡片
          {collection.is_public ? '' : ' · 私密'}
        </p>
      </div>
    </div>
  );
}
