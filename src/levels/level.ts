import { EnemyWave } from "./enemy-wave";
import { Enemy } from "../enemies/enemy";
import { animationFrameSequencer } from "../core/animation-frame-sequencer";

export class Level {
  backgroundIndex?: number;
  songIndex?: number;
  enemyWaves: EnemyWave[];
  mostRecentWaveIndex = -1;
  activeEnemies: Enemy[] = [];
  isOver = false;
  gameOverDeleay: Generator<boolean>;

  constructor(enemyWaves: EnemyWave[]) {
    this.enemyWaves = enemyWaves;
    this.gameOverDeleay = animationFrameSequencer([false, true], 40);
  }

  update() {
    this.activeEnemies.forEach(enemy => enemy.update());

    if (this.mostRecentWaveIndex === this.enemyWaves.length - 1) {
      if (this.activeEnemies.length === 0) {
        this.isOver = this.gameOverDeleay.next().value;
      }
      return;
    }

    const nextWave = this.enemyWaves[this.mostRecentWaveIndex + 1];
    if (this.activeEnemies.filter(enemy => enemy.isMineAttached && enemy.pos.y > enemy.size).length === this.activeEnemies.length) {
      this.mostRecentWaveIndex++;
      nextWave.enemies.forEach(enemy => enemy.pos.y -= 700);
      this.activeEnemies.push(...nextWave.enemies)
    }
  }
}
