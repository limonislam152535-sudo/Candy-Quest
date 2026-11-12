import React, { useState } from 'react';
import { Play, MapPin, Settings, HelpCircle, Gift, ExternalLink, Star } from 'lucide-react';
import { StorageManager } from '../../utils/StorageManager.js';
import { BannerAd } from '../../ads/BannerAd.js';
import { AdManager } from '../../ads/AdManager.js';
import { SoundManager } from '../../utils/SoundManager.js';
import { BoosterManager, BoosterType } from '../../game/BoosterManager.js';

interface HomeScreenProps {
  onPlay: () => void;
  onOpenLevelSelect: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onPlay,
  onOpenLevelSelect,
  onOpenSettings,
  onOpenHowToPlay
}) => {
  const saveData = StorageManager.load();
  const currentLvl = saveData.currentLevel || 1;
  const totalStars = Object.values(saveData.levelStars || {}).reduce((a, b) => a + b, 0);

  // Daily gift logic
  const [giftClaimed, setGiftClaimed] = useState(false);
  const [claimedReward, setClaimedReward] = useState<string | null>(null);

  const claimDailyGift = () => {
    SoundManager.playSpecial();
    const boosterTypes: BoosterType[] = ['hammer', 'extra_moves', 'color_bomb', 'shuffle'];
    const chosen = boosterTypes[Math.floor(Math.random() * boosterTypes.length)];

    const bm = new BoosterManager(saveData.boosters);
    bm.addBooster(chosen, 1);
    StorageManager.save({ boosters: bm.getInventory() });

    setGiftClaimed(true);
    setClaimedReward(`+1 ${chosen.toUpperCase().replace('_', ' ')} Booster!`);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-y-auto bg-gradient-to-b from-[#e1f5fe] via-[#fce4ec] to-[#fff3e0] p-4 sm:p-6 select-none">
      {/* Top Utility Bar */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between pointer-events-auto">
        {/* Level & Stars Badge */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full shadow-md border-2 border-pink-200">
          <span className="font-black tracking-wide text-pink-600 text-xs">Level {currentLvl}</span>
          <div className="w-1 h-1 rounded-full bg-stone-300" />
          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
            <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-600" />
            <span className="tabular-nums">{totalStars}</span>
          </div>
        </div>

        {/* Settings & How to Play */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              SoundManager.playClick();
              onOpenHowToPlay();
            }}
            aria-label="How to Play Tutorial"
            className="w-10 h-10 rounded-2xl bg-white/90 hover:bg-white text-stone-700 shadow-md flex items-center justify-center transition active:scale-90 cursor-pointer border-2 border-pink-200"
          >
            <HelpCircle className="w-5 h-5 text-sky-600" />
          </button>
          <button
            onClick={() => {
              SoundManager.playClick();
              onOpenSettings();
            }}
            aria-label="Game Settings"
            className="w-10 h-10 rounded-2xl bg-white/90 hover:bg-white text-stone-700 shadow-md flex items-center justify-center transition active:scale-90 cursor-pointer border-2 border-pink-200"
          >
            <Settings className="w-5 h-5 text-pink-600" />
          </button>
        </div>
      </div>

      {/* Hero Candy Quest Logo & Center CTAs */}
      <div className="w-full max-w-md mx-auto my-auto flex flex-col items-center text-center pointer-events-auto py-2">
        {/* Bespoke Title Lockup Emblem */}
        <div className="relative mb-6 transform hover:scale-105 transition-transform duration-300">
          {/* Background Candy Swirls */}
          <div className="absolute -top-6 -left-6 text-4xl animate-bounce">🍬</div>
          <div className="absolute -top-4 -right-6 text-4xl animate-pulse">🍭</div>

          {/* Logo Plaque */}
          <div className="bg-gradient-to-b from-white via-pink-50 to-pink-100 p-4 sm:p-6 rounded-[36px] shadow-2xl border-4 border-white ring-4 ring-pink-300/80">
            <h1 className="font-black tracking-wide text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-rose-500 via-pink-500 to-amber-500 drop-shadow-md leading-tight tracking-wide">
              CANDY QUEST
            </h1>
            <p className="font-bold font-extrabold text-sm sm:text-base text-pink-600 tracking-wider mt-1 uppercase">
              Sweet Match Adventure
            </p>
          </div>
        </div>

        {/* Primary START / PLAY CTA Button */}
        <button
          onClick={() => {
            SoundManager.playClick();
            onPlay();
          }}
          data-start="true"
          aria-label="Play Candy Quest"
          className="group relative w-64 py-4 px-8 rounded-full bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 hover:brightness-105 text-white font-black tracking-wide text-2xl tracking-wider shadow-xl border-4 border-white transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-3 mb-3.5"
        >
          <Play className="w-7 h-7 fill-white stroke-white transition-transform group-hover:scale-110" />
          <span>PLAY</span>
        </button>

        {/* Level Select Map Button */}
        <button
          onClick={() => {
            SoundManager.playClick();
            onOpenLevelSelect();
          }}
          aria-label="Level Map"
          className="w-56 py-3 px-6 rounded-2xl bg-white/95 hover:bg-white text-stone-700 font-extrabold text-sm border-2 border-pink-200 shadow-md flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer mb-3"
        >
          <MapPin className="w-4 h-4 text-pink-500" />
          <span>Choose Level</span>
        </button>

        {/* Daily Sweet Gift */}
        {!giftClaimed ? (
          <button
            onClick={claimDailyGift}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold border border-amber-300 shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Gift className="w-4 h-4 text-amber-600 animate-bounce" />
            <span>Claim Free Daily Booster!</span>
          </button>
        ) : (
          <div className="px-4 py-2 rounded-2xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 shadow-xs">
            🎉 {claimedReward}
          </div>
        )}

        {/* Clearly Separated Sponsored Offer Button */}
        {AdManager.isSmartLinkEnabled() && (
          <div className="mt-5">
            <button
              onClick={() => {
                SoundManager.playClick();
                AdManager.openSponsoredOffer();
              }}
              aria-label="View Sponsored Offer"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/80 hover:bg-white text-[11px] font-bold text-stone-500 hover:text-stone-700 border border-stone-200 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <span>Sponsored Offer</span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Placement Banner Ad */}
      <div className="w-full max-w-md mx-auto pointer-events-auto">
        <BannerAd placement="home" />
      </div>
    </div>
  );
};
