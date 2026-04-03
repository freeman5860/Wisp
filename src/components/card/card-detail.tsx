'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoodBadge } from '@/components/mood-card/mood-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Share2, Trash2, Download, FolderPlus } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { AddToCollectionModal } from '@/components/collections/add-to-collection-modal';
import type { MoodCard } from '@/types/card';

export function CardDetail({ id }: { id: string }) {
  const router = useRouter();
  const [card, setCard] = useState<MoodCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/cards/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setCard(data);
      })
      .catch(() => toast.error('加载失败'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    const url = `${window.location.origin}/card/${id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Wisp',
          text: card?.caption || '',
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('链接已复制');
      }
    } catch {
      // User cancelled share or clipboard failed
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `/api/cards/${id}/share?download=true`;
    link.download = `wisp-${id}.png`;
    link.click();
    toast.success('开始下载');
  };

  const handleDelete = async () => {
    if (!confirm('确定删除这张卡片吗？')) return;
    try {
      await fetch(`/api/cards/${id}`, { method: 'DELETE' });
      toast.success('已删除');
      router.push('/my-cards');
    } catch {
      toast.error('删除失败');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-sm px-4">
          <Skeleton className="aspect-[3/4] rounded-lg" />
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary">找不到这张卡片</p>
          <Button variant="ghost" className="mt-4" onClick={() => router.back()}>
            返回
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-sm mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">返回</span>
        </button>

        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-background-raised shadow-card">
          <img
            src={card.image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          <div className="absolute top-3 right-3">
            <MoodBadge mood={card.mood} />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="text-white text-xl font-light leading-relaxed">
              {card.caption}
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-white/40">
                {formatDate(card.created_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-6">
          <Button variant="secondary" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-1.5" />
            分享
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setCollectionModalOpen(true)}>
            <FolderPlus className="w-4 h-4 mr-1.5" />
            收藏
          </Button>
          <Button variant="secondary" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-1.5" />
            下载
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-1.5" />
            删除
          </Button>
        </div>

        <AddToCollectionModal
          open={collectionModalOpen}
          onClose={() => setCollectionModalOpen(false)}
          cardId={id}
        />
      </div>
    </div>
  );
}
