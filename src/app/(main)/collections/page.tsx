'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { CollectionCard } from '@/components/collections/collection-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Collection } from '@/types/collection';

export default function CollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/collections?mine=true')
      .then((res) => res.json())
      .then((data) => setCollections(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-light tracking-wide">我的合集</h1>
          <Button size="sm" onClick={() => router.push('/collections/create')}>
            <Plus className="w-4 h-4 mr-1" />
            新建
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[16/9] rounded-lg" />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-secondary mb-4">还没有合集</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push('/collections/create')}
            >
              <Plus className="w-4 h-4 mr-1" />
              创建第一个合集
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((c) => (
              <CollectionCard
                key={c.id}
                collection={c}
                onClick={() => router.push(`/collections/${c.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
