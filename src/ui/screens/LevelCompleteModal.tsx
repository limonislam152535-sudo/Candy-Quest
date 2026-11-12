import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, RotateCcw, ArrowRight, Gift } from 'lucide-react';
import { BoosterType } from '../../game/BoosterManager.js';

interface LevelCompleteModalProps {
  levelNumber: number;
  score: number;
  stars: number;
  rewardBooster?: BoosterType | null;
  onNextLevel: () => void;
  onRetry: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  levelNumber,
  score,
  stars,
  rewardBooster,
  onNextLevel,
  onRetry
}) => {
  useEffect(() => {
    // Joyful confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff2d55', '#ffcc00', '#28cd41', '#007aff', '#af52de', '#ffffff']
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs pointer-events-auto">
      {/* Wafer Cake card styled after user image 03._Level_Complete_54602dc3.jpg */}
      <div className="relative w-full max-w-sm bg-[#fff8fa] rounded-[36px] shadow-2xl border-[6px] border-[#e8be89] p-6 text-stone-800 animate-in fade-in zoom-in-90 duration-300">
        {/* Whipped Cream & Cherry Decorative Plaque */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-3xl filter drop-shadow-md">🍒</span>
            <span className="text-2xl filter drop-shadow-md">🍭</span>
          </div>
          <div className="px-6 py-2 rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-rose-500 border-4 border-white shadow-lg -mt-2">
            <h2 className="text-xl font-black text-white tracking-wide font-black tracking-wide drop-shadow-md">
              LEVEL COMPLETE!
            </h2>
          </div>
        </div>

        {/* Level Tag */}
        <div className="mt-7 text-center">
          <span className="text-xs uppercase font-extrabold tracking-widest text-pink-500 bg-pink-100 px-3 py-1 rounded-full">
            Level {levelNumber} Cleared
          </span>
        </div>

        {/* 3 Large Animated Golden Stars */}
        <div className="flex items-center justify-center gap-3 my-5">
          {[1, 2, 3].map((starIdx) => {
            const isEarned = starIdx <= stars;
            return (
              <div
                key={starIdx}
                className={`relative transition-all duration-500 transform ${
                  starIdx === 2 ? '-translate-y-2' : ''
                } ${isEarned ? 'scale-110 drop-shadow-lg' : 'scale-90 opacity-40'}`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border-3 ${
                    isEarned
                      ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 border-white text-white'
                      : 'bg-stone-200 border-stone-300 text-stone-400'
                  }`}
                >
                  <Star className={`w-8 h-8 ${isEarned ? 'fill-yellow-200 stroke-amber-600' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Score Readout */}
        <div className="text-center bg-white/80 rounded-2xl py-3 px-4 border-2 border-pink-100 shadow-inner mb-4">
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Final Score</div>
          <div className="text-3xl font-black font-black tracking-wide text-pink-600 tracking-wide tabular-nums">
            {score.toLocaleString()}
          </div>
        </div>

        {/* Reward badge if earned */}
        {rewardBooster && (
          <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 mb-4 text-xs text-amber-800 font-bold">
            <Gift className="w-4 h-4 text-amber-600 animate-bounce" />
            <span>Reward Unlocked: Free {rewardBooster.toUpperCase()} Booster!</span>
          </div>
        )}

        {/* Action CTAs: Retry & Next Level */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRetry}
            aria-label="Retry Level"
            className="flex-1 py-3 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-extrabold text-sm border-2 border-stone-200 flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-4 h-4" /> Retry
          </button>
          <button
            onClick={onNextLevel}
            aria-label="Next Level"
            data-start="true"
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:brightness-105 text-white font-extrabold text-sm border-2 border-white flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
