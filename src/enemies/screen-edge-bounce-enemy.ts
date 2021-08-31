import { Enemy } from "./enemy";

export class ScreenEdgeBounceEnemy extends Enemy {
  momentum = 0;
  isMovingLeft = false;

  constructor(gridPosition: number, colorNum: number, isMovingLeft?: boolean) {
    super(gridPosition, 16, colorNum, [12]);
    if (isMovingLeft) {
      this.isMovingLeft = isMovingLeft;
    }
  }

  update() {
    if ((this.position.x <= 16) && this.isMovingLeft) {
      this.isMovingLeft = false;
    }

    if (this.position.x >= 220 && !this.isMovingLeft) {
      this.isMovingLeft = true;
    }

    this.momentum += (this.isMovingLeft ? -0.05 : 0.05);

    if (this.momentum > 0.5) {
      this.momentum = 0.5;
    }

    if (this.momentum < -0.5) {
      this.momentum = -0.5;
    }

    this.position.x += this.momentum;

    this.position.y += 0.8;
    super.update();
  }
}
