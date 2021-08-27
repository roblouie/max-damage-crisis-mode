import { Enemy } from "./enemy";
import { EnemyPattern } from "./enemy-patterns/enemy-pattern";

export class RedEnemy extends Enemy {
  constructor(x: number, y: number, enemyPattern: EnemyPattern) {
    super(x, y, 16, '#ff0000', enemyPattern);
  }
}
