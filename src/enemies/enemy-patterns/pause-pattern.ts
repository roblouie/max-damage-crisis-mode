import { EnemyPattern } from "./enemy-pattern";
import { Point } from "../../core/point";

export class PausePattern extends EnemyPattern {
  pausedFor = 0;
  startingY?: number;
  pauseTime: number;

  constructor(pauseTimeInSeconds = 10) {
    super();
    this.pauseTime = pauseTimeInSeconds;
  }

  update(enemyPosition: Point): Point {
    if (this.startingY === undefined) {
      this.startingY = enemyPosition.y;
    }

    if (enemyPosition.y >= this.startingY + 240 && this.pausedFor < 10) {
      this.pausedFor += 0.0167;
    } else {
      enemyPosition.y += 0.5;
    }
    return enemyPosition;
  }
}