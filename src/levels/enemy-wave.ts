import { Enemy } from "../enemies/enemy";

export class EnemyWave {
  constructor(private startTimeInSeconds: number, private enemies: Enemy[]) {}

  getEnemies(): Enemy[] {
    return this.enemies;
  }

  getStartTimeInSeconds(): number {
    return this.startTimeInSeconds;
  }
}
