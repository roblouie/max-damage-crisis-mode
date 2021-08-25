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
import {Hud} from "./hud";
import {gameStateMachine} from "./game-state-machine";

export class Game implements State {
  player = new Player();
  currentLevel: Level;
  hud: Hud;
  score = 0;

  constructor() {
    const enemies = [new RedEnemy(40, -40), new GreenEnemy(200,-90), new BlueEnemy(100, -20)];
    const enemies2 = [new BlueEnemy(50, -60), new RedEnemy(100,-110), new GreenEnemy(150, -10)];
    const enemyWave = new EnemyWave(0, enemies);
    const enemyWave2 = new EnemyWave(3, enemies2);
    const level = new Level(0, 1, [enemyWave, enemyWave2]);
    this.currentLevel = level;
    this.hud = new Hud();
  }


  onEnter() {
    backgroundManager.loadBackgrounds(this.currentLevel.backgroundIndex);
    assetEngine.musicEngine.startSong(this.currentLevel.songIndex);
    this.player = new Player();
  }


  onLeave() {
  }

  onUpdate(): void {
    if (this.hud.healthPercent <= 0) {
      gameStateMachine.setState('game-over');
    }
    assetEngine.drawEngine.clearContext();
    backgroundManager.updateBackgrounds();

    this.currentLevel.update();
    this.currentLevel.activeEnemies.forEach(enemy => enemy.update());

    if (this.player.isJumping()) {
      if (this.player.enemyAttachedTo) {
        this.player.enemyAttachedTo.isDead = true;
        this.player.enemyAttachedTo = undefined;
        this.score += 1;
      }
      this.currentLevel.activeEnemies.forEach(enemy => {
        if (enemy !== this.player.enemyAttachedTo && !enemy.isDead && Point.DistanceBetweenTwo(enemy.position, this.player.getCenter()) <= enemy.size) {
          this.player.landOnEnemy(enemy);
        }
      });
    }

    this.currentLevel.activeEnemies.forEach(enemy => {
      if (enemy.isEnemyOffScreen()) {
        enemy.isDead = true;
        this.hud.takeHit();
      }
    })


    this.currentLevel.activeEnemies = this.currentLevel.activeEnemies.filter(enemy => !enemy.isDead);

    this.player.update();
    this.hud.update(this.score);
  }
}
