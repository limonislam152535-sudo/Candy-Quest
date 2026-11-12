import React from 'react';
import { Pause, Star, Hammer, PlusCircle, Wand2, Shuffle, Volume2, VolumeX } from 'lucide-react';
import { BoosterType, BoosterInventory } from '../../game/BoosterManager.js';
import { LevelConfig } from '../../game/LevelManager.js';
import { SoundManager } from '../../utils/SoundManager.js';

interface GameplayHUDProps {
  levelConfig: LevelConfig;
  score: number;
  movesLeft: number;
  boosters: BoosterInventory;
  activeBooster: BoosterType | null;
  onSelectBooster: (type: BoosterType) => void;
  onPause: () => void;
}

export const GameplayHUD: React.FC<GameplayHUDProps> = ({
  levelConfig,
  score,
  movesLeft,
  boosters,
  activeBooster,
  onSelectBooster,
  onPause
}) => {
  const [sfx, setSfx] = React.useState(SoundManager.isSfxEnabled());

  const toggleSound = () => {
    const next = !sfx;
    setSfx(next);
    SoundManager.setSfxEnabled(next);
  };

  const [s1, s2, s3] = levelConfig.starThresholds;
  const maxThreshold = s3;
  const scorePercent = Math.min(100, Math.round((score / maxThreshold) * 100));

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none z-30">
      {/* Top Header Cluster (inspired by image 0__8__658837bd.jpg) */}
      <header className="w-full max-w-xl mx-auto flex flex-col gap-2 pointer-events-auto">
        <div className="flex items-center justify-between gap-2 bg-white/90 backdrop-blur-xs rounded-3xl p-2.5 sm:px-4 sm:py-3 shadow-md border-2 border-pink-200">
          {/* Level & Objective */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-2xl bg-pink-500 text-white font-extrabold text-xs sm:text-sm font-black tracking-wide tracking-wide shadow-xs">
              Lvl {levelConfig.levelNumber}
            </div>
            <div className="text-[11px] sm:text-xs text-stone-600 font-bold max-w-[130px] sm:max-w-[200px] truncate">
              {levelConfig.objective.description}
            </div>
          </div>

          {/* Moves Center Pill */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-b from-sky-400 to-blue-500 text-white rounded-2xl px-4 py-1 shadow-md border-2 border-white -my-1">
            <span className="text-[9px] uppercase font-bold tracking-wider opacity-90">Moves</span>
            <span className="text-xl sm:text-2xl font-black font-black tracking-wide leading-none tabular-nums">
              {movesLeft}
            </span>
          </div>

          {/* Utility Buttons: Pause & Mute */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleSound}
              aria-label={sfx ? 'Mute Sound' : 'Unmute Sound'}
              className="w-9 h-9 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition active:scale-90 cursor-pointer shadow-xs"
            >
              {sfx ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onPause}
              aria-label="Pause Game"
              className="w-9 h-9 rounded-2xl bg-amber-400 hover:bg-amber-500 text-white flex items-center justify-center transition active:scale-90 cursor-pointer shadow-xs"
            >
              <Pause className="w-4 h-4 fill-white" />
            </button>
          </div>
        </div>

        {/* Score Progress Bar with 3 Star Milestones */}
        <div className="relative w-full bg-white/80 rounded-2xl p-2 shadow-xs border border-pink-200 flex items-center gap-3">
          <div className="text-xs font-black text-pink-600 font-black tracking-wide tabular-nums min-w-[70px]">
            {score.toLocaleString()}
          </div>
          <div className="relative flex-1 h-3.5 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200">
            <div
              className="h-full bg-gradient-to-r from-amber-300 via-pink-400 to-rose-500 rounded-full transition-all duration-300"
              style={{ width: `${scorePercent}%` }}
            />
            {/* Star Milestone Marks */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -ml-2"
              style={{ left: `${(s1 / maxThreshold) * 100}%` }}
            >
              <Star className={`w-3.5 h-3.5 ${score >= s1 ? 'fill-yellow-400 stroke-amber-600' : 'fill-stone-300 stroke-stone-400'}`} />
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 -ml-2"
              style={{ left: `${(s2 / maxThreshold) * 100}%` }}
            >
              <Star className={`w-3.5 h-3.5 ${score >= s2 ? 'fill-yellow-400 stroke-amber-600' : 'fill-stone-300 stroke-stone-400'}`} />
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 -ml-2"
              style={{ left: '98%' }}
            >
              <Star className={`w-3.5 h-3.5 ${score >= s3 ? 'fill-yellow-400 stroke-amber-600' : 'fill-stone-300 stroke-stone-400'}`} />
            </div>
          </div>
        </div>
      </header>

      {/* Active Booster Prompt Banner if armed */}
      {activeBooster && (
        <div className="self-center bg-amber-400 text-stone-900 px-4 py-1.5 rounded-full font-bold text-xs shadow-lg animate-pulse pointer-events-auto">
          {activeBooster === 'hammer' && 'Tap any candy to smash it with the Hammer!'}
          {activeBooster === 'color_bomb' && 'Spawning Rainbow Color Bomb...'}
        </div>
      )}

      {/* Bottom Booster Dock Strip */}
      <footer className="w-full max-w-sm mx-auto flex items-center justify-around bg-white/90 backdrop-blur-xs rounded-3xl p-2 shadow-lg border-2 border-pink-200 pointer-events-auto">
        {/* Hammer */}
        <button
          onClick={() => onSelectBooster('hammer')}
          disabled={boosters.hammer <= 0}
          aria-label={`Hammer booster (${boosters.hammer} available)`}
          className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition active:scale-90 cursor-pointer ${
            activeBooster === 'hammer'
              ? 'bg-amber-400 ring-3 ring-amber-300 shadow-md text-white'
              : 'bg-stone-50 hover:bg-stone-100 text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
        >
          <Hammer className="w-5 h-5 text-sky-600" />
          <span className="text-[9px] font-bold mt-0.5">Hammer</span>
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-pink-500 text-white font-extrabold text-[10px] flex items-center justify-center border-2 border-white shadow-xs">
            {boosters.hammer}
          </span>
        </button>

        {/* Extra Moves +5 */}
        <button
          onClick={() => onSelectBooster('extra_moves')}
          disabled={boosters.extra_moves <= 0}
          aria-label={`Extra moves booster (${boosters.extra_moves} available)`}
          className="relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-700 transition active:scale-90 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <PlusCircle className="w-5 h-5 text-emerald-600" />
          <span className="text-[9px] font-bold mt-0.5">+5 Moves</span>
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-pink-500 text-white font-extrabold text-[10px] flex items-center justify-center border-2 border-white shadow-xs">
            {boosters.extra_moves}
          </span>
        </button>

        {/* Color Bomb */}
        <button
          onClick={() => onSelectBooster('color_bomb')}
          disabled={boosters.color_bomb <= 0}
          aria-label={`Color bomb booster (${boosters.color_bomb} available)`}
          className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition active:scale-90 cursor-pointer ${
            activeBooster === 'color_bomb'
              ? 'bg-amber-400 ring-3 ring-amber-300 shadow-md text-white'
              : 'bg-stone-50 hover:bg-stone-100 text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
        >
          <Wand2 className="w-5 h-5 text-purple-600" />
          <span className="text-[9px] font-bold mt-0.5">Rainbow</span>
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-pink-500 text-white font-extrabold text-[10px] flex items-center justify-center border-2 border-white shadow-xs">
            {boosters.color_bomb}
          </span>
        </button>

        {/* Shuffle */}
        <button
          onClick={() => onSelectBooster('shuffle')}
          disabled={boosters.shuffle <= 0}
          aria-label={`Shuffle booster (${boosters.shuffle} available)`}
          className="relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-700 transition active:scale-90 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Shuffle className="w-5 h-5 text-amber-600" />
          <span className="text-[9px] font-bold mt-0.5">Shuffle</span>
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-pink-500 text-white font-extrabold text-text-xs flex items-center justify-center border-2 border-white shadow-xs">
            {boosters.shuffle}
          </span>
        </button>
      </footer>
    </div>
  );
};
