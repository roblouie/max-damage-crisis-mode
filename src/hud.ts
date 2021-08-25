import {assetEngine} from "./core/asset-engine-instance";

export class Hud {
  private score = 0;
  private height = 20;
  private meterTop: number;
  private meterLeft = 10;
  private meterHeight = 15;
  private meterWidth = 147;
  healthPercent = 100;

  constructor() {
    const screenHeight = assetEngine.drawEngine.getHeight();
    this.meterTop = screenHeight - this.height;
  }

  update(score: number) {
    this.score = score;
    this.draw();
  }

  takeHit() {
    this.healthPercent -= 5;
  }

  draw() {
    const context = assetEngine.drawEngine.getContext();

    context.save();
    context.fillStyle = 'red';
    context.fillRect(this.meterLeft, this.meterTop, this.meterWidth * (this.healthPercent * .01), this.meterHeight);
    context.strokeStyle = 'white';
    context.strokeRect(this.meterLeft, this.meterTop, this.meterWidth, this.meterHeight);
    assetEngine.drawEngine.drawText('Earth Resistance Forces', 15, 'white', this.meterLeft, this.meterTop - 2);
    assetEngine.drawEngine.drawText(this.score.toString(10).padStart(10, '0'), 15, 'white', 390, this.meterTop + 15);
    context.restore();
  }
}