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

export class InLevel implements State {
  currentLevel = new Level([]);
  levelNumber = 0;

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

      if (player.enemyAttachedTo) {
        comboEngine.updateOnKill(player.enemyAttachedTo);
        assetEngine.sfxEngine.playEffect(0);
        player.enemyAttachedTo.isDead = true;
        player.enemyAttachedTo = undefined;
        hud.updateForEnemyKilled();
      }

      this.currentLevel.activeEnemies.forEach(enemy => {
        if (enemy !== player.enemyAttachedTo && !enemy.isDead && Point.DistanceBetweenTwo(enemy.getCenter(), player.getCenter()) <= player.getRadius() + enemy.getRadius()) {
          player.landOnEnemy(enemy);
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
      }
    }

    if (player.isRespawning()) {
      comboEngine.reset();
    }

    this.currentLevel.activeEnemies.forEach(enemy => {
      if (enemy.isOffScreen()) {
        enemy.isDead = true;
        hud.takeHit();
      }
    })

    this.currentLevel.activeEnemies = this.currentLevel.activeEnemies.filter(enemy => !enemy.isDead);

    if (this.currentLevel.isOver && player.isOnSatelite) {
      gameStateMachine.setState('end-of-level', this.levelNumber);
    }

    satellite.update();
    player.update();
    hud.update();
    comboEngine.update();
  }
}

export const inLevel = new InLevel();
