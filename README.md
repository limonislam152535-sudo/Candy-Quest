# Candy Quest – Sweet Match Adventure

A production-ready, browser-based Match-3 casual puzzle game built with **Phaser 3**, **TypeScript**, **React**, **Vite**, and **Tailwind CSS**.

Featuring high-gloss 3D candy art, endless procedurally generated levels, dynamic cascades, special candies (Striped, Wrapped, Color Bombs, and combos), in-game boosters (Hammer, +5 Moves, Rainbow Color Bomb, Shuffle), Web Audio sound synthesis, LocalStorage progress persistence, and modular Adsterra monetization architecture.

---

## 🎮 Game Features

- **8×8 Match-3 Playing Board**: Responsive canvas scaling for desktop, Android, and iOS mobile devices.
- **3D Glossy Candy Aesthetics**: Bright, colorful pastel candy shapes with 3D specular highlights, soft ground shadows, and juicy squash & stretch animations.
- **Special Candies & Combos**:
  - **Striped Candy**: Formed by 4 candies in a row. Clears an entire row or column.
  - **Wrapped Candy**: Formed by L or T shapes. Detonates in a 3×3 explosion.
  - **Color Bomb**: Formed by 5 candies in a line. Wipes out all candies of a selected color.
  - **Super Combos**: Combine Striped + Striped for a cross-beam blast, Wrapped + Striped for a giant 3-row / 3-column blast, or Color Bomb + Color Bomb for a total board wipeout!
- **Unlimited Procedural Levels**: Balanced difficulty scaling with varied objectives (Score targets, color collection, total candies cleared) and 1–3 star ratings.
- **Juicy In-Game Boosters**:
  - 🔨 **Hammer**: Destroys any chosen candy without spending a move.
  - ➕ **+5 Extra Moves**: Grants additional turns to complete challenging levels.
  - 🌈 **Rainbow Color Bomb**: Spawns an instant Color Bomb on the board.
  - 🔀 **Shuffle**: Reshuffles the board when you need fresh match combinations.
- **Original Synthesized Audio**: Real-time Web Audio sound effects (pops, chimes, slides, fanfares) and gentle ambient BGM with zero external audio assets or licensing issues.
- **Save System**: Automatically persists high scores, stars, unlocked levels, booster inventory, and sound settings to `localStorage`.

---

## 💰 Adsterra Monetization Architecture

The advertising architecture is isolated from core game logic (`src/ads/`):
- **Smartlink ("Sponsored Offer")**:
  - URL: `https://asiafilm.org/4/98fe62a7a045c7160e2e60fc420bbd60`
  - Explicit user click only (`target="_blank"` with `noopener noreferrer`). Never disguised as a game button or triggered on candy moves.
- **Banner Ad (468×60)**:
  - Key: `67112b110ba97e9e29ef42e6a75b28b5`
  - Script: `https://bicea.org/22/67112b110ba97e9e29ef42e6a75b28b5`
  - Positioned safely on non-gameplay screens (Home and Level Selection). Hides cleanly on small screens (<480px) to prevent horizontal overflow and accidental clicks.
- **Social Bar & Popunder**:
  - Included as dedicated adapters (`SocialBarAdapter.ts`, `PopunderAdapter.ts`), kept **disabled by default** (`enabled: false` in `AdConfig.ts`) until publisher terms and format behavior are approved.
- **Player Consent & Privacy**:
  - Integrated `ConsentManager` and transparent `PrivacyPolicyModal` providing user control over non-essential promotional scripts.

---

## 🚀 Installation & Local Development

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Run Logic Unit Tests
```bash
npx --yes tsx --test src/game/rules.test.ts
```

### 4. Build for Production
```bash
npm run build
```

---

## ☁️ Vercel Deployment

This project is configured for single-command deployment to **Vercel**:

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and import the repository.
3. Configure project settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Click **Deploy**. Vercel will assign a production URL (e.g. `https://candy-quest.vercel.app`).
5. Direct URL refreshes are supported via `vercel.json` SPA rewrite rules.
