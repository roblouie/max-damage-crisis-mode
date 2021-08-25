import {assetEngine} from "./core/asset-engine-instance";

export class Hud {
  isShown = true;
  private score = 0;
  private top: number;
  private right: number;
  private height = 20;
  private meterTop: number;
  private meterLeft = 5;
  private meterHeight = 8;
  private meterWidth = 120
  healthPercent = 100;

  constructor() {
    const screenHeight = assetEngine.drawEngine.getHeight();
    const screenWidth = assetEngine.drawEngine.getScreenWidth();

    this.top = screenHeight - this.height;
    this.right = screenWidth;
    this.meterTop = this.top + 10;
  }

  update(score: number) {
    this.score = score;
    if (this.isShown) {
      this.draw();
    }
  }

  takeHit() {
    this.healthPercent -= 20;

  }

  draw() {
    const context = assetEngine.drawEngine.getContext();

    context.save();
    context.fillStyle = 'black';
    context.fillRect(0, this.top, this.right, this.height);
    context.fillStyle = 'red';
    context.fillRect(this.meterLeft, this.meterTop, this.meterWidth * (this.healthPercent * .01), this.meterHeight);
    context.strokeStyle = 'white';
    context.strokeRect(this.meterLeft, this.meterTop, this.meterWidth, this.meterHeight);
    context.fillStyle = 'white'
    context.fillText('Earth Resistance Forces', this.meterLeft + 14, this.meterTop - 2, this.meterWidth - 28);
    context.fillText(`Score: ${ this.score }`, 180, this.top + 15, 40)
    context.restore();
  }
}