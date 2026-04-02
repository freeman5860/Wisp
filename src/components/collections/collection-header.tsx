'use client';

import { ArrowLeft, Share2, Trash2, Globe, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { Collection } from '@/types/collection';

interface CollectionHeaderProps {
  collection: Collection;
  isOwn: boolean;
  onDeleted?: () => void;
}

export function CollectionHeader({ collection, isOwn, onDeleted }: CollectionHeaderProps) {
  const router = useRouter();

  const handleShare = async () => {
    const url = `${window.location.origin}/collections/${collection.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: collection.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('链接已复制');
      }
    } catch {}
  };

  const handleDelete = async () => {
    if (!confirm('确定删除这个合集吗？')) return;
    try {
      await fetch(`/api/collections/${collection.id}`, { method: 'DELETE' });
      toast.success('已删除');
      onDeleted?.();
    } catch {
      toast.error('删除失败');
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-text-secondary hover:text-text-primary mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">返回</span>
      </button>

      {collection.cover_url && (
        <div className="aspect-[21/9] rounded-lg overflow-hidden mb-4 bg-background-hover">
          <img
            src={collection.cover_url}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <h1 className="text-2xl font-light tracking-wide">{collection.name}</h1>
      {collection.description && (
        <p className="text-sm text-text-secondary mt-1">{collection.description}</p>
      )}
      <div className="flex items-center gap-1.5 text-xs text-text-tertiary mt-2">
        {collection.is_public ? (
          <Globe className="w-3 h-3" />
        ) : (
          <Lock className="w-3 h-3" />
        )}
        <span>{collection.card_count} 张卡片</span>
      </div>

      <div className="flex gap-2 mt-4">
        <Button variant="secondary" size="sm" onClick={handleShare}>
          <Share2 className="w-3.5 h-3.5 mr-1.5" />
          分享
        </Button>
        {isOwn && (
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            删除
          </Button>
        )}
      </div>
    </div>
  );
}
