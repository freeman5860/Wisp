import type { FilterPreset } from './types';

/**
 * Canvas filter engine.
 * Renders photo with mood-based filter presets.
 * Uses CSS filters for GPU-accelerated operations (brightness, contrast, etc.)
 * and pixel manipulation only for temperature and grain.
 */

const MAX_PREVIEW_SIZE = 800;
const MAX_EXPORT_SIZE = 1920;

export function applyFilter(
  sourceImage: HTMLImageElement,
  preset: FilterPreset,
  mode: 'preview' | 'export' = 'preview'
): HTMLCanvasElement {
  const maxSize = mode === 'preview' ? MAX_PREVIEW_SIZE : MAX_EXPORT_SIZE;
  const scale = Math.min(1, maxSize / Math.max(sourceImage.width, sourceImage.height));
  const width = Math.round(sourceImage.width * scale);
  const height = Math.round(sourceImage.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Step 1: Apply CSS filters (GPU-accelerated)
  const cssFilter = buildCSSFilter(preset);
  ctx.filter = cssFilter;
  ctx.drawImage(sourceImage, 0, 0, width, height);
  ctx.filter = 'none';

  // Step 2: Temperature shift (pixel manipulation)
  if (preset.temperature !== 0) {
    applyTemperature(ctx, width, height, preset.temperature);
  }

  // Step 3: Grain
  if (preset.grain > 0) {
    applyGrain(ctx, width, height, preset.grain);
  }

  // Step 4: Color overlay
  if (preset.overlayColor && preset.overlayOpacity) {
    ctx.globalAlpha = preset.overlayOpacity;
    ctx.fillStyle = preset.overlayColor;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
  }

  // Step 5: Vignette
  if (preset.vignette > 0) {
    applyVignette(ctx, width, height, preset.vignette);
  }

  return canvas;
}

function buildCSSFilter(preset: FilterPreset): string {
  const parts: string[] = [];
  if (preset.brightness !== 1) parts.push(`brightness(${preset.brightness})`);
  if (preset.contrast !== 1) parts.push(`contrast(${preset.contrast})`);
  if (preset.saturation !== 1) parts.push(`saturate(${preset.saturation})`);
  if (preset.hueRotate !== 0) parts.push(`hue-rotate(${preset.hueRotate}deg)`);
  if (preset.sepia > 0) parts.push(`sepia(${preset.sepia})`);
  if (preset.blur > 0) parts.push(`blur(${preset.blur}px)`);
  return parts.length > 0 ? parts.join(' ') : 'none';
}

function applyTemperature(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  temperature: number
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const warmth = temperature / 50; // normalize to -1 to 1

  for (let i = 0; i < data.length; i += 4) {
    // Warm: boost red, reduce blue. Cool: boost blue, reduce red.
    data[i] = clamp(data[i] + warmth * 15);         // R
    data[i + 2] = clamp(data[i + 2] - warmth * 15); // B
  }

  ctx.putImageData(imageData, 0, 0);
}

function applyGrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const amount = intensity * 255;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * amount;
    data[i] = clamp(data[i] + noise);
    data[i + 1] = clamp(data[i + 1] + noise);
    data[i + 2] = clamp(data[i + 2] + noise);
  }

  ctx.putImageData(imageData, 0, 0);
}

function applyVignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number
) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.max(cx, cy);

  const gradient = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, radius);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, `rgba(0,0,0,${intensity})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/**
 * Generate a small thumbnail for filter strip preview.
 */
export function generateFilterThumbnail(
  sourceImage: HTMLImageElement,
  preset: FilterPreset
): string {
  const thumbSize = 100;
  const aspect = sourceImage.width / sourceImage.height;
  const w = aspect >= 1 ? thumbSize : Math.round(thumbSize * aspect);
  const h = aspect >= 1 ? Math.round(thumbSize / aspect) : thumbSize;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Only apply CSS filters for thumbnails (fast)
  ctx.filter = buildCSSFilter(preset);
  ctx.drawImage(sourceImage, 0, 0, w, h);

  // Quick vignette
  if (preset.vignette > 0) {
    applyVignette(ctx, w, h, preset.vignette);
  }

  return canvas.toDataURL('image/jpeg', 0.6);
}

/**
 * Export the canvas as a Blob for uploading.
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas to blob failed'));
      },
      'image/jpeg',
      quality
    );
  });
}
