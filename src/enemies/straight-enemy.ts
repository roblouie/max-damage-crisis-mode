import { Enemy } from "./enemy";
import { assetEngine } from "../core/asset-engine-instance";

export class StraightEnemy extends Enemy {
  speed = 0.9;

  constructor(gridPosition: number, colorNum: number) {
    super(gridPosition, 32, colorNum, [
      [7, 8, 9],
      [10, 11, 12],
      [13, 14, 15],
      [16, 17, 18],
    ][colorNum]);
  }

  update() {
    this.pos.y += this.speed;
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
