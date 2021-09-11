import { Enemy } from "./enemy";
import { assetEngine } from "../core/asset-engine-instance";

export class StraightEnemy extends Enemy {
  speed = 0.6;

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
    super.update();
  }
}
