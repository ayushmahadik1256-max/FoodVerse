import React, { useEffect, useRef } from 'react';

const TOTAL_FRAMES = 240;
const FRAME_PATH = '/hands-video-frames';

export const HandsScrollSequence: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const targetFrameRef = useRef(0);
  const currentFrameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const drawFrame = (frameIndex: number) => {
      const images = imagesRef.current;
      let image = images[frameIndex];
      if (!image?.complete || !image.naturalWidth) {
        for (let distance = 1; distance < images.length; distance += 1) {
          const earlier = images[frameIndex - distance];
          const later = images[frameIndex + distance];
          image = earlier?.complete && earlier.naturalWidth ? earlier : later?.complete && later.naturalWidth ? later : null;
          if (image) break;
        }
      }
      if (!image?.naturalWidth) return;

      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(bounds.width * dpr);
      const height = Math.round(bounds.height * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.fillStyle = '#f3efe6';
      context.fillRect(0, 0, bounds.width, bounds.height);
      const scale = Math.min(bounds.width / image.naturalWidth, bounds.height / image.naturalHeight);
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      context.drawImage(image, (bounds.width - drawWidth) / 2, (bounds.height - drawHeight) / 2, drawWidth, drawHeight);
    };

    const updateProgress = () => {
      const track = trackRef.current;
      if (!track) return;
      const distance = track.offsetHeight - window.innerHeight;
      const progress = distance > 0
        ? Math.min(1, Math.max(0, -track.getBoundingClientRect().top / distance))
        : 0;
      targetFrameRef.current = progress * (TOTAL_FRAMES - 1);
    };

    let animationId = 0;
    const animate = () => {
      currentFrameRef.current += (targetFrameRef.current - currentFrameRef.current) * 0.14;
      drawFrame(Math.round(currentFrameRef.current));
      animationId = requestAnimationFrame(animate);
    };

    const handleResize = () => drawFrame(Math.round(currentFrameRef.current));
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', handleResize);
    updateProgress();

    for (let index = 0; index < TOTAL_FRAMES; index += 1) {
      const image = new Image();
      image.onload = () => {
        imagesRef.current[index] = image;
        if (index === 0) drawFrame(Math.round(currentFrameRef.current));
      };
      image.src = `${FRAME_PATH}/${String(index + 1).padStart(5, '0')}.jpg`;
    }

    animationId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section ref={trackRef} aria-label="Scroll through the Taste and Go food sequence" className="relative left-1/2 w-screen -translate-x-1/2 h-[500vh]">
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-hidden bg-[#f3efe6]">
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
    </section>
  );
};
