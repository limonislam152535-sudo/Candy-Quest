import React, { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene.js';
import { HomeScreen } from './ui/screens/HomeScreen.js';
import { LevelSelectScreen } from './ui/screens/LevelSelectScreen.js';
import { GameplayHUD } from './ui/screens/GameplayHUD.js';
import { LevelCompleteModal } from './ui/screens/LevelCompleteModal.js';
import { LevelFailedModal } from './ui/screens/LevelFailedModal.js';
import { SettingsModal } from './ui/screens/SettingsModal.js';
import { HowToPlayModal } from './ui/screens/HowToPlayModal.js';
import { PrivacyPolicyModal } from './ui/screens/PrivacyPolicyModal.js';
import { ConsentBanner } from './ui/screens/ConsentBanner.js';
import { StorageManager } from './utils/StorageManager.js';
import { SoundManager } from './utils/SoundManager.js';
import { ConsentManager } from './utils/ConsentManager.js';
import { AdManager } from './ads/AdManager.js';
import { BoosterManager, BoosterType, BoosterInventory } from './game/BoosterManager.js';
import { LevelConfig, LevelManager } from './game/LevelManager.js';

export default function App() {
  const [screen, setScreen] = useState<'home' | 'level-select' | 'playing'>('home');
  const [modal, setModal] = useState<'none' | 'complete' | 'failed' | 'settings' | 'how-to-play' | 'privacy' | 'paused'>('none');
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [movesLeft, setMovesLeft] = useState<number>(25);
  const [levelConfig, setLevelConfig] = useState<LevelConfig>(() => LevelManager.getLevel(1));
  const [earnedStars, setEarnedStars] = useState<number>(1);
  const [rewardBooster, setRewardBooster] = useState<BoosterType | null>(null);
  const [activeBooster, setActiveBooster] = useState<BoosterType | null>(null);
  const [boosters, setBoosters] = useState<BoosterInventory>(() => StorageManager.load().boosters);
  const [consentPending, setConsentPending] = useState<boolean>(() => ConsentManager.isConsentPending());

  const phaserContainerRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const gameSceneRef = useRef<GameScene | null>(null);

  // Sync document.body.dataset.state for ultra-mode compliance
  useEffect(() => {
    if (modal === 'complete' || modal === 'failed') {
      document.body.dataset.state = 'gameover';
    } else if (modal === 'paused') {
      document.body.dataset.state = 'paused';
    } else if (screen === 'playing') {
      document.body.dataset.state = 'playing';
    } else {
      document.body.dataset.state = 'title';
    }
  }, [screen, modal]);

  // Initial setup: Storage, Sound, Ads & URL params
  useEffect(() => {
    SoundManager.init();
    AdManager.initialize();

    const data = StorageManager.load();
    setCurrentLevel(data.currentLevel || 1);
    setLevelConfig(LevelManager.getLevel(data.currentLevel || 1));
    setBoosters(data.boosters);

    // Support ?autostart=1
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setScreen('playing');
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen === 'home' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        startGame(currentLevel);
      } else if (screen === 'playing') {
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          setModal(prev => (prev === 'paused' ? 'none' : 'paused'));
        } else if (e.key === 'm' || e.key === 'M') {
          const nextSfx = !SoundManager.isSfxEnabled();
          SoundManager.setSfxEnabled(nextSfx);
          SoundManager.setMusicEnabled(nextSfx);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, currentLevel]);

  // Clean and mount Phaser instance when entering or updating 'playing' screen
  const mountPhaserGame = useCallback((levelNum: number) => {
    if (!phaserContainerRef.current) return;

    // Destroy existing instance if any
    if (phaserGameRef.current) {
      phaserGameRef.current.destroy(true);
      phaserGameRef.current = null;
    }

    const cfg = LevelManager.getLevel(levelNum);
    setLevelConfig(cfg);
    setMovesLeft(cfg.moves);
    setScore(0);
    setActiveBooster(null);

    const sceneData = {
      levelNumber: levelNum,
      onScoreUpdate: (newScore: number) => setScore(newScore),
      onMovesUpdate: (moves: number) => setMovesLeft(moves),
      onObjectiveUpdate: () => {},
      onLevelComplete: (stars: number, finalScore: number) => {
        setEarnedStars(stars);
        setScore(finalScore);

        // Reward booster on specific milestones
        const bm = new BoosterManager(StorageManager.load().boosters);
        const reward = bm.rewardForLevelCompletion(levelNum);
        setRewardBooster(reward);
        const updatedBoosters = bm.getInventory();
        setBoosters(updatedBoosters);

        StorageManager.recordLevelResult(levelNum, finalScore, stars);
        StorageManager.save({
          currentLevel: levelNum + 1,
          boosters: updatedBoosters
        });
        setCurrentLevel(levelNum + 1);

        setModal('complete');
      },
      onLevelFailed: (finalScore: number) => {
        setScore(finalScore);
        setModal('failed');
      }
    };

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: phaserContainerRef.current,
      width: Math.min(window.innerWidth, 560),
      height: Math.min(window.innerHeight, 720),
      transparent: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    });

    game.events.once('ready', () => {
      const scene = game.scene.add('GameScene', GameScene, true, sceneData) as GameScene;
      gameSceneRef.current = scene;
    });

    phaserGameRef.current = game;
  }, []);

  const startGame = (levelNum: number) => {
    setCurrentLevel(levelNum);
    setScreen('playing');
    setModal('none');
    StorageManager.save({ currentLevel: levelNum });
    SoundManager.startMusic();
    setTimeout(() => {
      mountPhaserGame(levelNum);
    }, 50);
  };

  const handleBoosterSelect = async (type: BoosterType) => {
    const bm = new BoosterManager(boosters);
    if (!bm.canUse(type)) return;

    if (type === 'hammer') {
      if (activeBooster === 'hammer') {
        setActiveBooster(null);
        gameSceneRef.current?.setActiveBooster(null);
      } else {
        setActiveBooster('hammer');
        gameSceneRef.current?.setActiveBooster('hammer');
        bm.useBooster('hammer');
        const updated = bm.getInventory();
        setBoosters(updated);
        StorageManager.save({ boosters: updated });
      }
    } else if (type === 'extra_moves') {
      bm.useBooster('extra_moves');
      const updated = bm.getInventory();
      setBoosters(updated);
      StorageManager.save({ boosters: updated });
      await gameSceneRef.current?.applyBoosterDirectly('extra_moves');
    } else if (type === 'color_bomb') {
      bm.useBooster('color_bomb');
      const updated = bm.getInventory();
      setBoosters(updated);
      StorageManager.save({ boosters: updated });
      await gameSceneRef.current?.applyBoosterDirectly('color_bomb');
    } else if (type === 'shuffle') {
      bm.useBooster('shuffle');
      const updated = bm.getInventory();
      setBoosters(updated);
      StorageManager.save({ boosters: updated });
      await gameSceneRef.current?.applyBoosterDirectly('shuffle');
    }
  };

  const quitToHome = () => {
    if (phaserGameRef.current) {
      phaserGameRef.current.destroy(true);
      phaserGameRef.current = null;
    }
    setModal('none');
    setScreen('home');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#fce4ec] flex items-center justify-center font-bold">
      {/* 1. Home Screen */}
      {screen === 'home' && (
        <HomeScreen
          onPlay={() => startGame(currentLevel)}
          onOpenLevelSelect={() => setScreen('level-select')}
          onOpenSettings={() => setModal('settings')}
          onOpenHowToPlay={() => setModal('how-to-play')}
        />
      )}

      {/* 2. Level Selection Screen */}
      {screen === 'level-select' && (
        <LevelSelectScreen
          onSelectLevel={(lvl) => startGame(lvl)}
          onBack={() => setScreen('home')}
        />
      )}

      {/* 3. Gameplay Canvas & HUD */}
      {screen === 'playing' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          {/* Isolated Phaser Canvas Mount Container */}
          <div
            ref={phaserContainerRef}
            className="w-full h-full flex items-center justify-center"
            data-testid="game-canvas-container"
          />

          {/* Low-Occlusion HUD Overlay */}
          <GameplayHUD
            levelConfig={levelConfig}
            score={score}
            movesLeft={movesLeft}
            boosters={boosters}
            activeBooster={activeBooster}
            onSelectBooster={handleBoosterSelect}
            onPause={() => setModal('paused')}
          />
        </div>
      )}

      {/* Modals & Overlays */}
      {modal === 'complete' && (
        <LevelCompleteModal
          levelNumber={levelConfig.levelNumber}
          score={score}
          stars={earnedStars}
          rewardBooster={rewardBooster}
          onNextLevel={() => startGame(currentLevel)}
          onRetry={() => startGame(levelConfig.levelNumber)}
        />
      )}

      {modal === 'failed' && (
        <LevelFailedModal
          levelNumber={levelConfig.levelNumber}
          score={score}
          targetScore={levelConfig.targetScore}
          hasExtraMovesBooster={boosters.extra_moves > 0}
          onUseExtraMoves={() => {
            handleBoosterSelect('extra_moves');
            setModal('none');
          }}
          onRetry={() => startGame(levelConfig.levelNumber)}
          onGoHome={quitToHome}
        />
      )}

      {modal === 'paused' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs pointer-events-auto">
          <div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl border-4 border-pink-200 text-stone-800 text-center">
            <h3 className="font-black tracking-wide text-2xl text-pink-600 mb-4 tracking-wide">PAUSED</h3>
            <div className="space-y-2.5">
              <button
                onClick={() => setModal('none')}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-green-500 text-white font-extrabold text-sm shadow-md hover:brightness-105 active:scale-95 transition cursor-pointer"
              >
                Resume
              </button>
              <button
                onClick={() => startGame(levelConfig.levelNumber)}
                className="w-full py-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-extrabold text-sm transition active:scale-95 cursor-pointer"
              >
                Restart Level
              </button>
              <button
                onClick={quitToHome}
                className="w-full py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 font-extrabold text-sm transition active:scale-95 cursor-pointer"
              >
                Quit to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === 'settings' && (
        <SettingsModal
          onClose={() => setModal('none')}
          onOpenHowToPlay={() => setModal('how-to-play')}
          onOpenPrivacy={() => setModal('privacy')}
          onProgressReset={() => {
            const data = StorageManager.load();
            setCurrentLevel(1);
            setBoosters(data.boosters);
          }}
        />
      )}

      {modal === 'how-to-play' && (
        <HowToPlayModal onClose={() => setModal('none')} />
      )}

      {modal === 'privacy' && (
        <PrivacyPolicyModal onClose={() => setModal('none')} />
      )}

      {/* GDPR / ePrivacy Player Consent Banner */}
      {consentPending && (
        <ConsentBanner
          onConsentChoice={() => setConsentPending(false)}
          onOpenPrivacy={() => setModal('privacy')}
        />
      )}
    </div>
  );
}
