import { CandyColor, SpecialType } from './Candy.js';
import { GridCell } from './MatchDetector.js';

export interface AffectedCell {
  row: number;
  col: number;
  reason: 'match' | 'striped_h' | 'striped_v' | 'wrapped' | 'color_bomb' | 'combo';
}

export class SpecialCandyManager {
  /**
   * Calculates all cells cleared when a single special candy is activated.
   */
  static getSpecialExplosionCells(
    special: SpecialType,
    row: number,
    col: number,
    targetColor: CandyColor | null,
    grid: (GridCell | null)[][]
  ): AffectedCell[] {
    const rows = grid.length;
    const cols = grid[0].length;
    const affected: AffectedCell[] = [];
    const visited = new Set<string>();

    const addCell = (r: number, c: number, reason: AffectedCell['reason']) => {
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        const key = `${r},${c}`;
        if (!visited.has(key)) {
          visited.add(key);
          affected.push({ row: r, col: c, reason });
        }
      }
    };

    if (special === 'striped_h') {
      // Clear entire row
      for (let c = 0; c < cols; c++) {
        addCell(row, c, 'striped_h');
      }
    } else if (special === 'striped_v') {
      // Clear entire column
      for (let r = 0; r < rows; r++) {
        addCell(r, col, 'striped_v');
      }
    } else if (special === 'wrapped') {
      // 3x3 explosion centered at (row, col)
      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          addCell(r, c, 'wrapped');
        }
      }
    } else if (special === 'color_bomb' && targetColor) {
      // Clear all candies matching targetColor
      addCell(row, col, 'color_bomb');
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grid[r][c]?.color === targetColor) {
            addCell(r, c, 'color_bomb');
          }
        }
      }
    }

    return affected;
  }

  /**
   * Calculates special combination effect when two special candies are swapped together.
   */
  static getSpecialComboCells(
    cell1: { row: number; col: number; special: SpecialType; color: CandyColor },
    cell2: { row: number; col: number; special: SpecialType; color: CandyColor },
    grid: (GridCell | null)[][]
  ): { affected: AffectedCell[]; comboName: string } {
    const rows = grid.length;
    const cols = grid[0].length;
    const affected: AffectedCell[] = [];
    const visited = new Set<string>();

    const addCell = (r: number, c: number, reason: AffectedCell['reason']) => {
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        const key = `${r},${c}`;
        if (!visited.has(key)) {
          visited.add(key);
          affected.push({ row: r, col: c, reason });
        }
      }
    };

    const s1 = cell1.special;
    const s2 = cell2.special;

    // 1. Color Bomb + Color Bomb: Clears the whole board!
    if (s1 === 'color_bomb' && s2 === 'color_bomb') {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          addCell(r, c, 'combo');
        }
      }
      return { affected, comboName: 'Double Rainbow Wipeout' };
    }

    // 2. Color Bomb + Striped or Wrapped
    if (s1 === 'color_bomb' || s2 === 'color_bomb') {
      const other = s1 === 'color_bomb' ? cell2 : cell1;
      // All of other's color turn into special and detonate
      addCell(cell1.row, cell1.col, 'combo');
      addCell(cell2.row, cell2.col, 'combo');
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grid[r][c]?.color === other.color) {
            // Clears their row or column
            if (other.special === 'striped_h' || other.special === 'striped_v') {
              for (let cc = 0; cc < cols; cc++) addCell(r, cc, 'striped_h');
              for (let rr = 0; rr < rows; rr++) addCell(rr, c, 'striped_v');
            } else {
              // Wrapped 3x3
              for (let rr = r - 1; rr <= r + 1; rr++) {
                for (let cc = c - 1; cc <= c + 1; cc++) {
                  addCell(rr, cc, 'wrapped');
                }
              }
            }
          }
        }
      }
      return { affected, comboName: 'Rainbow Blast Extravaganza' };
    }

    // 3. Striped + Striped: Clears both row and column (Cross Beam)
    if (
      (s1 === 'striped_h' || s1 === 'striped_v') &&
      (s2 === 'striped_h' || s2 === 'striped_v')
    ) {
      const centerR = cell2.row;
      const centerC = cell2.col;
      for (let c = 0; c < cols; c++) addCell(centerR, c, 'combo');
      for (let r = 0; r < rows; r++) addCell(r, centerC, 'combo');
      return { affected, comboName: 'Cross Stripe Blaster' };
    }

    // 4. Wrapped + Striped: Giant 3-row & 3-column cross!
    if (
      (s1 === 'wrapped' && (s2 === 'striped_h' || s2 === 'striped_v')) ||
      (s2 === 'wrapped' && (s1 === 'striped_h' || s1 === 'striped_v'))
    ) {
      const centerR = cell2.row;
      const centerC = cell2.col;
      for (let dr = -1; dr <= 1; dr++) {
        for (let c = 0; c < cols; c++) addCell(centerR + dr, c, 'combo');
      }
      for (let dc = -1; dc <= 1; dc++) {
        for (let r = 0; r < rows; r++) addCell(r, centerC + dc, 'combo');
      }
      return { affected, comboName: 'Mega Striped Bomb' };
    }

    // 5. Wrapped + Wrapped: 5x5 Mega explosion!
    if (s1 === 'wrapped' && s2 === 'wrapped') {
      const centerR = cell2.row;
      const centerC = cell2.col;
      for (let r = centerR - 2; r <= centerR + 2; r++) {
        for (let c = centerC - 2; c <= centerC + 2; c++) {
          addCell(r, c, 'combo');
        }
      }
      return { affected, comboName: 'Double Wrapped Supernova' };
    }

    return { affected, comboName: 'Special Combo' };
  }
}
