import { Enemy } from "./enemy";

export class ScreenEdgeBounceEnemy extends Enemy {
  momentum = 0;
  isMovingLeft = false;

  constructor(x: number, y: number, color: string, isMovingLeft?: boolean) {
    super(x, y, 16, color);
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

    this.position.y += 0.5;
    super.update();
  }
}
