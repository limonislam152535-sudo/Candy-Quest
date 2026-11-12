import { CandyColor, CandyData, SpecialType, CANDY_COLORS } from './Candy.js';
import { MatchDetector, GridCell } from './MatchDetector.js';
import { SpecialCandyManager, AffectedCell } from './SpecialCandyManager.js';
import { LevelConfig, LevelManager } from './LevelManager.js';
import { ScoreManager } from './ScoreManager.js';
import { BoosterType } from './BoosterManager.js';

export interface BoardEventCallbacks {
  onScoreUpdate?: (score: number, pointsAdded: number) => void;
  onMovesUpdate?: (movesLeft: number) => void;
  onObjectiveProgress?: (config: LevelConfig, totalCleared: number) => void;
  onComboEffect?: (comboName: string, cells: AffectedCell[]) => void;
  onMatchEffect?: (cells: { row: number; col: number }[], combo: number) => void;
  onCandySpawn?: (candy: CandyData) => void;
  onLevelComplete?: (stars: number, score: number) => void;
  onLevelFailed?: (score: number) => void;
}

export class BoardManager {
  public readonly rows = 8;
  public readonly cols = 8;
  private grid: (CandyData | null)[][] = [];
  private levelConfig: LevelConfig;
  private scoreManager: ScoreManager;
  private movesLeft: number;
  private totalCandiesCleared = 0;
  private isProcessing = false;
  private nextId = 1;
  private callbacks: BoardEventCallbacks;

  constructor(levelNumber: number, callbacks: BoardEventCallbacks = {}) {
    this.callbacks = callbacks;
    this.levelConfig = LevelManager.getLevel(levelNumber);
    this.movesLeft = this.levelConfig.moves;
    this.scoreManager = new ScoreManager(0);
    this.initBoard();
  }

  getLevelConfig(): LevelConfig {
    return this.levelConfig;
  }

  getGrid(): (CandyData | null)[][] {
    return this.grid;
  }

  getCandy(row: number, col: number): CandyData | null {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return null;
    return this.grid[row][col];
  }

  getMovesLeft(): number {
    return this.movesLeft;
  }

  getScore(): number {
    return this.scoreManager.getScore();
  }

  getCombo(): number {
    return this.scoreManager.getCombo();
  }

  isInputLocked(): boolean {
    return this.isProcessing;
  }

  setInputLocked(locked: boolean): void {
    this.isProcessing = locked;
  }

  /**
   * Initializes an 8x8 grid with no pre-existing matches, but with at least one legal move.
   */
  initBoard(): void {
    const colors = this.levelConfig.availableColors;
    let attempts = 0;
    let validBoard = false;

    while (!validBoard && attempts < 50) {
      attempts++;
      this.grid = [];
      for (let r = 0; r < this.rows; r++) {
        const row: (CandyData | null)[] = [];
        for (let c = 0; c < this.cols; c++) {
          // Avoid creating initial 3-in-a-row
          const forbidden = new Set<CandyColor>();
          if (c >= 2 && row[c - 1] && row[c - 2] && row[c - 1]!.color === row[c - 2]!.color) {
            forbidden.add(row[c - 1]!.color);
          }
          if (r >= 2 && this.grid[r - 1][c] && this.grid[r - 2][c] && this.grid[r - 1][c]!.color === this.grid[r - 2][c]!.color) {
            forbidden.add(this.grid[r - 1][c]!.color);
          }

          const allowed = colors.filter(col => !forbidden.has(col));
          const color = allowed.length > 0 ? allowed[Math.floor(Math.random() * allowed.length)] : colors[0];

          row.push({
            id: `c_${this.nextId++}`,
            row: r,
            col: c,
            color,
            special: 'none'
          });
        }
        this.grid.push(row);
      }

      // Ensure there is at least one legal move
      const legalMoves = MatchDetector.findLegalMoves(this.grid);
      if (legalMoves.length >= 2) {
        validBoard = true;
      }
    }
  }

  /**
   * Performs an adjacent swap. Returns true if swap was valid, false if invalid.
   */
  async trySwap(
    r1: number,
    c1: number,
    r2: number,
    c2: number
  ): Promise<{ valid: boolean; specialCombo?: string }> {
    if (this.isProcessing || this.movesLeft <= 0) {
      return { valid: false };
    }

    const cA = this.grid[r1]?.[c1];
    const cB = this.grid[r2]?.[c2];
    if (!cA || !cB) return { valid: false };

    // Manhattan distance must be 1
    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) {
      return { valid: false };
    }

    this.isProcessing = true;

    // Check for special candy combinations (both are special)
    const isSpecial1 = cA.special && cA.special !== 'none';
    const isSpecial2 = cB.special && cB.special !== 'none';

