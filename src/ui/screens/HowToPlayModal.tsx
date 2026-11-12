import React from 'react';
import { X, Sparkles, Wand2, Hammer, PlusCircle, Shuffle, Flame } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs pointer-events-auto">
      <div className="w-full max-w-lg max-h-[85vh] bg-white rounded-3xl shadow-2xl border-4 border-yellow-200 flex flex-col text-stone-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-400 to-orange-400 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-xl font-extrabold font-black tracking-wide tracking-wide">How To Play</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close How to Play"
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition active:scale-90 cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Scrollable guide */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed text-stone-600">
          {/* Match 3 Basic */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center text-amber-700 shrink-0 font-extrabold text-lg">
              3
            </div>
            <div>
              <h4 className="font-extrabold text-stone-800 text-sm">Match 3 Candies</h4>
              <p>Swap adjacent candies horizontally or vertically to line up 3 identical colors and crush them for sweet points!</p>
            </div>
          </div>

          {/* Special Candies */}
          <h3 className="font-extrabold text-sm text-amber-600 flex items-center gap-1.5 pt-1">
            <Wand2 className="w-4 h-4" /> Special Candies
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
              <div className="w-8 h-8 mx-auto rounded-full bg-pink-500 mb-1 flex items-center justify-center text-white font-black text-xs shadow-inner">
                |||
              </div>
              <div className="font-bold text-stone-800">Striped Candy</div>
              <div className="text-[11px] text-stone-500 mt-0.5">Match 4 in a line. Clears an entire row or column!</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
              <div className="w-8 h-8 mx-auto rounded-full bg-purple-500 mb-1 flex items-center justify-center text-white font-black text-xs shadow-inner">
                ✦
              </div>
              <div className="font-bold text-stone-800">Wrapped Candy</div>
              <div className="text-[11px] text-stone-500 mt-0.5">Match in L or T shape. Explodes in a 3x3 blast!</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
              <div className="w-8 h-8 mx-auto rounded-full bg-stone-800 mb-1 flex items-center justify-center text-yellow-300 font-black text-xs shadow-inner">
                ★
              </div>
              <div className="font-bold text-stone-800">Color Bomb</div>
              <div className="text-[11px] text-stone-500 mt-0.5">Match 5 in a row. Clears all candies of swapped color!</div>
            </div>
          </div>

          {/* Combos */}
          <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 flex items-start gap-3">
            <Flame className="w-6 h-6 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-stone-800 text-sm">Super Combos</h4>
              <p>Swap two special candies together! Combine Striped + Striped for a cross blast, Wrapped + Striped for a giant beam, or Color Bomb + Color Bomb to wipe out the whole board!</p>
            </div>
          </div>

          {/* Boosters */}
          <h3 className="font-extrabold text-sm text-amber-600 flex items-center gap-1.5 pt-1">
            <Sparkles className="w-4 h-4" /> Boosters
          </h3>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-sky-50 border border-sky-200 flex items-center gap-2">
              <Hammer className="w-4 h-4 text-sky-600 shrink-0" />
              <div><strong>Hammer:</strong> Smashes any single candy without using a move.</div>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <div><strong>+5 Moves:</strong> Adds 5 moves to solve difficult objectives.</div>
            </div>
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-rose-600 shrink-0" />
              <div><strong>Color Bomb:</strong> Instantly spawns a Rainbow Color Bomb on the board.</div>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-amber-600 shrink-0" />
              <div><strong>Shuffle:</strong> Reshuffles the board for fresh match combinations.</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 font-extrabold text-white text-xs shadow-md hover:brightness-105 active:scale-95 transition cursor-pointer"
          >
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
