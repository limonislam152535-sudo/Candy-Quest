import { CandyColor, SpecialType } from './Candy.js';

export interface GridCell {
  color: CandyColor | null;
  special?: SpecialType;
  row?: number;
  col?: number;
}

export interface MatchResult {
  matchedCells: { row: number; col: number }[];
  specialCreated?: {
    row: number;
    col: number;
    special: SpecialType;
    color: CandyColor;
  };
}

export class MatchDetector {
  /**
   * Scans an 8x8 (or NxM) board grid for matches of 3 or more.
   * Returns all matched cell coordinates and any special candies to create.
   */
  static findMatches(
    grid: (GridCell | null)[][],
    preferredSpawnCell?: { row: number; col: number; swapDir?: 'horizontal' | 'vertical' }
  ): MatchResult[] {
    const rows = grid.length;
    if (rows === 0) return [];
    const cols = grid[0].length;

    // Detect horizontal runs
    const horizRuns: { row: number; startCol: number; length: number; color: CandyColor }[] = [];
    for (let r = 0; r < rows; r++) {
      let runStart = 0;
      let runColor = grid[r][0]?.color || null;
      let runLen = 1;

      for (let c = 1; c <= cols; c++) {
        const curColor = c < cols ? grid[r][c]?.color || null : null;
        if (curColor && curColor === runColor) {
          runLen++;
        } else {
          if (runColor && runLen >= 3) {
            horizRuns.push({ row: r, startCol: runStart, length: runLen, color: runColor });
          }
          runStart = c;
          runColor = curColor;
          runLen = 1;
        }
      }
    }

    // Detect vertical runs
    const vertRuns: { col: number; startRow: number; length: number; color: CandyColor }[] = [];
    for (let c = 0; c < cols; c++) {
      let runStart = 0;
      let runColor = grid[0][c]?.color || null;
      let runLen = 1;

      for (let r = 1; r <= rows; r++) {
        const curColor = r < rows ? grid[r][c]?.color || null : null;
        if (curColor && curColor === runColor) {
          runLen++;
        } else {
          if (runColor && runLen >= 3) {
            vertRuns.push({ col: c, startRow: runStart, length: runLen, color: runColor });
          }
          runStart = r;
          runColor = curColor;
          runLen = 1;
        }
      }
    }

    if (horizRuns.length === 0 && vertRuns.length === 0) {
      return [];
    }

    // Map cells to matches
    const matchedCoordSet = new Set<string>();
    const horizCells: { row: number; col: number; color: CandyColor; len: number }[] = [];
    const vertCells: { row: number; col: number; color: CandyColor; len: number }[] = [];

    for (const h of horizRuns) {
      for (let c = h.startCol; c < h.startCol + h.length; c++) {
        matchedCoordSet.add(`${h.row},${c}`);
        horizCells.push({ row: h.row, col: c, color: h.color, len: h.length });
      }
    }

    for (const v of vertRuns) {
      for (let r = v.startRow; r < v.startRow + v.length; r++) {
        matchedCoordSet.add(`${r},${v.col}`);
        vertCells.push({ row: r, col: v.col, color: v.color, len: v.length });
      }
    }

    // Check for intersections: L or T shapes -> Wrapped Candy
    const intersections: { row: number; col: number; color: CandyColor }[] = [];
    for (const h of horizRuns) {
      for (const v of vertRuns) {
        if (h.color === v.color) {
          if (v.col >= h.startCol && v.col < h.startCol + h.length &&
              h.row >= v.startRow && h.row < v.startRow + v.length) {
            intersections.push({ row: h.row, col: v.col, color: h.color });
          }
        }
      }
    }

    const matchedCells = Array.from(matchedCoordSet).map(s => {
      const [r, c] = s.split(',').map(Number);
      return { row: r, col: c };
    });

    let specialCreated: MatchResult['specialCreated'] = undefined;

    // Determine special candy creation priority:
    // 1. 5 in a row -> Color Bomb
    const fiveRun = horizRuns.find(h => h.length >= 5) || vertRuns.find(v => v.length >= 5);
    if (fiveRun) {
      let spawnRow = 0;
      let spawnCol = 0;
      if ('startCol' in fiveRun) {
        spawnRow = fiveRun.row;
        spawnCol = preferredSpawnCell && preferredSpawnCell.row === spawnRow &&
                   preferredSpawnCell.col >= fiveRun.startCol && preferredSpawnCell.col < fiveRun.startCol + fiveRun.length
                   ? preferredSpawnCell.col
                   : fiveRun.startCol + 2;
      } else {
        spawnCol = fiveRun.col;
        spawnRow = preferredSpawnCell && preferredSpawnCell.col === spawnCol &&
                   preferredSpawnCell.row >= fiveRun.startRow && preferredSpawnCell.row < fiveRun.startRow + fiveRun.length
                   ? preferredSpawnCell.row
                   : fiveRun.startRow + 2;
      }
      specialCreated = {
        row: spawnRow,
        col: spawnCol,
        special: 'color_bomb',
        color: fiveRun.color
      };
    } else if (intersections.length > 0) {
      // 2. Intersection -> Wrapped Candy
      const inter = intersections[0];
      specialCreated = {
        row: inter.row,
        col: inter.col,
        special: 'wrapped',
        color: inter.color
      };
    } else {
      // 3. 4 in a row -> Striped Candy
      const fourHoriz = horizRuns.find(h => h.length === 4);
      const fourVert = vertRuns.find(v => v.length === 4);

      if (fourHoriz) {
        const spawnCol = preferredSpawnCell && preferredSpawnCell.row === fourHoriz.row &&
                         preferredSpawnCell.col >= fourHoriz.startCol && preferredSpawnCell.col < fourHoriz.startCol + 4
                         ? preferredSpawnCell.col
                         : fourHoriz.startCol + 1;
        specialCreated = {
          row: fourHoriz.row,
          col: spawnCol,
          special: 'striped_v', // clears column across horizontal match
          color: fourHoriz.color
        };
      } else if (fourVert) {
        const spawnRow = preferredSpawnCell && preferredSpawnCell.col === fourVert.col &&
                         preferredSpawnCell.row >= fourVert.startRow && preferredSpawnCell.row < fourVert.startRow + 4
                         ? preferredSpawnCell.row
                         : fourVert.startRow + 1;
        specialCreated = {
          row: spawnRow,
          col: fourVert.col,
          special: 'striped_h', // clears row across vertical match
          color: fourVert.color
        };
      }
    }

    return [{ matchedCells, specialCreated }];
  }

