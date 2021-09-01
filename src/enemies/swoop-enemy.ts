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
    if (this.position.y > 80 && this.position.x > 20 && this.position.x < 208) {
      this.position.x += (this.isMovingLeft ? -0.5 : 0.5);
    }
    this.position.y += this.speed;
    super.update();
  }
}
