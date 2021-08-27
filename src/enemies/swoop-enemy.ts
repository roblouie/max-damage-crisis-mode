import { Enemy } from "./enemy";

export class SwoopEnemy extends Enemy {
  isMovingLeft = false;

  constructor(x: number, y: number, color: string, isMovingLeft?: boolean) {
    super(x, y, 16, color);
    if (isMovingLeft) {
      this.isMovingLeft = isMovingLeft;
    }
  }

  update() {
    if (this.position.y > 80 && this.position.x > 20 && this.position.x < 208) {
      this.position.x += (this.isMovingLeft ? -0.5 : 0.5);
    }
    this.position.y += 0.5;
    super.update();
  }
}
