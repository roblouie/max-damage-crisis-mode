import { Enemy } from "./enemies/enemy";
import { assetEngine } from "./core/asset-engine-instance";

export class ComboEngine {
  private lastColor = '#ffffff';
  private comboCount = 0;
  private comboChain = 0;
  private comboCountSize = 25;
  private comboChainSize = 25;

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
      this.comboCountSize = 30;
    }
  }

  updateOnLand(enemy: Enemy) {
    if (enemy.color !== this.lastColor) {
      if (this.comboCount > 2) {
        this.comboChain++;
        this.comboChainSize = 30;
      }

      this.comboCount = 0;
    }

    this.lastColor = enemy.color;
  }

  update() {
    const context = assetEngine.drawEngine.getContext();
    context.save();

    if (this.comboChainSize !== 25) {
      this.comboChainSize -= 0.5;
    }

    if (this.comboCountSize !== 25) {
      this.comboCountSize -= 0.5;
    }


    if (this.comboCount > 0 || this.comboChain > 0) {
      assetEngine.drawEngine.drawText(this.comboCount + 'x', this.comboCountSize, this.lastColor, 400, 600);
    }

    if (this.comboChain > 0) {
      assetEngine.drawEngine.drawText(this.comboChain + 'x', this.comboChainSize, 'white', 360, 600);
    }

    context.restore();
  }
}

export const comboEngine = new ComboEngine();