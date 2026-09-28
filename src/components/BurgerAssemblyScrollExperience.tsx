import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronDown, Upload, CheckCircle2, RefreshCw, Film } from 'lucide-react';
import {
  saveVideoToIndexedDB,
  getVideoFromIndexedDB,
  deleteVideoFromIndexedDB,
} from '../utils/mediaStorage';
import { extractVideoFrames, ExtractedFrame } from '../utils/videoFrameExtractor';

const DEFAULT_TOTAL_FRAMES = 120;

// Helper to format fallback default frame path: frame_0001.jpg to frame_0120.jpg
const getDefaultFramePath = (index: number) => {
  const padded = String(index + 1).padStart(4, '0');
  return `/assets/burger-frames/frame_${padded}.jpg`;
};

export const BurgerAssemblyScrollExperience: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default pre-extracted images
  const defaultImagesRef = useRef<(HTMLImageElement | null)[]>(
    new Array(DEFAULT_TOTAL_FRAMES).fill(null)
  );
  const defaultLoadedFramesRef = useRef<Set<number>>(new Set());

  // Dynamic extracted frames from custom user video
  const customFramesRef = useRef<ExtractedFrame[]>([]);

  const targetProgressRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);
  const currentFrameIndexRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);

  const [activeVideoName, setActiveVideoName] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionProgress, setExtractionProgress] = useState<{ loaded: number; total: number }>({
    loaded: 0,
    total: 0,
  });
  const [hasScrolled, setHasScrolled] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Draw a specific frame onto the canvas
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. If we have custom extracted frames from the user's video:
    if (customFramesRef.current.length > 0) {
      const totalCustom = customFramesRef.current.length;
      const safeIndex = Math.max(0, Math.min(totalCustom - 1, frameIndex));
      const frame = customFramesRef.current[safeIndex];

      if (frame) {
        ctx.clearRect(0, 0, width, height);

        const imgAspect = frame.width / frame.height;
        const canvasAspect = width / height;

        let renderWidth: number;
        let renderHeight: number;
        let offsetX: number;
        let offsetY: number;

        if (canvasAspect > imgAspect) {
          renderHeight = height;
          renderWidth = height * imgAspect;
          offsetX = (width - renderWidth) / 2;
          offsetY = 0;
        } else {
          renderWidth = width;
          renderHeight = width / imgAspect;
          offsetX = 0;
          offsetY = (height - renderHeight) / 2;
        }

        if (frame.bitmap) {
          ctx.drawImage(frame.bitmap, offsetX, offsetY, renderWidth, renderHeight);
        } else if (frame.canvas) {
          ctx.drawImage(frame.canvas, offsetX, offsetY, renderWidth, renderHeight);
        }
      }
      return;
    }

    // 2. Otherwise draw from default pre-extracted asset frames:
    let img = defaultImagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) {
      let nearestDist = Infinity;
      let nearestImg: HTMLImageElement | null = null;
      for (const loadedIdx of defaultLoadedFramesRef.current) {
        const dist = Math.abs(loadedIdx - frameIndex);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestImg = defaultImagesRef.current[loadedIdx];
        }
      }
      img = nearestImg;
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    ctx.clearRect(0, 0, width, height);

    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = width / height;

    let renderWidth: number;
    let renderHeight: number;
    let offsetX: number;
    let offsetY: number;

    if (canvasAspect > imgAspect) {
      renderHeight = height;
      renderWidth = height * imgAspect;
      offsetX = (width - renderWidth) / 2;
      offsetY = 0;
    } else {
      renderWidth = width;
      renderHeight = width / imgAspect;
      offsetX = 0;
      offsetY = (height - renderHeight) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
  }, []);

  // Update canvas dimensions with high-DPI scaling
  const updateCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = Math.round(rect.width * dpr);
    const displayHeight = Math.round(rect.height * dpr);

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      drawFrame(currentFrameIndexRef.current);
    }
  }, [drawFrame]);

  // Load and extract frames from a video File or Blob
  const processCustomVideo = useCallback(
    async (fileOrBlob: File | Blob, fileName: string) => {
      if (!fileOrBlob || fileOrBlob.size < 5000) return;
      if (
        fileOrBlob.type &&
        !fileOrBlob.type.startsWith('video/') &&
        fileOrBlob.type !== 'application/octet-stream'
      ) {
        return;
      }

      try {
        setIsExtracting(true);
        setExtractionProgress({ loaded: 0, total: 90 });

        const blobUrl = URL.createObjectURL(fileOrBlob);
        const frames = await extractVideoFrames(blobUrl, 90, (loaded, total) => {
          setExtractionProgress({ loaded, total });
        });

        URL.revokeObjectURL(blobUrl);

        if (frames && frames.length > 0) {
          // Dispose any previous bitmaps
          customFramesRef.current.forEach((f) => {
            if (f.bitmap) {
              f.bitmap.close();
            }
          });

          customFramesRef.current = frames;
          setActiveVideoName(fileName);

          // Save to IndexedDB so it permanently survives reloads
          await saveVideoToIndexedDB(fileOrBlob, fileName);

          updateCanvasDimensions();
          drawFrame(0);
        } else {
          await deleteVideoFromIndexedDB();
        }
      } catch {
        await deleteVideoFromIndexedDB();
      } finally {
        setIsExtracting(false);
      }
    },
    [drawFrame, updateCanvasDimensions]
  );

  // Handle file input selection
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processCustomVideo(file, file.name);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('video/') || file.name.endsWith('.mp4'))) {
      processCustomVideo(file, file.name);
    }
  };

  // Reset to default pre-extracted frames
  const handleResetToDefault = async () => {
    customFramesRef.current.forEach((f) => {
      if (f.bitmap) f.bitmap.close();
    });
    customFramesRef.current = [];
    setActiveVideoName(null);
    await deleteVideoFromIndexedDB();
    drawFrame(0);
  };

  // Check for saved video in IndexedDB or direct asset on mount
  useEffect(() => {
    let isCancelled = false;

    const init = async () => {
      // 1. Check if user already loaded a valid video stored in IndexedDB
      try {
        const saved = await getVideoFromIndexedDB();
        if (!isCancelled && saved && saved.blob && saved.blob.size > 5000) {
          if (!saved.blob.type || saved.blob.type.startsWith('video/')) {
            processCustomVideo(saved.blob, saved.name);
            return;
          } else {
            await deleteVideoFromIndexedDB();
          }
        }
      } catch {
        // Fallback to default frames
      }

      // 2. Preload default frames sequence
      const firstImg = new Image();
      firstImg.src = getDefaultFramePath(0);
      firstImg.onload = () => {
        if (isCancelled) return;
        defaultImagesRef.current[0] = firstImg;
        defaultLoadedFramesRef.current.add(0);
        updateCanvasDimensions();
        drawFrame(0);
      };

      for (let i = 1; i < DEFAULT_TOTAL_FRAMES; i++) {
        if (isCancelled) return;
        const img = new Image();
        img.src = getDefaultFramePath(i);
        img.onload = () => {
          if (isCancelled) return;
          defaultImagesRef.current[i] = img;
          defaultLoadedFramesRef.current.add(i);
        };
        if (i % 6 === 0) {
          await new Promise((res) => setTimeout(res, 8));
        }
      }
    };

    init();

    return () => {
      isCancelled = true;
    };
  }, [drawFrame, processCustomVideo, updateCanvasDimensions]);

  // Handle scroll events to compute targetProgress (0 to 1)
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const totalScrollableDistance = rect.height - viewportHeight;

      if (totalScrollableDistance <= 0) return;

      const progress = Math.min(1, Math.max(0, -rect.top / totalScrollableDistance));
      targetProgressRef.current = progress;

      if (progress > 0.02 && !hasScrolled) {
        setHasScrolled(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateCanvasDimensions, { passive: true });
    handleScroll();
    updateCanvasDimensions();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateCanvasDimensions);
    };
  }, [hasScrolled, updateCanvasDimensions]);

  // 60FPS animation loop with smooth lerping
  useEffect(() => {
    const renderLoop = () => {
      const diff = targetProgressRef.current - currentProgressRef.current;
      if (Math.abs(diff) > 0.0005) {
        currentProgressRef.current += diff * 0.16;
      } else {
        currentProgressRef.current = targetProgressRef.current;
      }

      const totalFramesCount =
        customFramesRef.current.length > 0
          ? customFramesRef.current.length
          : DEFAULT_TOTAL_FRAMES;

      const targetFrame = Math.min(
        totalFramesCount - 1,
        Math.max(0, Math.round(currentProgressRef.current * (totalFramesCount - 1)))
      );

      if (targetFrame !== currentFrameIndexRef.current) {
        currentFrameIndexRef.current = targetFrame;
        drawFrame(targetFrame);
      }

      animationFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [drawFrame]);

  return (
    // Outer scroll track: 220vh provides ample space for silky frame-by-frame scrubbing
    <div
      ref={containerRef}
      className="relative w-full h-[220vh] -mt-2 -mb-8"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input for uploading the exact video */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Sticky viewport container */}
      <div className="sticky top-16 md:top-20 h-[calc(100vh-4.5rem)] md:h-[calc(100vh-5.5rem)] w-full flex flex-col items-center justify-center overflow-hidden">
        {/* Cinematic dark studio frame container */}
        <div
          className={`relative w-full h-full bg-stone-950 rounded-3xl overflow-hidden shadow-3d-frame border transition-all duration-500 ${
            isDragging
              ? 'border-orange-500 ring-4 ring-orange-500/20'
              : 'border-stone-800/80 hover:border-stone-700'
          }`}
        >
          {/* Subtle radial amber glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-gradient-to-r from-orange-600/15 via-amber-500/20 to-red-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* HTML5 Canvas rendering high-speed frames */}
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain relative z-10 block"
            style={{ imageRendering: 'auto' }}
          />

          {/* Video file loader bar (discreetly placed in top right) */}
          <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
            {activeVideoName ? (
              <div className="flex items-center gap-2 bg-stone-900/90 border border-stone-700/80 text-stone-200 px-3 py-1.5 rounded-xl text-xs backdrop-blur-md shadow-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium max-w-[200px] truncate" title={activeVideoName}>
                  {activeVideoName}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono">
                  {customFramesRef.current.length} frames
                </span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Choose another video"
                  className="hover:text-orange-400 p-0.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetToDefault}
                  title="Reset to default"
                  className="hover:text-rose-400 p-0.5 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white px-3 py-1.5 rounded-xl text-xs border border-stone-700/70 backdrop-blur-md transition-all shadow-md active:scale-95 group"
                title="Select Burger_ingredients_stacking_in_m…_20260925200536.mp4"
              >
                <Film className="w-3.5 h-3.5 text-orange-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Use Custom MP4</span>
              </button>
            )}
          </div>

          {/* Frame extraction loading overlay */}
          {isExtracting && (
            <div className="absolute inset-0 z-40 bg-stone-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-stone-100 p-4">
              <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-sm font-semibold tracking-wide">
                Converting video to actual frames...
              </div>
              <div className="text-xs text-stone-400 font-mono">
                Frame {extractionProgress.loaded} of {extractionProgress.total} (
                {Math.round((extractionProgress.loaded / (extractionProgress.total || 1)) * 100)}%)
              </div>
              <div className="w-48 h-1.5 bg-stone-800 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-orange-500 transition-all duration-150"
                  style={{
                    width: `${Math.round(
                      (extractionProgress.loaded / (extractionProgress.total || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Drag & Drop Highlight Overlay */}
          {isDragging && (
            <div className="absolute inset-0 z-40 bg-orange-950/60 backdrop-blur-sm border-2 border-dashed border-orange-400 flex flex-col items-center justify-center gap-2 text-white pointer-events-none">
              <Upload className="w-10 h-10 text-orange-400 animate-bounce" />
              <div className="text-sm font-bold">
                Drop Burger_ingredients_stacking_in_m…_20260925200536.mp4 Here
              </div>
              <div className="text-xs text-stone-300">
                It will automatically convert to scrollable frames
              </div>
            </div>
          )}

          {/* Minimal scroll indicator that fades out on scroll */}
          <div
            className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 transition-opacity duration-700 pointer-events-none select-none ${
              hasScrolled ? 'opacity-0' : 'opacity-85'
            }`}
          >
            <span className="text-[11px] font-semibold tracking-widest uppercase text-stone-300 drop-shadow-md">
              Scroll to Assemble
            </span>
            <ChevronDown className="w-4 h-4 text-orange-400 animate-bounce" />
          </div>

          {/* Subtle top/bottom edge gradients for seamless blending */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-stone-950 via-stone-950/40 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </div>
  );
};
