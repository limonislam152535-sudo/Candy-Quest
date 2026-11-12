import React, { useState } from 'react';
import { ArrowLeft, Star, ChevronLeft, ChevronRight, Lock, ExternalLink } from 'lucide-react';
import { StorageManager } from '../../utils/StorageManager.js';
import { BannerAd } from '../../ads/BannerAd.js';
import { AdManager } from '../../ads/AdManager.js';
import { SoundManager } from '../../utils/SoundManager.js';

interface LevelSelectScreenProps {
  onSelectLevel: (level: number) => void;
  onBack: () => void;
}

export const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({ onSelectLevel, onBack }) => {
  const saveData = StorageManager.load();
  const highestUnlocked = saveData.highestLevelUnlocked || 1;
  const currentLvl = saveData.currentLevel || 1;

  // Calculate episode page (each episode contains 20 levels)
  const initialEpisode = Math.floor((currentLvl - 1) / 20) + 1;
  const [episode, setEpisode] = useState(initialEpisode);

  const startLevel = (episode - 1) * 20 + 1;
  const endLevel = episode * 20;
  const levels = Array.from({ length: 20 }, (_, i) => startLevel + i);

  // Total stars accumulated
  const totalStars = Object.values(saveData.levelStars || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-y-auto bg-gradient-to-b from-[#fce4ec] via-[#f8bbd0]/30 to-[#f3e5f5] p-3 sm:p-5 select-none">
      {/* Top Header */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between gap-2">
        <button
          onClick={() => {
            SoundManager.playClick();
            onBack();
          }}
          aria-label="Back to Main Menu"
          className="w-10 h-10 rounded-2xl bg-white/90 hover:bg-white text-stone-700 shadow-md flex items-center justify-center transition active:scale-90 cursor-pointer border border-pink-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Total Stars Counter */}
        <div className="flex items-center gap-1.5 bg-white/90 px-3.5 py-1.5 rounded-full shadow-md border border-amber-200">
          <Star className="w-4 h-4 fill-amber-400 stroke-amber-600" />
          <span className="font-black tracking-wide text-amber-600 text-sm tabular-nums">{totalStars} Stars</span>
        </div>

        {/* Clearly separated Sponsored Offer CTA */}
        {AdManager.isSmartLinkEnabled() && (
          <button
            onClick={() => {
              SoundManager.playClick();
              AdManager.openSponsoredOffer();
            }}
            className="flex items-center gap-1 text-[11px] font-bold text-pink-600 bg-pink-100 hover:bg-pink-200 px-3 py-1.5 rounded-full transition active:scale-95 cursor-pointer border border-pink-300"
          >
            <span>Offer</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Center Card with Episode & Level Grid (inspired by user image 0__3__04eb5458.jpg) */}
      <div className="w-full max-w-sm mx-auto my-auto bg-white/95 rounded-[32px] p-5 shadow-xl border-4 border-pink-200 flex flex-col">
        {/* Episode Selector Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-100 mb-4">
          <button
            onClick={() => {
              if (episode > 1) {
                SoundManager.playClick();
                setEpisode(episode - 1);
              }
            }}
            disabled={episode <= 1}
            aria-label="Previous Episode"
            className="w-8 h-8 rounded-full bg-pink-100 disabled:opacity-30 text-pink-600 flex items-center justify-center hover:bg-pink-200 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h3 className="font-black tracking-wide text-base text-pink-600 tracking-wide">
              Episode {episode}
            </h3>
            <span className="text-[11px] text-stone-400 font-bold">
              Levels {startLevel} – {endLevel}
            </span>
          </div>

          <button
            onClick={() => {
              SoundManager.playClick();
              setEpisode(episode + 1);
            }}
            aria-label="Next Episode"
            className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200 transition cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 5x4 Grid of Level Buttons */}
        <div className="grid grid-cols-5 gap-2.5">
          {levels.map((lvl) => {
            const isUnlocked = lvl <= highestUnlocked;
            const isCurrent = lvl === currentLvl;
            const stars = saveData.levelStars[lvl] || 0;

            return (
              <button
                key={lvl}
                onClick={() => {
                  if (isUnlocked) {
                    SoundManager.playClick();
                    onSelectLevel(lvl);
                  }
                }}
                disabled={!isUnlocked}
                aria-label={`Level ${lvl} ${isUnlocked ? `unlocked, ${stars} stars` : 'locked'}`}
                className={`relative h-14 rounded-2xl flex flex-col items-center justify-center transition active:scale-95 border-2 ${
                  !isUnlocked
                    ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed opacity-60'
                    : isCurrent
                    ? 'bg-gradient-to-b from-amber-300 to-amber-500 border-white text-white shadow-md ring-2 ring-amber-300 cursor-pointer'
                    : 'bg-gradient-to-b from-emerald-400 to-green-500 border-white text-white shadow-sm cursor-pointer hover:brightness-105'
                }`}
              >
                {!isUnlocked ? (
                  <Lock className="w-4 h-4 text-stone-400" />
                ) : (
                  <>
                    <span className="font-black tracking-wide text-sm leading-none drop-shadow-xs">
                      {lvl}
                    </span>
                    {/* Stars achieved */}
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-2 h-2 ${
                            s <= stars
                              ? 'fill-yellow-300 stroke-yellow-500'
                              : 'fill-black/15 stroke-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Placement Banner Ad */}
      <div className="w-full max-w-md mx-auto mt-2">
        <BannerAd placement="level-selection" />
      </div>
    </div>
  );
};
