import { Enemy } from "./enemy";
import { EnemyPattern } from "./enemy-patterns/enemy-pattern";

export class GreenEnemy extends Enemy{
  constructor(x: number, y: number, enemyPattern: EnemyPattern) {
    super(x, y, 16, '#00ff00', enemyPattern);
  }
}
