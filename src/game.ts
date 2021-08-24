import { State } from "./core/state";
import { assetEngine } from "./core/asset-engine-instance";
import { backgroundManager } from "./background-manager";
import { Enemy } from "./enemies/enemy";
import { Player } from "./player/player";
import { Point } from "./core/point";
import { Level } from "./levels/level";
import { EnemyWave } from "./levels/enemy-wave";
import { RedEnemy } from "./enemies/red-enemy";
import { GreenEnemy } from "./enemies/green-enemy";
import { BlueEnemy } from "./enemies/blue-enemy";

export class Game implements State {
  player = new Player();
  currentLevel: Level;

  constructor() {
    const enemies = [new RedEnemy(40, -40), new GreenEnemy(200,-90), new BlueEnemy(100, -20)];
    const enemies2 = [new BlueEnemy(50, -60), new RedEnemy(100,-110), new GreenEnemy(150, -10)];
    const enemyWave = new EnemyWave(0, enemies);
    const enemyWave2 = new EnemyWave(3, enemies2);
    const level = new Level(0, 1, [enemyWave, enemyWave2]);
    this.currentLevel = level;
  }


  onEnter() {
    backgroundManager.loadBackgrounds(this.currentLevel.backgroundIndex);
    assetEngine.musicEngine.startSong(this.currentLevel.songIndex);
    this.player = new Player();
  }


  onLeave() {
  }

  onUpdate(): void {
    assetEngine.drawEngine.clearContext();
    backgroundManager.updateBackgrounds();

    this.currentLevel.update();
    this.currentLevel.activeEnemies.forEach(enemy => enemy.update());

    if (this.player.isJumping()) {
      this.currentLevel.activeEnemies.forEach(enemy => {
        if (enemy !== this.player.enemyAttachedTo && Point.DistanceBetweenTwo(enemy.position, this.player.getCenter()) <= enemy.size) {
          this.player.landOnEnemy(enemy);
        }
      });
    }

    this.player.update();
  }
}
