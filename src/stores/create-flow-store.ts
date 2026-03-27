import { create } from 'zustand';
import type { MoodType } from '@/types/mood';

export type CreateStep = 'upload' | 'mood' | 'enhance' | 'preview';

interface CreateFlowState {
  step: CreateStep;
  imageFile: File | null;
  imagePreviewUrl: string | null;
  mood: MoodType | null;
  filterId: string | null;
  filteredImageBlob: Blob | null;
  filteredPreviewUrl: string | null;
  caption: string | null;
  captionLoading: boolean;
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  isPublic: boolean;
  publishing: boolean;

  // Actions
  setImage: (file: File) => void;
  setMood: (mood: MoodType) => void;
  setFilter: (filterId: string, blob: Blob) => void;
  setCaption: (caption: string) => void;
  setCaptionLoading: (loading: boolean) => void;
  setLocation: (lat: number, lng: number, name?: string) => void;
  setIsPublic: (isPublic: boolean) => void;
  setPublishing: (publishing: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: CreateStep) => void;
  reset: () => void;
}

const STEP_ORDER: CreateStep[] = ['upload', 'mood', 'enhance', 'preview'];

export const useCreateFlowStore = create<CreateFlowState>((set, get) => ({
  step: 'upload',
  imageFile: null,
  imagePreviewUrl: null,
  mood: null,
  filterId: null,
  filteredImageBlob: null,
  filteredPreviewUrl: null,
  caption: null,
  captionLoading: false,
  latitude: null,
  longitude: null,
  locationName: null,
  isPublic: true,
  publishing: false,

  setImage: (file) => {
    // Revoke previous URL
    const prev = get().imagePreviewUrl;
    if (prev) URL.revokeObjectURL(prev);
    const filtered = get().filteredPreviewUrl;
    if (filtered) URL.revokeObjectURL(filtered);

    set({
      imageFile: file,
      imagePreviewUrl: URL.createObjectURL(file),
      // Reset downstream state
      filterId: null,
      filteredImageBlob: null,
      filteredPreviewUrl: null,
      caption: null,
    });
  },

  setMood: (mood) => set({ mood, filterId: null, filteredImageBlob: null, caption: null }),

  setFilter: (filterId, blob) => {
    const prev = get().filteredPreviewUrl;
    if (prev) URL.revokeObjectURL(prev);
    set({
      filterId,
      filteredImageBlob: blob,
      filteredPreviewUrl: URL.createObjectURL(blob),
    });
  },

  setCaption: (caption) => set({ caption }),
  setCaptionLoading: (loading) => set({ captionLoading: loading }),
  setLocation: (lat, lng, name) =>
    set({ latitude: lat, longitude: lng, locationName: name || null }),
  setIsPublic: (isPublic) => set({ isPublic }),
  setPublishing: (publishing) => set({ publishing }),

  nextStep: () => {
    const { step } = get();
    const idx = STEP_ORDER.indexOf(step);
    if (idx < STEP_ORDER.length - 1) {
      set({ step: STEP_ORDER[idx + 1] });
    }
  },

  prevStep: () => {
    const { step } = get();
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) {
      set({ step: STEP_ORDER[idx - 1] });
    }
  },

  goToStep: (step) => set({ step }),

  reset: () => {
    const prev = get().imagePreviewUrl;
    if (prev) URL.revokeObjectURL(prev);
    const filtered = get().filteredPreviewUrl;
    if (filtered) URL.revokeObjectURL(filtered);

    set({
      step: 'upload',
      imageFile: null,
      imagePreviewUrl: null,
      mood: null,
      filterId: null,
      filteredImageBlob: null,
      filteredPreviewUrl: null,
      caption: null,
      captionLoading: false,
      latitude: null,
      longitude: null,
      locationName: null,
      isPublic: true,
      publishing: false,
    });
  },
}));
