import { State } from "../core/state";
import { assetEngine } from "../core/asset-engine-instance";
import { backgroundManager } from "../background-manager";
import { initializePlayer, player } from "../player/player";
import { Point } from "../core/point";
import { Level } from "../levels/level";
import { hud } from "../hud";
import {gameStateMachine} from "../game-state-machine";
import { satellite } from "../npcs/satellite";
import { controls } from "../core/controls";
import { debounce } from "../core/timing-helpers";
import { Enemy } from "../enemies/enemy";

export class InLevel implements State {
  currentLevel = new Level([]);
  levelNumber = 0;
  lastColor = '#ffffff';

  onEnter(levelNumber: number) {
    hud.resetCombo();
    backgroundManager.loadBackgrounds(Math.floor(levelNumber / 3));
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

    this.currentLevel.update();

    if (player.isJumping()) {
      this.currentLevel.activeEnemies.forEach((enemy, index, enemies) => {
        // See if we should land on the enemy
        if (enemy !== player.enemyAttachedTo && enemy !== player.enemyJumpingFrom && !enemy.isDead && Point.DistanceBetweenTwo(enemy.getCenter(), player.getCenter()) <= player.radius + enemy.radius) {
          this.killMinedEnemies(enemy.color, enemies);

          // After marking other enemies as dead, we can land on this enemy and place a mine on it
          player.landOnEnemy(enemy);
          this.lastColor = enemy.color;
          enemy.isMineAttached = true;
          const enemiesToActivate = enemies.filter(enemy => enemy.isMineAttached && !enemy.isDead);
          if (enemiesToActivate.length >= 3) {
            enemiesToActivate.forEach(enemy => enemy.isMineActivated = true);
            assetEngine.sfxEngine.playEffect(5);
          }
          hud.updateOnLand(enemy);
        }
      });
    }

    // If the player is still in a jumping state after checking collision against enemies, check if he collides with the
    // satellite. It's important that we check this separately because landing on enemies should always have priority.
    // You should only be able to land on a satellite if no enemies are around.
    if (!player.isLeavingSatellite && player.isJumping()) {
      if (Point.DistanceBetweenTwo(player.getCenter(), satellite.getCenter()) <= satellite.getRadius() + player.radius) {
        player.landOnSatellite();
        this.killMinedEnemies('', this.currentLevel.activeEnemies);
      }
    }

    if (player.isRespawning()) {
      hud.resetCombo();
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

    assetEngine.effectEngine.update();

    satellite.update();
    player.update();
    hud.update();
  }

  private killMinedEnemies(color: string, enemies: Enemy[]) {
    let minedEnemyCount = enemies.filter(enemy => enemy.isMineAttached).length;
    // If the landed on enemy is a different color, detonate any enemies with mines on them
    if (color !== this.lastColor) {
      enemies.forEach(enemy => {
        if (enemy.isMineAttached) {
          if (minedEnemyCount > 2) {
            enemy.isDead = true;
            assetEngine.effectEngine.addEffect(enemy.position, [84, 85, 86, 87, 88], 5, 25, new Point(0, enemy.speed), 3, 0.01)
            debounce(() => assetEngine.sfxEngine.playEffect(0), 1);
            hud.updateForEnemyKilled();
            hud.updateOnKill(enemy);
          } else {
            enemies.forEach(enemy => enemy.isMineAttached = false);
            assetEngine.effectEngine.addEffect({ x: enemy.position.x + 8, y: enemy.position.y + 8 }, [94, 95], 5, 25, new Point(0, enemy.speed), -2, 0.01);
            debounce(() => assetEngine.sfxEngine.playEffect(4), 1);
          }
        }
      })
    }
  }
}

export const inLevel = new InLevel();
