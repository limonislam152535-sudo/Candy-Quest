import { CandyColor, SpecialType } from './Candy.js';

export class CandyTextures {
  /**
   * Generates a high-resolution 3D glossy candy texture on an HTML5 canvas.
   */
  static createCandyCanvas(
    color: CandyColor,
    special: SpecialType = 'none',
    size = 128
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const center = size / 2;
    const radius = size * 0.40;

    // Palette per candy color with deep shadows, midtones, and bright highlights
    const palettes: Record<CandyColor, { base: string; light: string; shadow: string; glow: string }> = {
      red: { base: '#ff2d55', light: '#ff758c', shadow: '#b30026', glow: 'rgba(255, 45, 85, 0.4)' },
      yellow: { base: '#ffcc00', light: '#ffea75', shadow: '#cc9900', glow: 'rgba(255, 204, 0, 0.4)' },
      orange: { base: '#ff8800', light: '#ffbb66', shadow: '#b35900', glow: 'rgba(255, 136, 0, 0.4)' },
      green: { base: '#28cd41', light: '#7be38c', shadow: '#1a8a2a', glow: 'rgba(40, 205, 65, 0.4)' },
      blue: { base: '#007aff', light: '#66b2ff', shadow: '#004fb3', glow: 'rgba(0, 122, 255, 0.4)' },
      purple: { base: '#af52de', light: '#d488f7', shadow: '#7722a3', glow: 'rgba(175, 82, 222, 0.4)' },
      pink: { base: '#ff5ea8', light: '#ffa3ce', shadow: '#b81d69', glow: 'rgba(255, 94, 168, 0.4)' }
    };

    const pal = palettes[color] || palettes.red;

    ctx.clearRect(0, 0, size, size);

    // 1. Soft ground shadow
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(center, center + radius * 0.75, radius * 0.8, radius * 0.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    ctx.filter = 'blur(4px)';
    ctx.fill();
    ctx.restore();

    // Special: Color Bomb (Rainbow truffle)
    if (special === 'color_bomb') {
      this.drawColorBomb(ctx, center, radius);
      return canvas;
    }

    // Special: Wrapped Candy Bows (behind body)
    if (special === 'wrapped') {
      this.drawWrapperBows(ctx, center, center, radius, pal.base, pal.light);
    }

    // 2. Base 3D Candy Shape with radial gradient
    ctx.save();
    const grad = ctx.createRadialGradient(
      center - radius * 0.3,
      center - radius * 0.35,
      radius * 0.1,
      center,
      center,
      radius
    );
    grad.addColorStop(0, pal.light);
    grad.addColorStop(0.55, pal.base);
    grad.addColorStop(1, pal.shadow);

    ctx.beginPath();
    // Unique rounded shapes for each color!
    if (color === 'red') {
      // Rounded glossy heart
      this.drawHeartPath(ctx, center, center, radius);
    } else if (color === 'yellow') {
      // Teardrop / lemon citrus drop
      this.drawTeardropPath(ctx, center, center, radius);
    } else if (color === 'orange') {
      // Round button swirl
      ctx.arc(center, center, radius, 0, Math.PI * 2);
    } else if (color === 'green') {
      // Rounded square pillow
      this.drawRoundedRect(ctx, center - radius * 0.85, center - radius * 0.85, radius * 1.7, radius * 1.7, radius * 0.45);
    } else if (color === 'blue') {
      // Glossy round orb / lozenge
      ctx.arc(center, center, radius, 0, Math.PI * 2);
    } else if (color === 'purple') {
      // 5-point puffy star
      this.drawPuffyStar(ctx, center, center, 5, radius * 1.05, radius * 0.65);
    } else {
      ctx.arc(center, center, radius, 0, Math.PI * 2);
    }

    ctx.fillStyle = grad;
    ctx.shadowColor = pal.shadow;
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    ctx.fill();
    ctx.restore();

    // 3. Inner ambient occlusion border
    ctx.save();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.stroke();
    ctx.restore();

    // 4. Striped Candy Energy Stripes
    if (special === 'striped_h') {
      this.drawHorizontalStripes(ctx, center, radius);
    } else if (special === 'striped_v') {
      this.drawVerticalStripes(ctx, center, radius);
    }

    // 5. 3D Glossy Specular Highlights (White pill gloss + bottom bounce reflection)
    ctx.save();
    // Top specular highlight pill
    ctx.beginPath();
    ctx.ellipse(
      center - radius * 0.28,
      center - radius * 0.38,
      radius * 0.42,
      radius * 0.20,
      -Math.PI / 6,
      0,
      Math.PI * 2
    );
    const specGrad = ctx.createLinearGradient(
      center - radius * 0.5,
      center - radius * 0.5,
      center,
      center - radius * 0.2
    );
    specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.88)');
    specGrad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
    ctx.fillStyle = specGrad;
    ctx.fill();

    // Secondary subtle bottom rim light
    ctx.beginPath();
    ctx.arc(center, center + radius * 0.55, radius * 0.4, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.stroke();

    ctx.restore();

    return canvas;
  }

  private static drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  private static drawHeartPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    ctx.beginPath();
    const topY = cy - r * 0.4;
    ctx.moveTo(cx, topY);
    ctx.bezierCurveTo(cx - r * 0.7, topY - r * 0.7, cx - r * 1.15, topY + r * 0.3, cx, cy + r * 0.95);
    ctx.bezierCurveTo(cx + r * 1.15, topY + r * 0.3, cx + r * 0.7, topY - r * 0.7, cx, topY);
    ctx.closePath();
  }

