import React, { useState } from 'react';
import { X, Volume2, VolumeX, Music, RotateCcw, HelpCircle, Shield, Sparkles } from 'lucide-react';
import { SoundManager } from '../../utils/SoundManager.js';
import { StorageManager } from '../../utils/StorageManager.js';

interface SettingsModalProps {
  onClose: () => void;
  onOpenHowToPlay: () => void;
  onOpenPrivacy: () => void;
  onProgressReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  onOpenHowToPlay,
  onOpenPrivacy,
  onProgressReset
}) => {
  const [soundOn, setSoundOn] = useState(SoundManager.isSfxEnabled());
  const [musicOn, setMusicOn] = useState(SoundManager.isMusicEnabled());
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    SoundManager.setSfxEnabled(next);
    if (next) SoundManager.playClick();
  };

  const toggleMusic = () => {
    const next = !musicOn;
    setMusicOn(next);
    SoundManager.setMusicEnabled(next);
  };

  const handleReset = () => {
    StorageManager.resetProgress();
    setShowConfirmReset(false);
    onProgressReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs pointer-events-auto">
      {/* Wafer / Cookie styled frame matching reference image 04._Settings_6acbacc3.jpg */}
      <div className="relative w-full max-w-sm bg-[#fff8f0] rounded-[36px] shadow-2xl border-[6px] border-[#e8be89] p-6 text-stone-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Pink Top Ribbon Plaque */}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-8 py-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 border-4 border-white shadow-lg">
          <h2 className="text-xl font-black text-white tracking-wide font-black tracking-wide drop-shadow-sm">
            SETTINGS
          </h2>
        </div>

        {/* Close X */}
        <button
          onClick={onClose}
          aria-label="Close Settings"
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-pink-100 hover:bg-pink-200 flex items-center justify-center text-pink-600 transition active:scale-90 cursor-pointer shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mt-5 space-y-4">
          {/* Music Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border-2 border-pink-100 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-lime-100 flex items-center justify-center text-lime-700">
                <Music className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-stone-700 text-sm font-bold">Music</span>
            </div>
            <button
              onClick={toggleMusic}
              role="switch"
              aria-checked={musicOn}
              aria-label="Toggle Music"
              className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer shadow-inner p-1 ${
                musicOn ? 'bg-lime-500' : 'bg-stone-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  musicOn ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border-2 border-pink-100 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <span className="font-extrabold text-stone-700 text-sm font-bold">Sound FX</span>
            </div>
            <button
              onClick={toggleSound}
              role="switch"
              aria-checked={soundOn}
              aria-label="Toggle Sound Effects"
              className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer shadow-inner p-1 ${
                soundOn ? 'bg-amber-500' : 'bg-stone-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  soundOn ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* How to Play button */}
          <button
            onClick={onOpenHowToPlay}
            className="w-full flex items-center justify-between p-3.5 bg-white rounded-2xl border-2 border-pink-100 shadow-xs hover:bg-pink-50/50 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700">
                <HelpCircle className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-stone-700 text-sm font-bold">How To Play</span>
            </div>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </button>

          {/* Privacy Policy */}
          <button
            onClick={onOpenPrivacy}
            className="w-full flex items-center justify-between p-3.5 bg-white rounded-2xl border-2 border-pink-100 shadow-xs hover:bg-pink-50/50 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-stone-700 text-sm font-bold">Privacy Policy & Cookies</span>
            </div>
          </button>

          {/* Reset Game Data */}
          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold text-stone-400 hover:text-red-500 hover:bg-red-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Game Progress
            </button>
          ) : (
            <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-center space-y-2">
              <p className="text-xs text-red-600 font-bold">Are you sure? This erases unlocked levels and stars.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 py-1.5 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 cursor-pointer"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="flex-1 py-1.5 bg-stone-200 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
