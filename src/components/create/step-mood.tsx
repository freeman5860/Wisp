'use client';

import { useCreateFlowStore } from '@/stores/create-flow-store';
import { MoodSelector } from './mood-selector';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export function StepMood() {
  const { mood, prevStep, nextStep, imagePreviewUrl } = useCreateFlowStore();

  return (
    <div className="flex flex-col items-center min-h-[60vh] px-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-light tracking-wide">此刻的心情</h2>
        <p className="text-text-secondary mt-2">选一个最接近的</p>
      </div>

      {/* Photo thumbnail */}
      {imagePreviewUrl && (
        <div className="w-20 h-20 rounded-md overflow-hidden mb-6 shadow-card">
          <img
            src={imagePreviewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <MoodSelector />

      <div className="flex gap-3 mt-8">
        <Button variant="ghost" onClick={prevStep}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          返回
        </Button>
        <Button onClick={nextStep} disabled={!mood}>
          继续
        </Button>
      </div>
    </div>
  );
}
