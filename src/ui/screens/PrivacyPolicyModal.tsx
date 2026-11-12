import React from 'react';
import { X, Shield, Lock, Eye, ExternalLink } from 'lucide-react';
import { ConsentManager } from '../../utils/ConsentManager.js';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
  const currentConsent = ConsentManager.getStatus();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs pointer-events-auto">
      <div className="w-full max-w-xl max-h-[85vh] bg-white rounded-3xl shadow-2xl border-4 border-pink-200 flex flex-col text-stone-800 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-pink-500 to-rose-400 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-6 h-6" />
            <h2 className="text-xl font-extrabold font-black tracking-wide tracking-wide">Privacy & Cookie Policy</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Privacy Policy"
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition active:scale-90 cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-stone-600">
          <p className="text-stone-700 font-semibold">
            Last Updated: November 2026. This Privacy Notice explains how "Candy Quest – Sweet Match Adventure" handles user data, local storage, external links, and third-party advertising scripts.
          </p>

          <section className="space-y-1.5">
            <h3 className="font-bold text-sm text-pink-600 flex items-center gap-1.5">
              <Lock className="w-4 h-4" /> 1. No Personal Accounts or Sensitive Information
            </h3>
            <p>
              Candy Quest does not require player registration, login, phone numbers, email addresses, or financial credentials to play. All game progress is stored strictly locally on your browser.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-bold text-sm text-pink-600 flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> 2. Browser LocalStorage Usage
            </h3>
            <p>
              The application uses your browser's HTML5 LocalStorage to persist game state between sessions. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-0.5">
              <li>Current level and highest unlocked level</li>
              <li>Scores and star ratings achieved (1 to 3 stars)</li>
              <li>In-game booster counts (Hammer, Extra Moves, Color Bombs, Shuffles)</li>
              <li>Sound and music toggle preferences</li>
              <li>Your consent selection</li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-bold text-sm text-pink-600 flex items-center gap-1.5">
              <ExternalLink className="w-4 h-4" /> 3. Third-Party Advertising & External Links
            </h3>
            <p>
              To keep the game free to play, the application integrates third-party promotional services provided by Adsterra:
            </p>
            <ul className="list-disc pl-5 space-y-0.5">
              <li>
                <strong>Banner Display (468x60):</strong> Displayed only on non-gameplay screens (Home and Level Selection) inside an isolated iframe. Never shown over the playing board.
              </li>
              <li>
                <strong>Sponsored Offers:</strong> Clearly designated external offer links opened solely when you explicitly tap the "Sponsored Offer" button. Opens safely with <code>noopener</code> and <code>noreferrer</code> in a separate tab.
              </li>
              <li>
                <strong>Social Bar & Popunder:</strong> Kept strictly disabled by default.
              </li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-bold text-sm text-pink-600">4. Your Consent & Control</h3>
            <p>
              You can grant or withdraw consent for third-party advertising scripts at any time using the toggle below. Essential gameplay and local progress saving will continue to function seamlessly regardless of your choice.
            </p>
            <div className="p-3 bg-pink-50 rounded-2xl border border-pink-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-800">Third-Party Advertising Scripts:</span>
                <span className="ml-2 font-semibold text-pink-600">
                  {currentConsent === 'granted' ? 'Allowed' : 'Disabled / Essential Only'}
                </span>
              </div>
              <button
                onClick={() => {
                  ConsentManager.setConsent(currentConsent !== 'granted');
                  onClose();
                }}
                className="py-1.5 px-3 rounded-xl bg-pink-500 text-white font-bold text-xs hover:bg-pink-600 transition cursor-pointer"
              >
                Toggle Choice
              </button>
            </div>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-bold text-sm text-pink-600">5. Contact Information</h3>
            <p>
              For inquiries regarding this privacy statement or website policies, website administrators may configure and provide verified contact channels here.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-2xl bg-stone-200 hover:bg-stone-300 font-bold text-stone-700 text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
