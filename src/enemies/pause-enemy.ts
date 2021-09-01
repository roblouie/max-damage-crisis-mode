import { Enemy } from "./enemy";
import { assetEngine } from "../core/asset-engine-instance";

export class PauseEnemy extends Enemy {
  pausedFor = 0;
  startingY?: number;
  speed = 0.8;

  constructor(gridPosition: number, colorNum: number) {
    super(gridPosition, 32, colorNum, [
      [7, 8, 9],
      [10, 11, 12],
      [13, 14, 15],
      [16, 17, 18],
    ][colorNum]);
  }

  update() {
    if (this.startingY === undefined) {
      this.startingY = this.position.y;
    }

    if (this.position.y >= this.startingY + 320 && this.pausedFor < 10) {
      this.pausedFor += 0.0167;
    } else {
      this.position.y += this.speed;
    }
    // const context = assetEngine.drawEngine.getContext();
    // context.save();
    // context.fillStyle = this.color;
    // context.beginPath();
    // context.scale(4, 4);
    // context.arc(this.getCenter().x, this.getCenter().y, this.getRadius(), 0, 2 * Math.PI);
    // context.stroke();
    // context.fill();
    // context.restore();
    super.update();
  }
}
