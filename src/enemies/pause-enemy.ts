import { Enemy } from "./enemy";
import { assetEngine } from "../core/asset-engine-instance";

export class PauseEnemy extends Enemy {
  pausedFor = 0;
  startingY?: number;
  speed = 0.8;

  constructor(gridPosition: number, colorNum: number) {
    super(gridPosition, colorNum, [
      [29, 30, 31, 32],
      [33, 34, 35, 36],
      [37, 38, 39, 40],
      [41, 42, 43, 44],
    ][colorNum]);
  }

  update() {
    if (this.startingY === undefined) {
      this.startingY = this.position.y;
    }

    if (this.position.y >= this.startingY + 270 && this.pausedFor < 10) {
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
