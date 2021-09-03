import { Enemy } from "./enemy";

export class WaveEnemy extends Enemy {
  startingX?: number;
  momentum = 0;
  isMovingLeft = false;
  speed = 0.8;

  constructor(gridPosition: number, colorNum: number, isMovingLeft?: boolean) {
    super(gridPosition, 32, colorNum, [
      [7, 8, 9],
      [10, 11, 12],
      [13, 14, 15],
      [16, 17, 18],
    ][colorNum]);
    if (isMovingLeft) {
      this.isMovingLeft = isMovingLeft;
    }
  }

  update() {
    if (this.startingX === undefined) {
      this.startingX = this.position.x;
    }

    if ((this.position.x <= (this.startingX - 5)) && this.isMovingLeft) {
      this.isMovingLeft = false;
    }

    if ((this.position.x >= (this.startingX + 5)) && !this.isMovingLeft) {
      this.isMovingLeft = true;
    }

    this.momentum += (this.isMovingLeft ? -0.05 : 0.05);

    if (this.momentum > 1.5) {
      this.momentum = 1.5;
    }

    if (this.momentum < -1.5) {
      this.momentum = -1.5;
    }

    this.position.x += this.momentum;
    this.position.y += this.speed;
    super.update();
  }
}
