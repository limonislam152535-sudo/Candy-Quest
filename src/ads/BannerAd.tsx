import React, { useEffect, useRef, useState } from 'react';
import { AdManager } from './AdManager.js';

interface BannerAdProps {
  placement: 'home' | 'level-selection';
}

export const BannerAd: React.FC<BannerAdProps> = ({ placement }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canFit, setCanFit] = useState(true);

  useEffect(() => {
    // Check if device screen can fit 468px safely with padding
    const checkFit = () => {
      setCanFit(window.innerWidth >= 480);
    };

    checkFit();
    window.addEventListener('resize', checkFit);
    return () => window.removeEventListener('resize', checkFit);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !canFit) return;

    const cleanup = AdManager.renderBanner(containerRef.current, placement);
    return () => {
      if (cleanup) cleanup();
    };
  }, [placement, canFit]);

  if (!canFit || !AdManager.isBannerEnabledForPlacement(placement)) {
    return null;
  }

  return (
    <div className="w-full flex flex-col items-center justify-center my-2 pointer-events-auto">
      <div className="text-[10px] uppercase font-bold tracking-wider text-pink-400/80 mb-1">
        Sponsored
      </div>
      <div
        ref={containerRef}
        className="w-[468px] h-[60px] max-w-full rounded-xl overflow-hidden bg-white/60 border border-pink-200/60 shadow-sm flex items-center justify-center"
        style={{ minHeight: '60px' }}
      />
    </div>
  );
};