    if (isSpecial1 && isSpecial2) {
      // Execute special combo
      this.movesLeft--;
      this.callbacks.onMovesUpdate?.(this.movesLeft);

      const combo = SpecialCandyManager.getSpecialComboCells(
        { row: r1, col: c1, special: cA.special, color: cA.color },
        { row: r2, col: c2, special: cB.special, color: cB.color },
        this.grid
      );

      this.callbacks.onComboEffect?.(combo.comboName, combo.affected);
      await this.clearCells(combo.affected);
      await this.collapseAndFill();
      this.checkEndGameConditions();
      this.isProcessing = false;
      return { valid: true, specialCombo: combo.comboName };
    }

    // Check if one is a Color Bomb
    if (cA.special === 'color_bomb' || cB.special === 'color_bomb') {
      this.movesLeft--;
      this.callbacks.onMovesUpdate?.(this.movesLeft);

      const bomb = cA.special === 'color_bomb' ? cA : cB;
      const target = cA.special === 'color_bomb' ? cB : cA;

      const cells = SpecialCandyManager.getSpecialExplosionCells(
        'color_bomb',
        bomb.row,
        bomb.col,
        target.color,
        this.grid
      );

      this.callbacks.onComboEffect?.(`Color Bomb (${target.color})`, cells);
      await this.clearCells(cells);
      await this.collapseAndFill();
      this.checkEndGameConditions();
      this.isProcessing = false;
      return { valid: true, specialCombo: 'Color Bomb' };
    }

    // Standard swap test
    const valid = MatchDetector.isValidSwap(this.grid, r1, c1, r2, c2);
    if (!valid) {
      this.isProcessing = false;
      return { valid: false };
    }

    // Execute valid swap
    this.movesLeft--;
    this.callbacks.onMovesUpdate?.(this.movesLeft);

    // Swap references
    this.grid[r1][c1] = cB;
    this.grid[r2][c2] = cA;
    cA.row = r2;
    cA.col = c2;
    cB.row = r1;
    cB.col = c1;

    this.scoreManager.resetCombo();
    await this.processMatches({ row: r2, col: c2 });
    this.checkEndGameConditions();
    this.isProcessing = false;

