import { Enemy } from "./enemy";
import { assetEngine } from "../core/asset-engine-instance";

export class StraightEnemy extends Enemy {
  speed = 0.9;

  constructor(gridPosition: number, colorNum: number) {
    super(gridPosition, colorNum, [
      [5, 6, 7],
      [8, 9, 10],
      [11, 12, 13],
      [14, 15, 16],
    ][colorNum]);
  }

  update() {
    this.position.y += this.speed;
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
