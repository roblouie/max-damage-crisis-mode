import { Enemy } from "./enemy";
import { EnemyPattern } from "./enemy-patterns/enemy-pattern";

export class BlueEnemy extends Enemy {
  constructor(x: number, y: number, enemyPattern: EnemyPattern) {
    super(x, y, 16, '#0000ff', enemyPattern);
  }
}
