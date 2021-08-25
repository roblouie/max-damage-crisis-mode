import {assetEngine} from "./core/asset-engine-instance";

export class Hud {
  isShown = true;
  private score = 0;
  private top: number;
  private right: number;
  private height = 40;
  private meterTop: number;
  private meterLeft = 5;
  private meterHeight = 14;
  private meterWidth = 200;
  healthPercent = 100;

  constructor() {
    const screenHeight = assetEngine.drawEngine.getHeight();
    const screenWidth = assetEngine.drawEngine.getScreenWidth();

    this.top = screenHeight - this.height;
    this.right = screenWidth;
    this.meterTop = this.top + 14;
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
    context.fillText('Earth Resistance Forces', this.meterLeft + 10, this.meterTop - 3, this.meterWidth);
    context.fillText(`Score: ${ this.score }`, 360, this.top + 15, 100)
    context.restore();
  }
}