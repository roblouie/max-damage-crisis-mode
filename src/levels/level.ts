import { EnemyWave } from "./enemy-wave";
import { Enemy } from "../enemies/enemy";

export class Level {
  backgroundIndex?: number;
  songIndex?: number;
  enemyWaves: EnemyWave[];
  mostRecentWaveIndex = -1;
  activeEnemies: Enemy[] = [];
  isOver = false;

  constructor(enemyWaves: EnemyWave[]) {
    this.enemyWaves = enemyWaves;
  }

  reset() {
    this.mostRecentWaveIndex = -1;
  }

  update() {
    this.activeEnemies.forEach(enemy => enemy.update());

    if (this.mostRecentWaveIndex === this.enemyWaves.length - 1) {
      if (this.activeEnemies.length === 0) {
        this.isOver = true;
      }
      return;
    }

    const nextWave = this.enemyWaves[this.mostRecentWaveIndex + 1];
    if (this.activeEnemies.length <= 1) {
      this.mostRecentWaveIndex++;
      nextWave.enemies.forEach(enemy => enemy.position.y -= 576);
      this.activeEnemies.push(...nextWave.enemies)
    }
  }
}