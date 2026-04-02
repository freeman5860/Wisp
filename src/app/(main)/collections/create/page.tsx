'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { CreateCollectionForm } from '@/components/collections/create-collection-form';

export default function CreateCollectionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">返回</span>
        </button>

        <h1 className="text-2xl font-light tracking-wide mb-6">新建合集</h1>

        <CreateCollectionForm
          onCreated={(id) => router.push(`/collections/${id}`)}
        />
      </div>
    </div>
  );
}
