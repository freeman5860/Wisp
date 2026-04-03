'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useCreateFlowStore } from '@/stores/create-flow-store';
import { FILTER_PRESETS, getPresetsForMood } from '@/lib/filters/presets';
import { applyFilter, canvasToBlob, generateFilterThumbnail } from '@/lib/filters/engine';
import { getMoodConfig } from '@/lib/constants';
import { ENHANCE_STYLES } from '@/lib/ai/enhance-styles';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Sparkles, Loader2, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { FilterPreset } from '@/lib/filters/types';

export function StepEnhance() {
  const {
    mood,
    imagePreviewUrl,
    filterId,
    setFilter,
    setCaption,
    setCaptionLoading,
    captionLoading,
    caption,
    prevStep,
    nextStep,
  } = useCreateFlowStore();

  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  // AI enhance state
  const [aiMode, setAiMode] = useState(false);
  const [aiStyle, setAiStyle] = useState('cinematic');
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const [aiResultUrl, setAiResultUrl] = useState<string | null>(null);

  const presets = mood ? getPresetsForMood(mood) : FILTER_PRESETS;
  const allPresets = mood
    ? [...presets, ...FILTER_PRESETS.filter((p) => p.mood !== mood)]
    : FILTER_PRESETS;

  // Load image
  useEffect(() => {
    if (!imagePreviewUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);
    };
    img.src = imagePreviewUrl;
  }, [imagePreviewUrl]);

  // Generate thumbnails once image loads
  useEffect(() => {
    if (!imageLoaded || !imgRef.current) return;
    const thumbs: Record<string, string> = {};
    allPresets.forEach((preset) => {
      thumbs[preset.id] = generateFilterThumbnail(imgRef.current!, preset);
    });
    setThumbnails(thumbs);

    // Auto-select first preset for current mood
    if (presets.length > 0 && !filterId) {
      handleSelectFilter(presets[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageLoaded]);

  // Fetch AI caption
  const fetchCaption = useCallback(async () => {
    if (!mood || caption) return;
    setCaptionLoading(true);
    try {
      const moodConfig = getMoodConfig(mood);
      const res = await fetch('/api/ai/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: moodConfig.label, moodType: mood }),
      });
      const data = await res.json();
      if (data.caption) setCaption(data.caption);
    } catch {
      // Caption generation failed silently
    } finally {
      setCaptionLoading(false);
    }
  }, [mood, caption, setCaption, setCaptionLoading]);

  useEffect(() => {
    fetchCaption();
  }, [fetchCaption]);

  const handleSelectFilter = async (preset: FilterPreset) => {
    if (!imgRef.current) return;
    setAiMode(false);
    setAiResultUrl(null);

    const canvas = applyFilter(imgRef.current, preset, 'preview');
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')!;
      canvasRef.current.width = canvas.width;
      canvasRef.current.height = canvas.height;
      ctx.drawImage(canvas, 0, 0);
    }

    const exportCanvas = applyFilter(imgRef.current, preset, 'export');
    const blob = await canvasToBlob(exportCanvas);
    setFilter(preset.id, blob);
  };

  const handleAiEnhance = async () => {
    if (!imagePreviewUrl || !mood) return;
    setAiEnhancing(true);
    setAiMode(true);
    try {
      // Convert blob URL to base64 for server-side processing
      const blobRes = await fetch(imagePreviewUrl);
      const blob = await blobRes.blob();
      const mimeType = blob.type || 'image/jpeg';
      const arrayBuffer = await blob.arrayBuffer();
      const imageBase64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const res = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          mood,
          style: aiStyle,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setAiResultUrl(data.enhancedUrl);

      // Fetch enhanced image as blob and set it as the filter result
      const enhancedRes = await fetch(data.enhancedUrl);
      const enhancedBlob = await enhancedRes.blob();
      setFilter(`ai-${aiStyle}`, enhancedBlob);

      toast.success('AI 增强完成！');
    } catch {
      toast.error('AI 增强失败，请重试');
      setAiMode(false);
    } finally {
      setAiEnhancing(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[60vh] px-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-light tracking-wide">AI 魔法时刻</h2>
        <p className="text-text-secondary mt-2">选择氛围，等待文案</p>
      </div>

      {/* Preview */}
      <div className="w-full max-w-sm aspect-[3/4] rounded-lg overflow-hidden bg-background-raised shadow-card mb-4 relative">
        {/* AI result or Canvas filter */}
        {aiMode && aiResultUrl ? (
          <img
            src={aiResultUrl}
            alt="AI enhanced"
            className="w-full h-full object-cover"
          />
        ) : (
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover"
            style={{ display: imageLoaded ? 'block' : 'none' }}
          />
        )}
        {(!imageLoaded && !aiMode) && (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-text-tertiary" />
          </div>
        )}

        {/* AI enhancing overlay */}
        {aiEnhancing && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 z-10">
            <Wand2 className="w-8 h-8 text-accent animate-pulse" />
            <p className="text-white text-sm">AI 正在施展魔法...</p>
            <p className="text-white/40 text-xs">大约需要 10-30 秒</p>
          </div>
        )}

        {/* Caption overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          {captionLoading ? (
            <div className="flex items-center gap-2 text-white/60">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-sm">AI 正在写文案...</span>
            </div>
          ) : caption ? (
            <p className="text-white text-lg font-light leading-relaxed">{caption}</p>
          ) : null}
        </div>
      </div>

      {/* Filter strip */}
      <div className="w-full max-w-sm overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max px-1">
          {allPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectFilter(preset)}
              className={cn(
                'flex-shrink-0 w-16 flex flex-col items-center gap-1 transition-all duration-200',
                filterId === preset.id && !aiMode ? 'scale-105' : 'opacity-70 hover:opacity-100'
              )}
            >
              <div
                className={cn(
                  'w-14 h-14 rounded-md overflow-hidden border-2 transition-colors',
                  filterId === preset.id && !aiMode ? 'border-accent' : 'border-transparent'
                )}
              >
                {thumbnails[preset.id] ? (
                  <img
                    src={thumbnails[preset.id]}
                    alt={preset.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-background-hover" />
                )}
              </div>
              <span className="text-[10px] text-text-secondary truncate w-full text-center">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Enhance section */}
      <div className="w-full max-w-sm mt-4 p-3 rounded-lg border border-border bg-background-raised">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">AI 风格增强</span>
          </div>
          <span className="text-[10px] text-text-tertiary px-2 py-0.5 rounded-full bg-background-hover">
            高级
          </span>
        </div>

        {/* Style selector */}
        <div className="flex gap-2 mb-3">
          {ENHANCE_STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setAiStyle(s.id)}
              className={cn(
                'flex-1 py-1.5 rounded-md text-xs transition-all border',
                aiStyle === s.id
                  ? 'bg-accent/15 text-accent border-accent/30'
                  : 'text-text-secondary border-border hover:border-border-bright'
              )}
            >
              {s.emoji} {s.name}
            </button>
          ))}
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={handleAiEnhance}
          disabled={aiEnhancing}
        >
          {aiEnhancing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              处理中...
            </>
          ) : (
            <>
              <Wand2 className="w-3.5 h-3.5 mr-1.5" />
              开始 AI 增强
            </>
          )}
        </Button>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="ghost" onClick={prevStep}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          返回
        </Button>
        <Button onClick={nextStep} disabled={!filterId}>
          预览
        </Button>
      </div>
    </div>
  );
}
