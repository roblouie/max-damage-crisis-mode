import { Enemy } from "./enemy";

export class WaveEnemy extends Enemy {
  startingX?: number;
  momentum = 0;
  isMovingLeft = false;

  constructor(x: number, y: number, color: string, isMovingLeft?: boolean) {
    super(x, y, 16, color);
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
    this.position.y += 0.5;
    super.update();
  }
}
