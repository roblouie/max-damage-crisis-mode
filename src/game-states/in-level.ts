import { State } from "../core/state";
import { assetEngine } from "../core/asset-engine-instance";
import { backgroundManager } from "../background-manager";
import { initializePlayer, player } from "../player/player";
import { Point } from "../core/point";
import { Level } from "../levels/level";
import { hud } from "../hud";
import {gameStateMachine} from "../game-state-machine";
import { comboEngine } from "../combo-engine";
import { satellite } from "../npcs/satellite";
import { controls } from "../core/controls";
import { debounce } from "../core/timing-helpers";
import { Enemy } from "../enemies/enemy";

export class InLevel implements State {
  currentLevel = new Level([]);
  levelNumber = 0;
  lastColor = '#ffffff';

  onEnter(levelNumber: number) {
    comboEngine.reset();
    backgroundManager.loadBackgrounds(0);
    assetEngine.musicEngine.startSong(1);
    hud.resetHealth();
    initializePlayer();
    this.currentLevel = assetEngine.levels[levelNumber];
    this.levelNumber = levelNumber;
    assetEngine.resetLevels();
  }

  onLeave() {
    controls.onClick(undefined);
    controls.onMouseMove(undefined);
    backgroundManager.updateBackgrounds();
  }

  onUpdate(): void {
    if (hud.healthPercent <= 0) {
      gameStateMachine.setState('game-over');
    }
    assetEngine.drawEngine.clearContext();
    backgroundManager.updateBackgrounds();
    assetEngine.effectEngine.update();

    this.currentLevel.update();

    if (player.isJumping()) {
      this.currentLevel.activeEnemies.forEach((enemy, index, enemies) => {
        // See if we should land on the enemy
        if (enemy !== player.enemyAttachedTo && enemy !== player.enemyJumpingFrom && !enemy.isDead && Point.DistanceBetweenTwo(enemy.getCenter(), player.getCenter()) <= player.getRadius() + enemy.getRadius()) {
          this.killMinedEnemies(enemy.color, enemies);

          // After marking other enemies as dead, we can land on this enemy and place a mine on it
          player.landOnEnemy(enemy);
          this.lastColor = enemy.color;
          enemy.isMineAttached = true;
          comboEngine.updateOnLand(enemy);
        }
      });
    }

    // If the player is still in a jumping state after checking collision against enemies, check if he collides with the
    // satellite. It's important that we check this separately because landing on enemies should always have priority.
    // You should only be able to land on a satellite if no enemies are around.
    if (!player.isLeavingSatellite && player.isJumping()) {
      if (Point.DistanceBetweenTwo(player.getCenter(), satellite.getCenter()) <= satellite.getRadius() + player.getRadius()) {
        player.landOnSatellite();
        this.killMinedEnemies('', this.currentLevel.activeEnemies);
      }
    }

    if (player.isRespawning()) {
      comboEngine.reset();
      this.currentLevel.activeEnemies.forEach(enemy => enemy.isMineAttached = false);
    }

    this.currentLevel.activeEnemies.forEach(enemy => {
      if (enemy.isOffScreen()) {
        enemy.isDead = true;
        hud.takeHit();
      }
    });

    this.currentLevel.activeEnemies = this.currentLevel.activeEnemies.filter(enemy => !enemy.isDead);

    if (this.currentLevel.isOver && player.isOnSatelite) {
      gameStateMachine.setState('end-of-level', this.levelNumber);
    }

    satellite.update();
    player.update();
    hud.update();
    comboEngine.update();
  }

  private killMinedEnemies(color: string, enemies: Enemy[]) {
    let minedEnemyCount = enemies.filter(enemy => enemy.isMineAttached).length;
    // If the landed on enemy is a different color, detonate any enemies with mines on them
    if (color !== this.lastColor) {
      enemies.forEach(enemy => {
        if (enemy.isMineAttached) {
          if (minedEnemyCount > 2) {
            enemy.isDead = true;
            assetEngine.effectEngine.addEffect(enemy.position, [22, 23, 24, 25, 26], 5, 25, 0.8, new Point(0, enemy.speed), 3, 0.01)
            debounce(() => assetEngine.sfxEngine.playEffect(0), 1);
            hud.updateForEnemyKilled();
            comboEngine.updateOnKill(enemy);
          } else {
            enemies.forEach(enemy => enemy.isMineAttached = false);
          }
        }
      })
    }
  }
}

export const inLevel = new InLevel();
