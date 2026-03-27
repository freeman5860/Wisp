'use client';

import { useCreateFlowStore } from '@/stores/create-flow-store';
import { StepUpload } from './step-upload';
import { StepMood } from './step-mood';
import { StepEnhance } from './step-enhance';
import { StepPreview } from './step-preview';
import { AnimatePresence, motion } from 'framer-motion';

const STEPS = {
  upload: StepUpload,
  mood: StepMood,
  enhance: StepEnhance,
  preview: StepPreview,
} as const;

const STEP_LABELS = ['拍照', '心情', '魔法', '发布'];

export function CreateWizard() {
  const step = useCreateFlowStore((s) => s.step);
  const StepComponent = STEPS[step];
  const stepIndex = Object.keys(STEPS).indexOf(step);

  return (
    <div className="w-full max-w-lg mx-auto py-8">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-8 px-4">
        {STEP_LABELS.map((label, idx) => (
          <div key={label} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx <= stepIndex
                    ? 'bg-accent scale-110'
                    : 'bg-border'
                }`}
              />
              <span
                className={`text-[10px] ${
                  idx <= stepIndex ? 'text-accent' : 'text-text-tertiary'
                }`}
              >
                {label}
              </span>
            </div>
            {idx < STEP_LABELS.length - 1 && (
              <div
                className={`w-8 h-px mb-4 transition-colors ${
                  idx < stepIndex ? 'bg-accent' : 'bg-border'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <StepComponent />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
