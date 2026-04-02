'use client';

import { Camera, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMoodConfig } from '@/lib/constants';
import Link from 'next/link';
import type { ProfileWithStats } from '@/types/profile';

interface ProfileHeaderProps {
  profile: ProfileWithStats;
  isOwn: boolean;
  onEdit?: () => void;
}

export function ProfileHeader({ profile, isOwn, onEdit }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center mb-8">
      <div className="relative mb-4">
        <div className="w-20 h-20 rounded-full bg-background-hover border-2 border-border overflow-hidden">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl text-text-tertiary">
              {profile.display_name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>
        {isOwn && onEdit && (
          <button
            onClick={onEdit}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent text-background flex items-center justify-center hover:bg-accent-hover transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <h1 className="text-xl font-medium">{profile.display_name || '未命名'}</h1>
      {profile.bio && (
        <p className="text-sm text-text-secondary mt-1 max-w-xs">{profile.bio}</p>
      )}

      <div className="flex items-center gap-6 mt-5">
        <div className="text-center">
          <p className="text-lg font-medium">{profile.stats.total_cards}</p>
          <p className="text-xs text-text-tertiary">卡片</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-medium">{profile.stats.days_active}</p>
          <p className="text-xs text-text-tertiary">活跃天</p>
        </div>
        {profile.stats.top_mood && (
          <div className="text-center">
            <p className="text-lg">{getMoodConfig(profile.stats.top_mood).emoji}</p>
            <p className="text-xs text-text-tertiary">最常</p>
          </div>
        )}
      </div>

      {isOwn && (
        <div className="flex gap-2 mt-5">
          <Button variant="secondary" size="sm" onClick={onEdit}>
            编辑资料
          </Button>
          <Link href="/insights">
            <Button variant="secondary" size="sm">
              <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
              情绪洞察
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
