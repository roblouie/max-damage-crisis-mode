import { State } from "../core/state";
import { assetEngine } from "../core/asset-engine-instance";
import { backgroundManager } from "../background-manager";
import { Player } from "../player/player";
import { Point } from "../core/point";
import { Level } from "../levels/level";
import { EnemyWave } from "../levels/enemy-wave";
import { RedEnemy } from "../enemies/red-enemy";
import { GreenEnemy } from "../enemies/green-enemy";
import { BlueEnemy } from "../enemies/blue-enemy";
import {Hud} from "../hud";
import {gameStateMachine} from "../game-state-machine";
import { comboEngine } from "../combo-engine";
import { satellite } from "../npcs/satellite";

export class Game implements State {
  player = new Player();
  currentLevel: Level;
  hud: Hud;
  score = 0;

  constructor() {
    const enemies = [new RedEnemy(80, -80), new GreenEnemy(100,-180), new BlueEnemy(200, -40)];
    const enemies2 = [new BlueEnemy(100, -120), new RedEnemy(200,-220), new GreenEnemy(150, -20)];
    const enemies3 = [new BlueEnemy(100, -120), new RedEnemy(200,-220), new GreenEnemy(150, -20)];
    const enemyWave = new EnemyWave(0, enemies);
    const enemyWave2 = new EnemyWave(2, enemies2);
    const enemyWave3 = new EnemyWave(4, enemies3);

    const level = new Level(0, 1, [enemyWave, enemyWave2, enemyWave3]);
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
        comboEngine.updateOnKill(this.player.enemyAttachedTo);
        this.player.enemyAttachedTo.isDead = true;
        this.player.enemyAttachedTo = undefined;
        this.score += (10 * comboEngine.getComboMultiplier());
      }

      this.currentLevel.activeEnemies.forEach(enemy => {
        if (enemy !== this.player.enemyAttachedTo && !enemy.isDead && Point.DistanceBetweenTwo(enemy.position, this.player.getCenter()) <= this.player.getRadius() + enemy.size) {
          this.player.landOnEnemy(enemy);
          comboEngine.updateOnLand(enemy);
        }
      });
    }

    // If the player is still in a jumping state after checking collision against enemies, check if he collides with the
    // satellite. It's important that we check this separately because landing on enemies should always have priority.
    // You should only be able to land on a satellite if no enemies are around.
    if (!this.player.isLeavingSatellite && this.player.isJumping()) {
      if (Point.DistanceBetweenTwo(this.player.getCenter(), satellite.getCenter()) <= satellite.getRadius() + this.player.getRadius()) {
        this.player.landOnSatellite();
      }
    }

    if (this.player.isRespawning()) {
      comboEngine.reset();
    }

    this.currentLevel.activeEnemies.forEach(enemy => {
      if (enemy.isOffScreen()) {
        enemy.isDead = true;
        this.hud.takeHit();
      }
    })


    this.currentLevel.activeEnemies = this.currentLevel.activeEnemies.filter(enemy => !enemy.isDead);

    satellite.update();
    this.player.update();
    this.hud.update(this.score);
    comboEngine.update();
  }
}
