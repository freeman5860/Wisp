'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Loader2, Check, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { Collection } from '@/types/collection';

interface AddToCollectionModalProps {
  open: boolean;
  onClose: () => void;
  cardId: string;
}

export function AddToCollectionModal({ open, onClose, cardId }: AddToCollectionModalProps) {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/collections?mine=true&card_id=${cardId}`)
      .then((res) => res.json())
      .then((data) => setCollections(Array.isArray(data) ? data : []))
      .catch(() => setCollections([]))
      .finally(() => setLoading(false));
  }, [open, cardId]);

  const toggle = async (collection: Collection) => {
    setToggling(collection.id);
    try {
      if (collection.has_card) {
        await fetch(`/api/collections/${collection.id}/cards`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ card_id: cardId }),
        });
        setCollections((prev) =>
          prev.map((c) =>
            c.id === collection.id
              ? { ...c, has_card: false, card_count: c.card_count - 1 }
              : c
          )
        );
      } else {
        const res = await fetch(`/api/collections/${collection.id}/cards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ card_id: cardId }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }
        setCollections((prev) =>
          prev.map((c) =>
            c.id === collection.id
              ? { ...c, has_card: true, card_count: c.card_count + 1 }
              : c
          )
        );
      }
    } catch (e: any) {
      toast.error(e.message || '操作失败');
    } finally {
      setToggling(null);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="添加到合集">
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-text-tertiary" />
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-text-secondary mb-3">还没有合集</p>
          <button
            onClick={() => {
              onClose();
              router.push('/collections/create');
            }}
            className="inline-flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            创建第一个合集
          </button>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {collections.map((c) => (
            <button
              key={c.id}
              onClick={() => toggle(c)}
              disabled={toggling === c.id}
              className="w-full flex items-center gap-3 p-3 rounded-md border border-border hover:border-border-bright transition-colors text-left"
            >
              <div className="w-10 h-10 rounded bg-background-hover overflow-hidden flex-shrink-0">
                {c.cover_url ? (
                  <img src={c.cover_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-tertiary">📁</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{c.name}</p>
                <p className="text-xs text-text-tertiary">{c.card_count} 张</p>
              </div>
              <div className="flex-shrink-0">
                {toggling === c.id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-text-tertiary" />
                ) : c.has_card ? (
                  <div className="w-5 h-5 rounded bg-accent/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-accent" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded border border-border" />
                )}
              </div>
            </button>
          ))}

          <button
            onClick={() => {
              onClose();
              router.push('/collections/create');
            }}
            className="w-full flex items-center gap-2 p-3 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建合集
          </button>
        </div>
      )}
    </Modal>
  );
}
