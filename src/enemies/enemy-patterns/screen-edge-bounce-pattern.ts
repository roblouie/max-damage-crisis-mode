//TODO: make pattern where enemy goes at an angle
import { EnemyPattern } from "./enemy-pattern";
import { Point } from "../../core/point";

// swoops towards either the left side or right side of the screen
export class ScreenEdgeBouncePattern extends EnemyPattern {
  momentum = 0;

  constructor(private isMovingLeft = false) {
    super();
  }

  update(enemyPosition: Point): Point {
    if ((enemyPosition.x <= 16) && this.isMovingLeft) {
      this.isMovingLeft = false;
    }

    if (enemyPosition.x >= 220 && !this.isMovingLeft) {
      this.isMovingLeft = true;
    }

    this.momentum += (this.isMovingLeft ? -0.05 : 0.05);

    if (this.momentum > 0.5) {
      this.momentum = 0.5;
    }

    if (this.momentum < -0.5) {
      this.momentum = -0.5;
    }

    enemyPosition.x += this.momentum;

    enemyPosition.y += 0.5;
    return enemyPosition;
  }
}
