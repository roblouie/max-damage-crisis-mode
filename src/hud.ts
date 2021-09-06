import {assetEngine} from "./core/asset-engine-instance";
import { comboEngine } from "./combo-engine";

class Hud {
  private score = 0;
  private height = 45;
  private meterTop: number;
  private meterLeft = 10;
  private meterHeight = 30;
  private meterWidth = 294;
  healthPercent = 100;

  constructor() {
    const screenHeight = assetEngine.drawEngine.getScreenHeight();
    this.meterTop = screenHeight - this.height;
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
    this.score += (10 * comboEngine.getComboMultiplier());
  }

  updateScore(scoreToAdd: number) {
    this.score += scoreToAdd;
  }

  getHighScore() {
    // @ts-ignore
    return +window.localStorage.getItem('sjm2594') || 0;
  }

  saveHighScore() {
    if (this.score > this.getHighScore()) {
      // @ts-ignore
      window.localStorage.setItem('sjm2594', this.score);
    }
  }

  draw() {
    const context = assetEngine.drawEngine.getContext();

    context.save();
    context.fillStyle = 'red';
    context.fillRect(this.meterLeft, this.meterTop, this.meterWidth * (this.healthPercent * .01), this.meterHeight);
    context.strokeStyle = 'white';
    context.strokeRect(this.meterLeft, this.meterTop, this.meterWidth, this.meterHeight);
    assetEngine.drawEngine.drawText('Earth Resistance Forces', 30, 39, 307);
    // @ts-ignore
    assetEngine.drawEngine.drawText((''+this.score).padStart(15, '0'), 30,200, 315);
    context.restore();
  }
}

export let hud: Hud;
export function initializeHud() {
  hud = new Hud();
}
