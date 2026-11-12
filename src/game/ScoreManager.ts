export class ScoreManager {
  private currentScore = 0;
  private currentCombo = 1;

  constructor(initialScore = 0) {
    this.currentScore = initialScore;
    this.currentCombo = 1;
  }

  getScore(): number {
    return this.currentScore;
  }

  getCombo(): number {
    return this.currentCombo;
  }

  resetCombo(): void {
    this.currentCombo = 1;
  }

  incrementCombo(): void {
    this.currentCombo++;
  }

  addMatchScore(count: number, specialBonus = 0): number {
    // Base points: 20 for 3, 30 each for 4, 40 each for 5+
    let perCandy = 20;
    if (count === 4) perCandy = 30;
    if (count >= 5) perCandy = 40;

    const basePoints = count * perCandy + specialBonus;
    const multiplier = 1 + (this.currentCombo - 1) * 0.5;
    const points = Math.round(basePoints * multiplier);

    this.currentScore += points;
    return points;
  }

  addDirectPoints(pts: number): void {
    this.currentScore += pts;
  }

  reset(): void {
    this.currentScore = 0;
    this.currentCombo = 1;
  }

  /**
   * Calculates star rating (1, 2, or 3) against target score.
   */
  static calculateStars(score: number, targetScore: number): number {
    if (score < targetScore) return 0;
    if (score >= targetScore * 2.0) return 3;
    if (score >= targetScore * 1.4) return 2;
    return 1;
  }

  /**
   * Sugar Crush bonus for leftover moves
   */
  static calculateSugarCrushBonus(movesLeft: number): number {
    return Math.max(0, movesLeft) * 500;
  }
}