    return { valid: true };
  }

  /**
   * Recursive cascade processor for matches and cascades
   */
  private async processMatches(preferredSpawn?: { row: number; col: number }): Promise<void> {
    let matches = MatchDetector.findMatches(this.grid, preferredSpawn);

    while (matches.length > 0 && matches[0].matchedCells.length > 0) {
      const match = matches[0];
      const count = match.matchedCells.length;
      const combo = this.scoreManager.getCombo();

      // Track objective progress
      const colorCounts: Record<string, number> = {};
      for (const cell of match.matchedCells) {
        const c = this.grid[cell.row]?.[cell.col];
        if (c) {
          colorCounts[c.color] = (colorCounts[c.color] || 0) + 1;
        }
      }

      this.totalCandiesCleared += count;
      if (this.levelConfig.objective.targetColors) {
        for (const tc of this.levelConfig.objective.targetColors) {
          if (colorCounts[tc.color]) {
            tc.current = Math.min(tc.count, tc.current + colorCounts[tc.color]);
          }
        }
      }

      this.callbacks.onObjectiveProgress?.(this.levelConfig, this.totalCandiesCleared);

      // Score
      const pts = this.scoreManager.addMatchScore(count, match.specialCreated ? 100 : 0);
      this.callbacks.onScoreUpdate?.(this.scoreManager.getScore(), pts);
      this.callbacks.onMatchEffect?.(match.matchedCells, combo);

      // Check special candy activations inside matched cells
      const extraCleared: AffectedCell[] = [];
      for (const coord of match.matchedCells) {
        const candy = this.grid[coord.row]?.[coord.col];
        if (candy && candy.special && candy.special !== 'none') {
          const specCells = SpecialCandyManager.getSpecialExplosionCells(
            candy.special,
            candy.row,
            candy.col,
            candy.color,
            this.grid
          );
          extraCleared.push(...specCells);
        }
      }

      // Convert match cells into AffectedCells
      const allToClear: AffectedCell[] = match.matchedCells.map(m => ({
        row: m.row,
        col: m.col,
        reason: 'match' as const
      }));
      allToClear.push(...extraCleared);

      // Nullify cleared cells
      for (const item of allToClear) {
        if (this.grid[item.row]) {
          this.grid[item.row][item.col] = null;
        }
      }

      // Spawn newly created special candy if any
      if (match.specialCreated) {
        const sp = match.specialCreated;
        this.grid[sp.row][sp.col] = {
          id: `c_${this.nextId++}`,
          row: sp.row,
          col: sp.col,
          color: sp.color,
          special: sp.special
        };
      }

      // Drop and refill
      await this.collapseAndFill();

      // Increment combo and check for further cascades
      this.scoreManager.incrementCombo();
      matches = MatchDetector.findMatches(this.grid);
    }

    // Ensure board still has valid moves; if not, reshuffle!
    const remainingMoves = MatchDetector.findLegalMoves(this.grid);
    if (remainingMoves.length === 0) {
      this.shuffleBoard();
    }
  }

  /**
   * Clears specified cells directly (e.g. from special combos)
   */
  private async clearCells(cells: AffectedCell[]): Promise<void> {
    for (const cell of cells) {
      const candy = this.grid[cell.row]?.[cell.col];
      if (candy) {
        this.totalCandiesCleared++;
        if (this.levelConfig.objective.targetColors) {
          for (const tc of this.levelConfig.objective.targetColors) {
            if (tc.color === candy.color) {
              tc.current = Math.min(tc.count, tc.current + 1);
            }
          }
        }
        this.grid[cell.row][cell.col] = null;
      }
    }
    const pts = cells.length * 30;
    this.scoreManager.addDirectPoints(pts);
    this.callbacks.onScoreUpdate?.(this.scoreManager.getScore(), pts);
    this.callbacks.onObjectiveProgress?.(this.levelConfig, this.totalCandiesCleared);
  }

  /**
   * Collapses candies downward and fills top with newly generated candies
   */
  private async collapseAndFill(): Promise<void> {
    const colors = this.levelConfig.availableColors;

    // For each column, collapse downwards
    for (let c = 0; c < this.cols; c++) {
      let emptyRow = this.rows - 1;
      for (let r = this.rows - 1; r >= 0; r--) {
        if (this.grid[r][c] !== null) {
          if (emptyRow !== r) {
            this.grid[emptyRow][c] = this.grid[r][c];
            this.grid[emptyRow][c]!.row = emptyRow;
            this.grid[r][c] = null;
          }
          emptyRow--;
        }
      }

      // Fill remaining empty top rows with fresh candies
      for (let r = emptyRow; r >= 0; r--) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const candy: CandyData = {
          id: `c_${this.nextId++}`,
          row: r,
          col: c,
          color,
          special: 'none'
        };
        this.grid[r][c] = candy;
        this.callbacks.onCandySpawn?.(candy);
      }
    }
  }

  /**
   * Executes a player booster action
   */
  async applyBooster(type: BoosterType, targetRow?: number, targetCol?: number): Promise<boolean> {
    if (this.isProcessing) return false;

    if (type === 'hammer') {
      if (targetRow === undefined || targetCol === undefined) return false;
      const candy = this.grid[targetRow]?.[targetCol];
      if (!candy) return false;

      this.isProcessing = true;
      const affected = [{ row: targetRow, col: targetCol, reason: 'combo' as const }];
      this.callbacks.onComboEffect?.('Hammer Strike', affected);
      await this.clearCells(affected);
      await this.collapseAndFill();
      await this.processMatches();
      this.checkEndGameConditions();
      this.isProcessing = false;
      return true;
    }

    if (type === 'extra_moves') {
      this.movesLeft += 5;
      this.callbacks.onMovesUpdate?.(this.movesLeft);
      return true;
    }

    if (type === 'color_bomb') {
      // Spawn a Color Bomb at random or center
      let r = targetRow ?? Math.floor(this.rows / 2);
      let c = targetCol ?? Math.floor(this.cols / 2);
      if (this.grid[r]?.[c]) {
        this.grid[r][c]!.special = 'color_bomb';
        this.callbacks.onComboEffect?.('Color Bomb Created', [{ row: r, col: c, reason: 'color_bomb' }]);
        return true;
      }
      return false;
    }

    if (type === 'shuffle') {
      this.shuffleBoard();
      return true;
    }

    return false;
  }

  /**
   * Reshuffles current board candies without resetting scores or moves
   */
  shuffleBoard(): void {
    const allCandies: CandyData[] = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c]) {
          allCandies.push(this.grid[r][c]!);
        }
      }
    }

    // Fisher-Yates shuffle
    for (let i = allCandies.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCandies[i], allCandies[j]] = [allCandies[j], allCandies[i]];
    }

    let idx = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const candy = allCandies[idx++];
        candy.row = r;
        candy.col = c;
        this.grid[r][c] = candy;
      }
    }

    this.callbacks.onComboEffect?.('Board Reshuffled!', []);
  }

  /**
   * Evaluates victory or failure conditions
   */
  private checkEndGameConditions(): void {
    const isComplete = LevelManager.isObjectiveComplete(
      this.levelConfig.objective,
      this.scoreManager.getScore(),
      this.totalCandiesCleared
    );

    if (isComplete) {
      // Calculate Sugar Crush bonus for leftover moves
      const bonus = ScoreManager.calculateSugarCrushBonus(this.movesLeft);
      this.scoreManager.addDirectPoints(bonus);
      const finalScore = this.scoreManager.getScore();
      const stars = ScoreManager.calculateStars(finalScore, this.levelConfig.targetScore);
      this.callbacks.onLevelComplete?.(Math.max(1, stars), finalScore);
    } else if (this.movesLeft <= 0) {
      this.callbacks.onLevelFailed?.(this.scoreManager.getScore());
    }
  }
}
