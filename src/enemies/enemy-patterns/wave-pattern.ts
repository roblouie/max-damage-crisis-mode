import { EnemyPattern } from "./enemy-pattern";
import { Point } from "../../core/point";

export class WavePattern extends EnemyPattern {
  startingX?: number;
  momentum = 0;
  isMovingLeft = false;

  constructor(isStartingLeft = false) {
    super();
    this.isMovingLeft = isStartingLeft;
  }

  update(enemyPosition: Point): Point {
    if (this.startingX === undefined) {
      this.startingX = enemyPosition.x;
    }

    if ((enemyPosition.x <= (this.startingX - 5)) && this.isMovingLeft) {
      this.isMovingLeft = false;
    }

    if ((enemyPosition.x >= (this.startingX + 5)) && !this.isMovingLeft) {
     this.isMovingLeft = true;
    }

    this.momentum += (this.isMovingLeft ? -0.05 : 0.05);

    if (this.momentum > 1.5) {
      this.momentum = 1.5;
    }

    if (this.momentum < -1.5) {
      this.momentum = -1.5;
    }

    enemyPosition.x += this.momentum;
    enemyPosition.y += 0.5;
    return enemyPosition;
  }
}