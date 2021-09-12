import { Enemy } from "./enemy";

export class WaveEnemy extends Enemy {
  startingX?: number;
  momentum = 0;
  isMovingLeft = false;
  speed = 0.75;

  constructor(gridPosition: number, colorNum: number, isMovingLeft?: boolean) {
    super(gridPosition, colorNum, [
      [17, 18, 19],
      [20, 21, 22],
      [23, 24, 25],
      [26, 27, 28],
    ][colorNum]);
    if (isMovingLeft) {
      this.isMovingLeft = isMovingLeft;
    }
  }

  update() {
    if (this.startingX === undefined) {
      this.startingX = this.position.x;
    }

    if ((this.position.x <= (this.startingX - 6)) && this.isMovingLeft) {
      this.isMovingLeft = false;
    }

    if ((this.position.x >= (this.startingX + 6)) && !this.isMovingLeft) {
      this.isMovingLeft = true;
    }

    this.momentum += (this.isMovingLeft ? -0.05 : 0.05);

    // Clamp horizontal speed to 1.5
    this.momentum = Math.min(Math.max(this.momentum, -1.3), 1.3);

    this.position.x += this.momentum;
    this.position.y += this.speed;
    super.update();
  }
}
