import type { MoodType } from '@/types/mood';

export interface FilterPreset {
  id: string;
  name: string;
  mood: MoodType;
  // CSS filter values
  brightness: number;     // 0-2, default 1
  contrast: number;       // 0-2, default 1
  saturation: number;     // 0-2, default 1
  hueRotate: number;      // 0-360 degrees
  sepia: number;          // 0-1
  blur: number;           // px
  // Custom adjustments
  temperature: number;    // -50 to 50 (negative = cool, positive = warm)
  grain: number;          // 0-0.3 (grain intensity)
  vignette: number;       // 0-1 (vignette intensity)
  overlayColor?: string;  // optional color overlay with opacity
  overlayOpacity?: number;
}

export type FilterAdjustments = Partial<FilterPreset>;
