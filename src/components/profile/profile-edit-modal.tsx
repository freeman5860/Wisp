'use client';

import { useState, useRef } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Profile } from '@/types/profile';

interface ProfileEditModalProps {
  open: boolean;
  onClose: () => void;
  profile: Profile;
  onSaved: (profile: Profile) => void;
}

export function ProfileEditModal({ open, onClose, profile, onSaved }: ProfileEditModalProps) {
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAvatarPreview(data.avatar_url);
      toast.success('头像已更新');
    } catch {
      toast.error('头像上传失败');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName.trim(),
          bio: bio.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSaved({ ...data, avatar_url: avatarPreview });
      toast.success('资料已更新');
      onClose();
    } catch {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="编辑资料">
      <div className="space-y-5">
        {/* Avatar */}
        <div className="flex justify-center">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadingAvatar}
            className="relative w-20 h-20 rounded-full bg-background-hover border-2 border-border overflow-hidden hover:border-border-bright transition-colors"
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl text-text-tertiary">
                {displayName?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              {uploadingAvatar ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </div>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {/* Display name */}
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">昵称</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={30}
            className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-border-bright"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">签名</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={200}
            rows={3}
            placeholder="写一句话介绍自己..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-border-bright"
          />
          <p className="text-xs text-text-tertiary mt-1 text-right">{bio.length}/200</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            取消
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !displayName.trim()}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            保存
          </Button>
        </div>
      </div>
    </Modal>
  );
}
