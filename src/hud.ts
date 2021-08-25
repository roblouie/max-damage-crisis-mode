import {assetEngine} from "./core/asset-engine-instance";

export class Hud {
  private score = 0;
  private height = 45;
  private meterTop: number;
  private meterLeft = 10;
  private meterHeight = 30;
  private meterWidth = 294;
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
    assetEngine.drawEngine.drawText('Earth Resistance Forces', 30, 'white', this.meterLeft, this.meterTop - 4);
    assetEngine.drawEngine.drawText(this.score.toString(10).padStart(15, '0'), 30, 'white', 691, this.meterTop + 25);
    context.restore();
  }
}