import React from 'react';
import { ConsentManager } from '../../utils/ConsentManager.js';
import { ShieldCheck, Cookie } from 'lucide-react';

interface ConsentBannerProps {
  onConsentChoice: (granted: boolean) => void;
  onOpenPrivacy: () => void;
}

export const ConsentBanner: React.FC<ConsentBannerProps> = ({ onConsentChoice, onOpenPrivacy }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-xs pointer-events-auto">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-4 border-pink-200 text-stone-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-500">
            <Cookie className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-pink-600 font-black tracking-wide">Sweet Privacy Choices</h3>
            <p className="text-xs text-stone-500">Transparent & player-first experience</p>
          </div>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed mb-4">
          We use LocalStorage to save your level stars and booster progress. We also display optional third-party sponsored offers (such as Adsterra banner scripts and sponsored links) to keep the game completely free to play. No personal passwords or sensitive data are collected.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              ConsentManager.setConsent(true);
              onConsentChoice(true);
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-green-500 text-white font-bold text-sm shadow-md hover:brightness-105 active:scale-95 transition cursor-pointer"
          >
            Accept & Play
          </button>
          <button
            onClick={() => {
              ConsentManager.setConsent(false);
              onConsentChoice(false);
            }}
            className="py-3 px-4 rounded-2xl bg-stone-100 text-stone-600 font-bold text-sm hover:bg-stone-200 active:scale-95 transition cursor-pointer"
          >
            Essential Only
          </button>
        </div>

        <div className="mt-3 text-center">
          <button
            onClick={onOpenPrivacy}
            className="text-[11px] text-pink-500 hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer font-medium"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Read Full Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
};
