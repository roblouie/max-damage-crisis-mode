import { EnemyWave } from "./enemy-wave";
import { Enemy } from "../enemies/enemy";

export class Level {
  backgroundIndex: number;
  songIndex: number;
  currentTimeIntoLevel = 0;
  enemyWaves: EnemyWave[];
  mostRecentWaveIndex = -1;
  activeEnemies: Enemy[] = [];

  constructor(backgroundIndex: number, songIndex: number, enemyWaves: EnemyWave[]) {
    this.backgroundIndex = backgroundIndex;
    this.songIndex = songIndex;
    this.enemyWaves = enemyWaves;
  }

  update() {
    this.activeEnemies.forEach(enemy => enemy.update());

    if (this.mostRecentWaveIndex === this.enemyWaves.length - 1) {
      return;
    }

    const nextWave = this.enemyWaves[this.mostRecentWaveIndex + 1];
    this.currentTimeIntoLevel+= 16.7;
    if (this.currentTimeIntoLevel / 1000 >= nextWave.getStartTimeInSeconds()) {
      this.mostRecentWaveIndex++;
      this.activeEnemies.push(...nextWave.getEnemies())
    }
  }
}