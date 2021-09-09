import {assetEngine} from "./core/asset-engine-instance";
import { Enemy } from "./enemies/enemy";

class Hud {
  private score = 0;
  healthPercent = 100;

  private lastColor = '#ffffff';
  private comboCount = 0;
  private comboChain = 0;
  private comboCountSizeMultiplier = 1.0;
  private comboChainSizeMultiplier = 1.0;

  resetCombo() {
    this.lastColor = '#ffffff';
    this.comboCount = 0;
    this.comboChain = 0;
  }

  update() {
    this.draw();
  }

  resetHealth() {
    this.healthPercent = 100;
  }

  resetScore() {
    this.score = 0;
  }

  takeHit(toDecreaseBy = 5) {
    this.healthPercent -= toDecreaseBy;
  }

  updateForEnemyKilled() {
    this.score += (10 * this.getComboMultiplier());
  }

  updateScore(scoreToAdd: number) {
    this.score += scoreToAdd;
  }

  getHighScore() {
    return parseInt(window.localStorage.getItem('sjm2594') || '', 10) || 0;
  }

  saveHighScore() {
    if (this.score > this.getHighScore()) {
      window.localStorage.setItem('sjm2594', this.score.toString());
    }
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
      if (!enemy.isMineAttached)
        this.comboCount++;
    }

    this.lastColor = enemy.color;
  }

  draw() {
    const context = assetEngine.drawEngine.getContext();

    context.save();
    context.fillStyle = 'red';
    context.fillRect(10, 1235, 294 * (this.healthPercent * .01), 30);
    context.strokeStyle = 'white';
    context.strokeRect(10, 1235, 294, 30);
    assetEngine.drawEngine.drawText('Earth Resistance Forces', 7, 39, 307);
    assetEngine.drawEngine.drawText(this.score.toString(10).padStart(15, '0'), 7, 200, 315);

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

export let hud: Hud;
export function initializeHud() {
  hud = new Hud();
}
