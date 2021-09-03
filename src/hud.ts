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
    return parseInt(window.localStorage.getItem('sjm2594') || '', 10) || 0;
  }

  saveHighScore() {
    if (this.score > this.getHighScore()) {
      window.localStorage.setItem('sjm2594', this.score.toString());
    }
  }

  draw() {
    const context = assetEngine.drawEngine.getContext();

    context.save();
    context.fillStyle = 'red';
    context.fillRect(this.meterLeft, this.meterTop, this.meterWidth * (this.healthPercent * .01), this.meterHeight);
    context.strokeStyle = 'white';
    context.strokeRect(this.meterLeft, this.meterTop, this.meterWidth, this.meterHeight);
    assetEngine.drawEngine.drawText('Earth Resistance Forces', 30, this.meterLeft, this.meterTop - 4);
    assetEngine.drawEngine.drawText(this.score.toString(10).padStart(15, '0'), 30,691, this.meterTop + 25);
    context.restore();
  }
}

export let hud: Hud;
export function initializeHud() {
  hud = new Hud();
}
