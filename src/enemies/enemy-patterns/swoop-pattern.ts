import { EnemyPattern } from "./enemy-pattern";
import { Point } from "../../core/point";

// swoops towards either the left side or right side of the screen
export class SwoopPattern extends EnemyPattern {
  constructor(private isSwoopingLeft = false) {
    super();
  }

  update(enemyPosition: Point): Point {
    if (enemyPosition.y > 80 && enemyPosition.x > 20 && enemyPosition.x < 208) {
      enemyPosition.x += (this.isSwoopingLeft ? -0.5 : 0.5);
    }
    enemyPosition.y += 0.5;
    return enemyPosition;
  }
}
