import React from 'react';
import { RotateCcw, Home, PlusCircle } from 'lucide-react';

interface LevelFailedModalProps {
  levelNumber: number;
  score: number;
  targetScore: number;
  hasExtraMovesBooster: boolean;
  onUseExtraMoves: () => void;
  onRetry: () => void;
  onGoHome: () => void;
}

export const LevelFailedModal: React.FC<LevelFailedModalProps> = ({
  levelNumber,
  score,
  targetScore,
  hasExtraMovesBooster,
  onUseExtraMoves,
  onRetry,
  onGoHome
}) => {
  const percent = Math.min(100, Math.round((score / targetScore) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs pointer-events-auto">
      <div className="relative w-full max-w-sm bg-[#fff8f0] rounded-[36px] shadow-2xl border-[6px] border-[#e8be89] p-6 text-stone-800 animate-in fade-in zoom-in-90 duration-300">
        {/* Out of Moves Top Ribbon */}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-8 py-2 rounded-full bg-gradient-to-r from-rose-500 to-red-500 border-4 border-white shadow-lg">
          <h2 className="text-xl font-black text-white tracking-wide font-black tracking-wide drop-shadow-md">
            OUT OF MOVES!
          </h2>
        </div>

        <div className="mt-6 text-center">
          <span className="text-xs uppercase font-extrabold tracking-widest text-stone-400">
            Level {levelNumber}
          </span>
          <p className="text-sm text-stone-600 mt-1 font-medium">So close! Don't give up sweet tooth!</p>
        </div>

        {/* Target Progress Bar */}
        <div className="my-5 p-4 bg-white rounded-2xl border-2 border-stone-200">
          <div className="flex justify-between text-xs font-bold text-stone-500 mb-1.5">
            <span>Score Goal:</span>
            <span className="text-pink-600 font-extrabold">{percent}%</span>
          </div>
          <div className="w-full h-3.5 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="text-[11px] text-stone-400 text-center mt-2 font-mono">
            {score.toLocaleString()} / {targetScore.toLocaleString()} pts
          </div>
        </div>

        {/* Extra Moves +5 Booster Option if available */}
        {hasExtraMovesBooster && (
          <button
            onClick={onUseExtraMoves}
            className="w-full mb-3 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-green-500 hover:brightness-105 text-white font-extrabold text-sm border-2 border-white flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" /> Use +5 Moves & Continue!
          </button>
        )}

        {/* Retry or Menu */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onGoHome}
            aria-label="Exit to Menu"
            className="w-12 h-12 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 border-2 border-stone-200 flex items-center justify-center transition active:scale-90 cursor-pointer shadow-xs shrink-0"
          >
            <Home className="w-5 h-5" />
          </button>
          <button
            onClick={onRetry}
            aria-label="Try Again"
            data-start="true"
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:brightness-105 text-white font-extrabold text-sm border-2 border-white flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>
    </div>
  );
};