  private static drawTeardropPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.95);
    ctx.bezierCurveTo(cx + r * 0.95, cy - r * 0.1, cx + r * 0.95, cy + r * 0.9, cx, cy + r * 0.9);
    ctx.bezierCurveTo(cx - r * 0.95, cy + r * 0.9, cx - r * 0.95, cy - r * 0.1, cx, cy - r * 0.95);
    ctx.closePath();
  }

  private static drawPuffyStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerR: number,
    innerR: number
  ) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerR;
      y = cy + Math.sin(rot) * outerR;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerR;
      y = cy + Math.sin(rot) * innerR;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
  }

  private static drawHorizontalStripes(ctx: CanvasRenderingContext2D, center: number, radius: number) {
    ctx.save();
    ctx.clip();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    for (let y = center - radius * 0.8; y < center + radius * 0.8; y += radius * 0.45) {
      ctx.fillRect(center - radius, y, radius * 2, radius * 0.2);
    }
    ctx.restore();
  }

  private static drawVerticalStripes(ctx: CanvasRenderingContext2D, center: number, radius: number) {
    ctx.save();
    ctx.clip();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    for (let x = center - radius * 0.8; x < center + radius * 0.8; x += radius * 0.45) {
      ctx.fillRect(x, center - radius, radius * 0.2, radius * 2);
    }
    ctx.restore();
  }

  private static drawWrapperBows(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    baseColor: string,
    lightColor: string
  ) {
    ctx.save();
    ctx.fillStyle = lightColor;
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 2;

    // Left bow
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.6, cy);
    ctx.lineTo(cx - r * 1.25, cy - r * 0.45);
    ctx.lineTo(cx - r * 1.15, cy + r * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right bow
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.6, cy);
    ctx.lineTo(cx + r * 1.25, cy - r * 0.45);
    ctx.lineTo(cx + r * 1.15, cy + r * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private static drawColorBomb(ctx: CanvasRenderingContext2D, cx: number, r: number) {
    // Chocolate sphere with shiny rainbow sprinkles
    ctx.save();
    const grad = ctx.createRadialGradient(cx - r * 0.3, cx - r * 0.3, r * 0.1, cx, cx, r);
    grad.addColorStop(0, '#593822');
    grad.addColorStop(0.7, '#351f14');
    grad.addColorStop(1, '#1a0c07');

    ctx.beginPath();
    ctx.arc(cx, cx, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Rainbow sprinkles
    const sprinkleColors = ['#ff3366', '#ffcc00', '#33cc66', '#00aaff', '#9933ff', '#ff8800', '#ffffff'];
    const positions = [
      { x: -0.4, y: -0.3, rot: 0.3 },
      { x: 0.2, y: -0.5, rot: -0.4 },
      { x: -0.2, y: 0.2, rot: 0.8 },
      { x: 0.4, y: 0.1, rot: -0.2 },
      { x: -0.5, y: 0.1, rot: 0.5 },
      { x: 0.1, y: 0.5, rot: 1.1 },
      { x: -0.1, y: -0.6, rot: -0.7 },
      { x: 0.5, y: -0.2, rot: 0.4 }
    ];

    positions.forEach((p, idx) => {
      ctx.save();
      ctx.translate(cx + p.x * r, cx + p.y * r);
      ctx.rotate(p.rot);
      ctx.fillStyle = sprinkleColors[idx % sprinkleColors.length];
      this.drawRoundedRect(ctx, -r * 0.12, -r * 0.05, r * 0.24, r * 0.1, r * 0.04);
      ctx.fill();
      ctx.restore();
    });

    // White gloss highlight
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.3, cx - r * 0.35, r * 0.35, r * 0.18, -Math.PI / 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fill();

    ctx.restore();
  }
}
