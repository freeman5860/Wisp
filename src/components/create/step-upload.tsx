'use client';

import { useCallback, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Camera, X } from 'lucide-react';
import { useCreateFlowStore } from '@/stores/create-flow-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function StepUpload() {
  const { setImage, nextStep } = useCreateFlowStore();
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const onDrop = useCallback(
    (files: File[]) => {
      if (files[0]) {
        setImage(files[0]);
        nextStep();
      }
    },
    [setImage, nextStep]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.heic'] },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
  });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 2560 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setShowCamera(true);
    } catch {
      // Camera not available, fallback to file picker
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          setImage(file);
          nextStep();
        }
      };
      input.click();
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          stopCamera();
          setImage(file);
          nextStep();
        }
      },
      'image/jpeg',
      0.9
    );
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  // Camera view
  if (showCamera) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-full max-w-sm aspect-[3/4] rounded-lg overflow-hidden bg-black relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-center gap-4">
            <button
              onClick={stopCamera}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full border-4 border-white bg-white/20 backdrop-blur-sm transition-transform active:scale-90"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-light tracking-wide">随手拍一张</h2>
        <p className="text-text-secondary mt-2">什么都可以，哪怕是&ldquo;废片&rdquo;</p>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          'w-full max-w-sm aspect-[3/4] rounded-lg border-2 border-dashed transition-all duration-300 cursor-pointer',
          'flex flex-col items-center justify-center gap-4',
          isDragActive
            ? 'border-accent bg-accent/5 scale-[1.02]'
            : 'border-border hover:border-border-bright hover:bg-background-hover'
        )}
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 rounded-full bg-background-hover flex items-center justify-center">
          {isDragActive ? (
            <Upload className="w-7 h-7 text-accent" />
          ) : (
            <Upload className="w-7 h-7 text-text-secondary" />
          )}
        </div>
        <div className="text-center">
          <p className="text-text-primary text-sm">
            {isDragActive ? '放开即可' : '点击上传或拖拽照片'}
          </p>
          <p className="text-text-tertiary text-xs mt-1">
            JPG, PNG, WebP, HEIC &middot; 最大 20MB
          </p>
        </div>
      </div>

      {/* Camera button */}
      <Button
        variant="ghost"
        className="mt-4"
        onClick={(e) => {
          e.stopPropagation();
          startCamera();
        }}
      >
        <Camera className="w-4 h-4 mr-2" />
        直接拍照
      </Button>
    </div>
  );
}
