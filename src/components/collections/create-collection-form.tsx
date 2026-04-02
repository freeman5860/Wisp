'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Globe, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateCollectionFormProps {
  onCreated: (id: string) => void;
}

export function CreateCollectionForm({ onCreated }: CreateCollectionFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          is_public: isPublic,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('合集已创建');
      onCreated(data.id);
    } catch {
      toast.error('创建失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm text-text-secondary mb-1.5">合集名称</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          placeholder="给合集起个名字..."
          className="w-full h-10 rounded-md border border-border bg-background-raised px-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-border-bright"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1.5">描述</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={200}
          rows={3}
          placeholder="用一句话描述这个合集..."
          className="w-full rounded-md border border-border bg-background-raised px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-border-bright"
        />
        <p className="text-xs text-text-tertiary mt-1 text-right">{description.length}/200</p>
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-2">可见性</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsPublic(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm border transition-colors ${
              isPublic
                ? 'border-accent/40 bg-accent/10 text-accent'
                : 'border-border text-text-secondary hover:border-border-bright'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            公开
          </button>
          <button
            type="button"
            onClick={() => setIsPublic(false)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm border transition-colors ${
              !isPublic
                ? 'border-accent/40 bg-accent/10 text-accent'
                : 'border-border text-text-secondary hover:border-border-bright'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            私密
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={saving || !name.trim()}>
        {saving && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
        创建合集
      </Button>
    </form>
  );
}
