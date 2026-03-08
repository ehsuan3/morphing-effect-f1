import React, { useEffect, useRef, useState } from 'react';

interface MorphingAnimationProps {
  baseUrl?: string;
}

const MorphingAnimation: React.FC<MorphingAnimationProps> = ({ 
  baseUrl = "/morphing/folder" 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(1); // 1.0 to 2.0
  const [targetPoint, setTargetPoint] = useState(1);
  
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(1);
  const currentIndexRef = useRef(-1);

  // Load the 7 images (101 to 107)
  useEffect(() => {
    let isMounted = true;
    const loadImages = async () => {
      const imageNames = ['101.png', '102.png', '103.png', '104.png', '105.png', '106.png', '107.png'];
      const imageUrls = imageNames.map(name => `${baseUrl}/${name}`);

      const promises = imageUrls.map((src, index) => {
        return new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          
          const handleFallback = () => {
            console.warn(`Image not found: ${src}. Using fallback for index ${index}`);
            const fallback = new Image();
            // Use a more reliable placeholder service
            fallback.src = `https://placehold.co/800x800/000000/FFFFFF/png?text=Frame+${101 + index}`;
            fallback.onload = () => resolve(fallback);
            fallback.onerror = () => {
              // Absolute final fallback: empty canvas-sized transparent image
              const canvas = document.createElement('canvas');
              canvas.width = 800;
              canvas.height = 800;
              const finalImg = new Image();
              finalImg.src = canvas.toDataURL();
              finalImg.onload = () => resolve(finalImg);
            };
          };

          img.onload = () => resolve(img);
          img.onerror = handleFallback;
          img.src = src;

          // Safety timeout: if an image takes more than 5s, move to fallback
          setTimeout(() => {
            if (img.complete) return;
            handleFallback();
          }, 5000);
        });
      });

      try {
        const images = await Promise.all(promises);
        if (isMounted) {
          setLoadedImages(images);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Critical error loading images:", err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadImages();
    return () => { isMounted = false; };
  }, [baseUrl]);

  // Animation loop for progress (1.0 to 2.0)
  useEffect(() => {
    if (isLoading || progress === targetPoint) return;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const duration = 400; // Faster transition

      if (elapsed < duration) {
        const animProgress = elapsed / duration;
        // Simple linear interpolation between start and target
        const diff = targetPoint - startValueRef.current;
        const newValue = startValueRef.current + diff * animProgress;

        setProgress(newValue);
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setProgress(targetPoint);
        startTimeRef.current = null;
        animationRef.current = null;
      }
    };

    startTimeRef.current = null;
    startValueRef.current = progress;
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [targetPoint, isLoading]);

  // Render loop for canvas
  useEffect(() => {
    if (isLoading || loadedImages.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const render = () => {
      // Map progress (1.0 - 2.0) to index (0 - 5)
      const index = Math.round((progress - 1) * (loadedImages.length - 1));
      
      if (index !== currentIndexRef.current) {
        currentIndexRef.current = index;
        const img = loadedImages[index];
        if (img && img.complete) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      }
    };

    render();
  }, [progress, loadedImages, isLoading]);

  const handlePointChange = (point: number) => {
    setTargetPoint(point);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-black text-white font-sans">
      {isLoading ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          <p className="text-xs uppercase tracking-widest opacity-50">Initializing Morph</p>
        </div>
      ) : (
        <div className="w-full max-w-2xl flex flex-col items-center">
          <div className="relative w-full aspect-square group">
            <canvas 
              ref={canvasRef} 
              width={800} 
              height={800} 
              className="relative w-full h-full object-contain z-10"
            />
            
            {/* Progressive Frosted Glass Blur */}
            <div 
              className="absolute inset-0 z-20 pointer-events-none"
              style={{
                backdropFilter: 'blur(12px)',
                maskImage: 'linear-gradient(to top, black 0%, transparent 20%)',
                WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 20%)'
              }}
            />

            {/* Smooth Gradient Fade to Background */}
            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black via-black/20 to-transparent z-30 pointer-events-none" />
            
            {/* Subtle Vignette for depth */}
            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] z-25 pointer-events-none" />
          </div>

          <div className="mt-0 flex flex-col items-center gap-8 z-20">
            <div className="flex gap-4 sm:gap-6 mx-6">
              {[1, 2].map((point) => (
                <button
                  key={point}
                  onClick={() => handlePointChange(point)}
                  className={`group relative px-8 py-3 rounded-full border transition-all duration-500 overflow-hidden ${
                    targetPoint === point 
                      ? 'bg-[#1FEAE6] border-[#1FEAE6] text-black' 
                      : 'bg-transparent border-white/20 text-white hover:border-[#1FEAE6]/50'
                  }`}
                >
                  <span className="relative z-10 font-bold tracking-tighter uppercase text-sm group-hover:text-black transition-colors duration-300 leading-[1.3]">
                    {point === 1 ? 'George Russell' : 'Kimi Antonelli'}
                  </span>
                  {targetPoint !== point && (
                    <div className="absolute inset-0 bg-[#1FEAE6] translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">
                Change Driver
              </p>
              <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MorphingAnimation;
