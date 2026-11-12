import Phaser from 'phaser';
import { BoardManager } from '../game/BoardManager.js';
import { CandyColor, CandyData, CANDY_COLORS, SpecialType } from '../game/Candy.js';
import { CandyTextures } from '../game/CandyTextures.js';
import { SoundManager } from '../utils/SoundManager.js';
import { BoosterType } from '../game/BoosterManager.js';

export interface GameSceneInitData {
  levelNumber: number;
  onLevelComplete: (stars: number, score: number) => void;
  onLevelFailed: (score: number) => void;
  onScoreUpdate: (score: number) => void;
  onMovesUpdate: (moves: number) => void;
  onObjectiveUpdate: (data: any) => void;
}

export class GameScene extends Phaser.Scene {
  private boardManager!: BoardManager;
  private candySprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private selectedCandy: { row: number; col: number; sprite: Phaser.GameObjects.Sprite } | null = null;
  private selectionGlow: Phaser.GameObjects.Graphics | null = null;
  private tileSize = 58;
  private boardOffsetX = 0;
  private boardOffsetY = 0;
  private activeBooster: BoosterType | null = null;
  private initData!: GameSceneInitData;
  private boardBackgroundContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data?: Partial<GameSceneInitData>) {
    this.initData = {
      levelNumber: data?.levelNumber || 1,
      onLevelComplete: data?.onLevelComplete || (() => {}),
      onLevelFailed: data?.onLevelFailed || (() => {}),
      onScoreUpdate: data?.onScoreUpdate || (() => {}),
      onMovesUpdate: data?.onMovesUpdate || (() => {}),
      onObjectiveUpdate: data?.onObjectiveUpdate || (() => {})
    };
    this.candySprites.clear();
    this.selectedCandy = null;
    this.activeBooster = null;
  }

  preload() {
    // Generate all 3D glossy candy textures procedurally into Phaser Texture Manager
    const specialTypes: SpecialType[] = ['none', 'striped_h', 'striped_v', 'wrapped', 'color_bomb'];

    CANDY_COLORS.forEach(color => {
      specialTypes.forEach(special => {
        const key = `candy_${color}_${special}`;
        if (!this.textures.exists(key)) {
          const canvas = CandyTextures.createCandyCanvas(color, special, 128);
          this.textures.addCanvas(key, canvas);
        }
      });
    });

    // Color Bomb generic texture
    if (!this.textures.exists('candy_color_bomb')) {
      const bombCanvas = CandyTextures.createCandyCanvas('red', 'color_bomb', 128);
      this.textures.addCanvas('candy_color_bomb', bombCanvas);
    }
  }

  create() {
    const { width, height } = this.scale;

    // Responsive tile sizing based on canvas viewport with guaranteed clearance for HUD (top) and Dock (bottom)
    const topHudPadding = 145;
    const bottomDockPadding = 115;
    const availableWidth = width * 0.92;
    const availableHeight = height - topHudPadding - bottomDockPadding;

    this.tileSize = Math.floor(Math.min(availableWidth / 8, availableHeight / 8, 54));

    this.boardOffsetX = Math.floor((width - this.tileSize * 8) / 2);
    this.boardOffsetY = Math.floor(topHudPadding + (availableHeight - this.tileSize * 8) / 2);

    // Draw board background grid with subtle checkered tile pattern
    this.createBoardBackground();

    // Initialize selection glow indicator
    this.selectionGlow = this.add.graphics();
    this.selectionGlow.setDepth(15);

    // Initialize BoardManager with callbacks
    this.boardManager = new BoardManager(this.initData.levelNumber, {
      onScoreUpdate: (score) => {
        this.initData.onScoreUpdate(score);
      },
      onMovesUpdate: (moves) => {
        this.initData.onMovesUpdate(moves);
      },
      onObjectiveProgress: (config, cleared) => {
        this.initData.onObjectiveUpdate({ config, cleared });
      },
      onComboEffect: (name, cells) => {
        SoundManager.playSpecial();
        this.showComboFloatText(name);
        this.playParticleBurstOnCells(cells);
      },
      onMatchEffect: (cells, combo) => {
        SoundManager.playMatch(combo);
        this.playMatchParticles(cells);
      },
      onLevelComplete: (stars, score) => {
        SoundManager.playWin();
        this.time.delayedCall(500, () => {
          this.initData.onLevelComplete(stars, score);
        });
      },
      onLevelFailed: (score) => {
        SoundManager.playFail();
        this.time.delayedCall(500, () => {
          this.initData.onLevelFailed(score);
        });
      }
    });

    // Populate initial visual sprites
    this.renderBoardCandies();

    // Setup input handlers
    this.setupInput();

    // Initial HUD notification
    this.initData.onScoreUpdate(0);
    this.initData.onMovesUpdate(this.boardManager.getMovesLeft());
    this.initData.onObjectiveUpdate({
      config: this.boardManager.getLevelConfig(),
      cleared: 0
    });
  }

  private createBoardBackground() {
    this.boardBackgroundContainer = this.add.container(0, 0);
    this.boardBackgroundContainer.setDepth(1);

    const graphics = this.add.graphics();

    // Outer board card with rounded corners and chocolate/cookie frame
    const margin = 8;
    const boardW = this.tileSize * 8 + margin * 2;
    const boardH = this.tileSize * 8 + margin * 2;
    const boardX = this.boardOffsetX - margin;
    const boardY = this.boardOffsetY - margin;

    // Soft dropshadow
    graphics.fillStyle(0x000000, 0.12);
    graphics.fillRoundedRect(boardX + 2, boardY + 6, boardW, boardH, 20);

    // Board container border (wafer biscuit crust tone)
    graphics.fillStyle(0xebd3b5, 0.95);
    graphics.lineStyle(4, 0xd4a373, 1);
    graphics.fillRoundedRect(boardX, boardY, boardW, boardH, 18);
    graphics.strokeRoundedRect(boardX, boardY, boardW, boardH, 18);

    // Inner playing grid background
    graphics.fillStyle(0xf8f4e8, 0.9);
    graphics.fillRoundedRect(this.boardOffsetX - 2, this.boardOffsetY - 2, this.tileSize * 8 + 4, this.tileSize * 8 + 4, 12);

    // Subtle checkered pattern for tiles
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const isEven = (r + c) % 2 === 0;
        graphics.fillStyle(isEven ? 0xffffff : 0xf2ebdc, 0.65);
        graphics.fillRoundedRect(
          this.boardOffsetX + c * this.tileSize + 2,
          this.boardOffsetY + r * this.tileSize + 2,
          this.tileSize - 4,
          this.tileSize - 4,
          8
        );
      }
    }

    this.boardBackgroundContainer.add(graphics);
  }

  private renderBoardCandies() {
    const grid = this.boardManager.getGrid();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const candy = grid[r][c];
        if (candy) {
          this.createOrUpdateCandySprite(candy);
        }
      }
    }
  }

  private getTextureKey(candy: CandyData): string {
    if (candy.special === 'color_bomb') {
      return 'candy_color_bomb';
    }
    return `candy_${candy.color}_${candy.special || 'none'}`;
  }

  private createOrUpdateCandySprite(candy: CandyData): Phaser.GameObjects.Sprite {
    const x = this.boardOffsetX + candy.col * this.tileSize + this.tileSize / 2;
    const y = this.boardOffsetY + candy.row * this.tileSize + this.tileSize / 2;
    const textureKey = this.getTextureKey(candy);

    const targetScale = (this.tileSize * 0.86) / 128;
    let sprite = this.candySprites.get(candy.id);

    if (!sprite) {
      sprite = this.add.sprite(x, y, textureKey);
      sprite.setScale(0);
      sprite.setInteractive({ useHandCursor: true });
      sprite.setDepth(10);
      sprite.setData('candyId', candy.id);
      sprite.setData('row', candy.row);
      sprite.setData('col', candy.col);
      this.candySprites.set(candy.id, sprite);

      // Entrance drop tween
      this.tweens.add({
        targets: sprite,
        scaleX: targetScale,
        scaleY: targetScale,
        duration: 250,
        ease: 'Back.easeOut'
      });
    } else {
      sprite.setTexture(textureKey);
      sprite.setData('row', candy.row);
      sprite.setData('col', candy.col);

      // Smooth slide tween to new position
      this.tweens.add({
        targets: sprite,
        x,
        y,
        scaleX: targetScale,
        scaleY: targetScale,
        duration: 220,
        ease: 'Quad.easeOut'
      });
    }

    return sprite;
  }

  private setupInput() {
    this.input.on('gameobjectdown', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
      if (this.boardManager.isInputLocked()) return;
      const sprite = gameObject as Phaser.GameObjects.Sprite;
      const row = sprite.getData('row');
      const col = sprite.getData('col');

      // If a booster (like Hammer) is active
      if (this.activeBooster) {
        this.handleBoosterClick(this.activeBooster, row, col);
        return;
      }

      this.handleCandySelect(row, col, sprite);
    });

    // Touch / Mouse drag-swap support
    this.input.on('pointerup', () => {
      // release drag
    });
  }

  private handleCandySelect(row: number, col: number, sprite: Phaser.GameObjects.Sprite) {
    if (!this.selectedCandy) {
      // First selection
      this.selectedCandy = { row, col, sprite };
      SoundManager.playClick();
      this.drawSelectionGlow(row, col);

      // Subtle pulse animation
      this.tweens.add({
        targets: sprite,
        scaleX: sprite.scaleX * 1.12,
        scaleY: sprite.scaleY * 1.12,
        yoyo: true,
        duration: 160
      });
    } else {
      const prev = this.selectedCandy;
      const dist = Math.abs(prev.row - row) + Math.abs(prev.col - col);

      if (dist === 1) {
        // Adjacent candy -> attempt swap!
        this.clearSelection();
        this.executeSwapAnimation(prev.row, prev.col, row, col);
      } else {
        // Not adjacent or re-clicked same candy -> change selection
        if (prev.row === row && prev.col === col) {
          this.clearSelection();
        } else {
          this.selectedCandy = { row, col, sprite };
          SoundManager.playClick();
          this.drawSelectionGlow(row, col);
        }
      }
    }
  }

  private drawSelectionGlow(row: number, col: number) {
    if (!this.selectionGlow) return;
    this.selectionGlow.clear();
    const x = this.boardOffsetX + col * this.tileSize;
    const y = this.boardOffsetY + row * this.tileSize;

    this.selectionGlow.lineStyle(3.5, 0xffe066, 1);
    this.selectionGlow.strokeRoundedRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4, 10);
  }

  private clearSelection() {
    this.selectedCandy = null;
    this.selectionGlow?.clear();
  }

  private async executeSwapAnimation(r1: number, c1: number, r2: number, c2: number) {
    const candyA = this.boardManager.getCandy(r1, c1);
    const candyB = this.boardManager.getCandy(r2, c2);
    if (!candyA || !candyB) return;

    const spriteA = this.candySprites.get(candyA.id);
    const spriteB = this.candySprites.get(candyB.id);
    if (!spriteA || !spriteB) return;

    SoundManager.playSwap();

    const xA = spriteA.x;
    const yA = spriteA.y;
    const xB = spriteB.x;
    const yB = spriteB.y;

    // Swap tween
    this.tweens.add({ targets: spriteA, x: xB, y: yB, duration: 180, ease: 'Quad.easeInOut' });
    this.tweens.add({ targets: spriteB, x: xA, y: yA, duration: 180, ease: 'Quad.easeInOut' });

    await new Promise(r => this.time.delayedCall(200, r));

    const result = await this.boardManager.trySwap(r1, c1, r2, c2);

    if (!result.valid) {
      // Revert swap tween smoothly
      this.tweens.add({ targets: spriteA, x: xA, y: yA, duration: 180, ease: 'Quad.easeInOut' });
      this.tweens.add({ targets: spriteB, x: xB, y: yB, duration: 180, ease: 'Quad.easeInOut' });
    } else {
      // Sync board visual sprites
      this.syncVisualBoard();
    }
  }

  private syncVisualBoard() {
    const grid = this.boardManager.getGrid();
    const activeIds = new Set<string>();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const candy = grid[r][c];
        if (candy) {
          activeIds.add(candy.id);
          this.createOrUpdateCandySprite(candy);
        }
      }
    }

    // Remove sprites no longer on the board
    this.candySprites.forEach((sprite, id) => {
      if (!activeIds.has(id)) {
        this.tweens.add({
          targets: sprite,
          scaleX: 0,
          scaleY: 0,
          alpha: 0,
          duration: 180,
          onComplete: () => {
            sprite.destroy();
            this.candySprites.delete(id);
          }
        });
      }
    });
  }

  private playMatchParticles(cells: { row: number; col: number }[]) {
    cells.forEach(cell => {
      const x = this.boardOffsetX + cell.col * this.tileSize + this.tileSize / 2;
      const y = this.boardOffsetY + cell.row * this.tileSize + this.tileSize / 2;

      // Create burst stars/sparkles
      for (let i = 0; i < 6; i++) {
        const sparkle = this.add.graphics();
        sparkle.fillStyle(0xfff3a0, 1);
        sparkle.fillCircle(0, 0, 3.5);
        sparkle.setPosition(x, y);
        sparkle.setDepth(20);

        const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.4;
        const speed = 35 + Math.random() * 40;

        this.tweens.add({
          targets: sparkle,
          x: x + Math.cos(angle) * speed,
          y: y + Math.sin(angle) * speed,
          alpha: 0,
          scale: 0.2,
          duration: 350,
          ease: 'Cubic.easeOut',
          onComplete: () => sparkle.destroy()
        });
      }
    });
  }

  private playParticleBurstOnCells(cells: { row: number; col: number }[]) {
    cells.forEach(cell => {
      const x = this.boardOffsetX + cell.col * this.tileSize + this.tileSize / 2;
      const y = this.boardOffsetY + cell.row * this.tileSize + this.tileSize / 2;

      const ring = this.add.graphics();
      ring.lineStyle(3, 0xffffff, 1);
      ring.strokeCircle(0, 0, 10);
      ring.setPosition(x, y);
      ring.setDepth(22);

      this.tweens.add({
        targets: ring,
        scale: 2.8,
        alpha: 0,
        duration: 400,
        ease: 'Quad.easeOut',
        onComplete: () => ring.destroy()
      });
    });
  }

  private showComboFloatText(text: string) {
    const { width, height } = this.scale;
    const txt = this.add.text(width / 2, height / 2, text, {
      fontFamily: 'Titan One, Fredoka, sans-serif',
      fontSize: '28px',
      color: '#ff2d55',
      stroke: '#ffffff',
      strokeThickness: 6,
      align: 'center'
    });
    txt.setOrigin(0.5);
    txt.setDepth(30);

    this.tweens.add({
      targets: txt,
      y: txt.y - 60,
      scale: 1.25,
      alpha: 0,
      duration: 900,
      ease: 'Back.easeOut',
      onComplete: () => txt.destroy()
    });
  }

  public setActiveBooster(type: BoosterType | null) {
    this.activeBooster = type;
    if (type) {
      this.clearSelection();
    }
  }

  private async handleBoosterClick(type: BoosterType, row: number, col: number) {
    this.activeBooster = null;
    if (type === 'hammer') {
      SoundManager.playHammer();
      await this.boardManager.applyBooster('hammer', row, col);
      this.syncVisualBoard();
    } else if (type === 'color_bomb') {
      await this.boardManager.applyBooster('color_bomb', row, col);
      this.syncVisualBoard();
    }
  }

  public async applyBoosterDirectly(type: BoosterType): Promise<boolean> {
    const success = await this.boardManager.applyBooster(type);
    if (success) {
      this.syncVisualBoard();
    }
    return success;
  }

  public getBoardManager(): BoardManager {
    return this.boardManager;
  }
}
