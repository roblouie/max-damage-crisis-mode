import { Enemy } from "./enemies/enemy";
import { assetEngine } from "./core/asset-engine-instance";

export class ComboEngine {
  private lastColor = '#ffffff';
  private comboCount = 0;
  private comboChain = 0;
  private comboCountSizeMultiplier = 1.0;
  private comboChainSizeMultiplier = 1.0;

  reset() {
    this.lastColor = '#ffffff';
    this.comboCount = 0;
    this.comboChain = 0;
  }

  getComboMultiplier() {
    return ((this.comboChain + 1) * 10) * (this.comboCount || 1);
  }

  updateOnKill(enemyKilled: Enemy) {
    if (enemyKilled.color === this.lastColor) {
      this.comboCount++;
      this.comboCountSizeMultiplier = 1.3;
    }
  }

  updateOnLand(enemy: Enemy) {
    if (enemy.color !== this.lastColor) {
      if (this.comboCount > 2) {
        this.comboChain++;
        this.comboChainSizeMultiplier = 1.3;
      } else {
        this.comboChain = 0;
      }

      this.comboCount = 1;
    } else {
      this.comboCount++;
    }

    this.lastColor = enemy.color;
  }

  update() {
    const context = assetEngine.drawEngine.getContext();
    context.save();

    if (this.comboCountSizeMultiplier >= 1.0) {
      this.comboCountSizeMultiplier -= 0.05;
    }

    if (this.comboChainSizeMultiplier >= 1.0) {
      this.comboChainSizeMultiplier -= 0.05;
    }


    if (this.comboCount > -1) {
      assetEngine.drawEngine.drawText(this.comboCount + 'x', 14 * this.comboCountSizeMultiplier, 220, 300, this.lastColor);
      assetEngine.drawEngine.drawText('COMBO', 6 * this.comboCountSizeMultiplier, 220, 307, this.lastColor);
    }

    if (this.comboChain > -1) {
      assetEngine.drawEngine.drawText(this.comboChain + 'x', 14 * this.comboChainSizeMultiplier, 200, 300);
      assetEngine.drawEngine.drawText('CHAIN', 6 * this.comboChainSizeMultiplier, 200, 307);
    }

    context.restore();
  }
}

export const comboEngine = new ComboEngine();
