import { EnemyPattern } from "./enemy-pattern";
import { Point } from "../../core/point";

export class StraightPattern extends EnemyPattern {
  update(enemyPosition: Point): Point {
    enemyPosition.y += 0.5;
    return enemyPosition;
  }
}
