import { Enemy } from "./enemy";

export class SwoopEnemy extends Enemy {
  isMovingLeft = false;
  speed = 0.8;

  constructor(gridPosition: number, colorNum: number, isMovingLeft?: boolean) {
    super(gridPosition, 16, colorNum ,[12]);
    if (isMovingLeft) {
      this.isMovingLeft = isMovingLeft;
    }
  }

  update() {
    if (this.pos.y > 80 && this.pos.x > 20 && this.pos.x < 208) {
      this.pos.x += (this.isMovingLeft ? -0.5 : 0.5);
    }
    this.pos.y += this.speed;
    super.update();
  }
}