  /**
   * Tests if swapping (r1, c1) and (r2, c2) creates any matches or special activations.
   */
  static isValidSwap(
    grid: (GridCell | null)[][],
    r1: number,
    c1: number,
    r2: number,
    c2: number
  ): boolean {
    const rows = grid.length;
    const cols = grid[0].length;
    if (r1 < 0 || r1 >= rows || c1 < 0 || c1 >= cols) return false;
    if (r2 < 0 || r2 >= rows || c2 < 0 || c2 >= cols) return false;

    // Must be adjacent (manhattan distance = 1)
    const dist = Math.abs(r1 - r2) + Math.abs(c1 - c2);
    if (dist !== 1) return false;

    const cell1 = grid[r1][c1];
    const cell2 = grid[r2][c2];
    if (!cell1 || !cell2) return false;

    // If either is a color bomb, any swap with another candy is valid!
    if (cell1.special === 'color_bomb' || cell2.special === 'color_bomb') {
      return true;
    }

    // If both are special, swapping them produces a special combo!
    if (cell1.special && cell1.special !== 'none' && cell2.special && cell2.special !== 'none') {
      return true;
    }

    // Temporary swap in a clone grid
    const clone: (GridCell | null)[][] = grid.map(row => row.map(cell => cell ? { ...cell } : null));
    clone[r1][c1] = grid[r2][c2];
    clone[r2][c2] = grid[r1][c1];

    const matches = this.findMatches(clone);
    return matches.length > 0 && matches[0].matchedCells.length > 0;
  }

  /**
   * Finds all possible legal moves currently available on the board.
   */
  static findLegalMoves(grid: (GridCell | null)[][]): { r1: number; c1: number; r2: number; c2: number }[] {
    const rows = grid.length;
    const cols = grid[0].length;
    const moves: { r1: number; c1: number; r2: number; c2: number }[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Try swap right
        if (c + 1 < cols && this.isValidSwap(grid, r, c, r, c + 1)) {
          moves.push({ r1: r, c1: c, r2: r, c2: c + 1 });
        }
        // Try swap down
        if (r + 1 < rows && this.isValidSwap(grid, r, c, r + 1, c)) {
          moves.push({ r1: r, c1: c, r2: r + 1, c2: c });
        }
      }
    }

    return moves;
  }
}
