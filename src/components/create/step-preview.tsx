'use client';

import { useCreateFlowStore } from '@/stores/create-flow-store';
import { useGeolocation } from '@/hooks/use-geolocation';
import { MoodBadge } from '@/components/mood-card/mood-badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MapPin, Send, Globe, Lock, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

export function StepPreview() {
  const router = useRouter();
  const {
    mood,
    filteredPreviewUrl,
    caption,
    captionLoading,
    isPublic,
    setIsPublic,
    setLocation,
    setCaption,
    setCaptionLoading,
    publishing,
    setPublishing,
    prevStep,
    filteredImageBlob,
    imageFile,
    latitude,
    longitude,
    locationName,
    filterId,
    reset,
  } = useCreateFlowStore();

  const { location } = useGeolocation();

  // Sync geolocation
  useEffect(() => {
    if (location) {
      setLocation(location.latitude, location.longitude, location.locationName);
    }
  }, [location, setLocation]);

  const handleRefreshCaption = async () => {
    if (!mood) return;
    setCaptionLoading(true);
    try {
      const { getMoodConfig } = await import('@/lib/constants');
      const config = getMoodConfig(mood);
      const res = await fetch('/api/ai/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: config.label, moodType: mood }),
      });
      const data = await res.json();
      if (data.caption) setCaption(data.caption);
    } catch {
      toast.error('文案生成失败');
    } finally {
      setCaptionLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!filteredImageBlob || !mood || !caption || !imageFile) return;
    setPublishing(true);

    try {
      // Step 1: Upload images
      const formData = new FormData();
      formData.append('original', imageFile);
      formData.append('filtered', filteredImageBlob, 'filtered.jpg');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!uploadRes.ok) throw new Error('上传失败');
      const uploadData = await uploadRes.json();

      // Step 2: Create card
      const cardRes = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: uploadData.filteredUrl,
          thumbnail_url: uploadData.thumbnailUrl,
          original_url: uploadData.originalUrl,
          mood,
          filter_id: filterId,
          caption,
          latitude,
          longitude,
          location_name: locationName,
          is_public: isPublic,
        }),
      });
      if (!cardRes.ok) throw new Error('发布失败');
      const cardData = await cardRes.json();

      toast.success('发布成功！');
      reset();
      router.push(`/card/${cardData.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '发布失败';
      toast.error(message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[60vh] px-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-light tracking-wide">预览你的心情卡片</h2>
      </div>

      {/* Card preview */}
      <div className="w-full max-w-sm aspect-[3/4] rounded-lg overflow-hidden bg-background-raised shadow-card relative">
        {filteredPreviewUrl && (
          <img
            src={filteredPreviewUrl}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {mood && (
          <div className="absolute top-3 right-3">
            <MoodBadge mood={mood} size="sm" />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 pb-5">
          {captionLoading ? (
            <div className="flex items-center gap-2 text-white/60">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">生成中...</span>
            </div>
          ) : (
            <p className="text-white text-lg font-light leading-relaxed">{caption}</p>
          )}
          {locationName && (
            <span className="flex items-center gap-1 text-xs text-white/60 mt-2">
              <MapPin className="w-3 h-3" />
              {locationName}
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-sm mt-4 space-y-3">
        {/* Refresh caption */}
        <button
          onClick={handleRefreshCaption}
          disabled={captionLoading}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', captionLoading && 'animate-spin')} />
          换一句文案
        </button>

        {/* Public toggle */}
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-text-secondary">可见范围</span>
          <button
            onClick={() => setIsPublic(!isPublic)}
            className="flex items-center gap-1.5 text-sm text-text-primary"
          >
            {isPublic ? (
              <>
                <Globe className="w-4 h-4 text-mood-calm" /> 公开
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-text-tertiary" /> 仅自己
              </>
            )}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button variant="ghost" onClick={prevStep}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          返回
        </Button>
        <Button
          size="lg"
          onClick={handlePublish}
          disabled={publishing || captionLoading || !caption}
        >
          {publishing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              发布中...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              发布
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
