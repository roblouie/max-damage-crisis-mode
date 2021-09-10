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
import { debounce, doTimes } from "../core/timing-helpers";
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
    satellite.suggestLanding = false;
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
      gameStateMachine.setState('game-over', this.levelNumber);
    }
    assetEngine.drawEngine.clearContext();
    backgroundManager.updateBackgrounds();

    this.currentLevel.update();

    const { activeEnemies } = this.currentLevel;
    const minedEnemies = activeEnemies.filter(enemy => enemy.isMineAttached);

    if (player.isJumping()) {
      activeEnemies.forEach((enemy, index, enemies) => {
        // See if we should land on the enemy
        if (enemy !== player.enemyAttachedTo && enemy !== player.enemyJumpingFrom && !enemy.isDead && Point.DistanceBetweenTwo(enemy.getCenter(), player.getCenter()) <= player.radius + enemy.radius) {
          this.killMinedEnemies(enemy.color, minedEnemies);

          // After marking other enemies as dead, we can land on this enemy and place a mine on it
          player.landOnEnemy(enemy);
          this.lastColor = enemy.color;
          hud.updateOnLand(enemy);
          enemy.isMineAttached = true;
          const enemiesToActivate = enemies.filter(enemy => enemy.isMineAttached && !enemy.isDead);
          if (enemiesToActivate.length >= 3) {
            enemiesToActivate.forEach(enemy => enemy.isMineActivated = true);
            assetEngine.sfxEngine.playEffect(5);
          }
        }
      });
    }

    // If the player is still in a jumping state after checking collision against enemies, check if he collides with the
    // satellite. It's important that we check this separately because landing on enemies should always have priority.
    // You should only be able to land on a satellite if no enemies are around.
    if (!player.isLeavingSatellite && player.isJumping()) {
      if (Point.DistanceBetweenTwo(player.getCenter(), satellite.getCenter()) <= satellite.getRadius() + player.radius) {
        player.landOnSatellite();
        this.killMinedEnemies('', minedEnemies);
      }
    }

    if (player.isRespawning()) {
      hud.resetCombo();
      minedEnemies.forEach(enemy => {
        enemy.removeMine()
        debounce(() => assetEngine.sfxEngine.playEffect(4), 1);
      });
    }

    this.currentLevel.activeEnemies.forEach(enemy => {
      if (enemy.isOffScreen()) {
        enemy.isDead = true;
        hud.takeHit();
        debounce(() => assetEngine.sfxEngine.playEffect(7), 1);
      }
    });

    this.currentLevel.activeEnemies = activeEnemies.filter(enemy => !enemy.isDead);

    if (this.currentLevel.isOver && player.isOnSatelite) {
      gameStateMachine.setState('end-of-level', this.levelNumber);
    }

    assetEngine.effectEngine.update();

    satellite.update();
    player.update();
    hud.update();
  }

  private killMinedEnemies(color: string, minedEnemies: Enemy[]) {
    // If the landed on enemy is a different color, detonate any enemies with mines on them
    if (color !== this.lastColor) {
      minedEnemies.forEach(enemy => {
        if (minedEnemies.length > 2) {
          enemy.isDead = true;
          // Play mine explosion effect and sound
          this.drawExplosion(enemy);
          debounce(() => assetEngine.sfxEngine.playEffect(0), 1);
          hud.updateForEnemyKilled();
          hud.updateOnKill(enemy);
        } else {
          minedEnemies.forEach(enemy => {
            enemy.removeMine();
            debounce(() => assetEngine.sfxEngine.playEffect(4), 1);
          });
        }
      });
    }
  }

  private drawExplosion(enemy: Enemy) {
    const numberOfPieces = Math.floor(this.randomNumber(2, 5));

    doTimes(numberOfPieces, () => {
      const direction = new Point(this.randomNumber(-1, 1), this.randomNumber(-1, 1));
      const rotationRate = this.randomNumber(-6, 6);
      const initialSize = this.randomNumber(1, 2);
      assetEngine.effectEngine.addEffect(new Point(enemy.position).plus(16), [91], 40, 40, direction, rotationRate, 0.975, 1, initialSize);
    });
    assetEngine.effectEngine.addEffect(new Point(enemy.position).plus(enemy.radius), [71, 72, 73, 74, 75], 5, 25, new Point(0, 0), 3, 1.01);
  }

  private randomNumber(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }
}

export const inLevel = new InLevel();
