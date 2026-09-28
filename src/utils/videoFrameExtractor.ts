export interface ExtractedFrame {
  bitmap?: ImageBitmap;
  canvas?: HTMLCanvasElement;
  width: number;
  height: number;
}

export async function extractVideoFrames(
  videoUrl: string,
  targetFrameCount = 90,
  onProgress?: (loaded: number, total: number) => void
): Promise<ExtractedFrame[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    video.preload = 'auto';

    let isAborted = false;

    const cleanup = () => {
      isAborted = true;
      video.pause();
      video.removeAttribute('src');
      video.load();
    };

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration;
        if (!duration || duration <= 0 || isNaN(duration)) {
          cleanup();
          reject(new Error('Invalid video duration'));
          return;
        }

        const totalFrames = Math.max(10, Math.min(targetFrameCount, Math.round(duration * 20)));
        const frames: ExtractedFrame[] = [];
        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d', { willReadFrequently: false });

        offCanvas.width = video.videoWidth || 960;
        offCanvas.height = video.videoHeight || 540;

        for (let i = 0; i < totalFrames; i++) {
          if (isAborted) break;

          const targetTime = (i / (totalFrames - 1)) * (duration - 0.05);

          await new Promise<void>((res) => {
            const onSeeked = () => {
              video.removeEventListener('seeked', onSeeked);
              res();
            };
            video.addEventListener('seeked', onSeeked, { once: true });
            video.currentTime = targetTime;

            // Fallback timeout in case seeked doesn't fire
            setTimeout(() => {
              video.removeEventListener('seeked', onSeeked);
              res();
            }, 300);
          });

          if (isAborted) break;

          // Attempt to use createImageBitmap for zero-copy GPU performance
          if (typeof createImageBitmap === 'function') {
            try {
              const bitmap = await createImageBitmap(video);
              frames.push({
                bitmap,
                width: bitmap.width,
                height: bitmap.height,
              });
            } catch {
              // Canvas fallback
              if (offCtx) {
                offCtx.drawImage(video, 0, 0, offCanvas.width, offCanvas.height);
                const frameCanvas = document.createElement('canvas');
                frameCanvas.width = offCanvas.width;
                frameCanvas.height = offCanvas.height;
                const fCtx = frameCanvas.getContext('2d');
                fCtx?.drawImage(offCanvas, 0, 0);
                frames.push({
                  canvas: frameCanvas,
                  width: frameCanvas.width,
                  height: frameCanvas.height,
                });
              }
            }
          } else if (offCtx) {
            offCtx.drawImage(video, 0, 0, offCanvas.width, offCanvas.height);
            const frameCanvas = document.createElement('canvas');
            frameCanvas.width = offCanvas.width;
            frameCanvas.height = offCanvas.height;
            const fCtx = frameCanvas.getContext('2d');
            fCtx?.drawImage(offCanvas, 0, 0);
            frames.push({
              canvas: frameCanvas,
              width: frameCanvas.width,
              height: frameCanvas.height,
            });
          }

          if (onProgress) {
            onProgress(i + 1, totalFrames);
          }
        }

        cleanup();
        resolve(frames);
      } catch (err) {
        cleanup();
        resolve([]);
      }
    };

    video.onerror = () => {
      cleanup();
      resolve([]);
    };

    // Trigger load
    video.load();
  });
}
