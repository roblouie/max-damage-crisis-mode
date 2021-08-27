import { Point } from "../../core/point";

export abstract class EnemyPattern {
  abstract update(enemyPosition: Point): Point;
}
