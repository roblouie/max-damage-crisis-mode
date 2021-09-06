import { Enemy } from "./enemy";

export class ScreenEdgeBounceEnemy extends Enemy {
  momentum = 0;
  isMovingLeft = false;
  speed = 0.8;

  constructor(gridPosition: number, colorNum: number, isMovingLeft?: boolean) {
    super(gridPosition, 16, colorNum, [12]);
    if (isMovingLeft) {
      this.isMovingLeft = isMovingLeft;
    }
  }

  update() {
    if ((this.pos.x <= 16) && this.isMovingLeft) {
      this.isMovingLeft = false;
    }

    if (this.pos.x >= 220 && !this.isMovingLeft) {
      this.isMovingLeft = true;
    }

    this.momentum += (this.isMovingLeft ? -0.05 : 0.05);

    if (this.momentum > 0.5) {
      this.momentum = 0.5;
    }

    if (this.momentum < -0.5) {
      this.momentum = -0.5;
    }

    this.pos.x += this.momentum;

    this.pos.y += 0.8;
    super.update();
  }
}
