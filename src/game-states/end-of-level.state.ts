import { State } from "../core/state";
import { assetEngine } from "../core/asset-engine-instance";
import { controls } from "../core/controls";
import { backgroundManager } from "../background-manager";
import { hud } from "../hud";
import { satellite } from "../npcs/satellite";
import { player } from "../player/player";
import { gameStateMachine } from "../game-state-machine";
import { comboEngine } from "../combo-engine";

class EndOfLevelState implements State {
  framesElapsed = 0;
  resistanceBonus = 0;
  timeBonus = 0;
  scoreEndFrame = 0;
  playerScale = 1;
  playerPosition = {x: 0, y: 0};
  scaleRate = 0.1;
  levelNumberEnded = 0;

  onUpdate() {
    this.framesElapsed++;

    const { drawEngine } = assetEngine;
    const context = drawEngine.getContext();
    context.save();
    drawEngine.clearContext();
    backgroundManager.updateBackgrounds();

    satellite.update();

    if (!player.isOnSatelite) {
      player.update();
    } else {
      controls.onClick(undefined);
      controls.onMouseMove(undefined);
      context.save();
      if (this.scoreEndFrame > 0 && this.framesElapsed - this.scoreEndFrame >= 160) {
        //TODO: Use player jump frame sprite
        this.playerScale += this.scaleRate;
        this.playerPosition.y -= this.playerScale * 2;
        this.playerPosition.x -= this.playerScale * 0.4;
        context.scale(this.playerScale, this.playerScale);
        this.scaleRate += 0.05;
      }
      drawEngine.drawSprite(3, this.playerPosition.x / this.playerScale, this.playerPosition.y / this.playerScale);
      context.restore();
    }

    if (this.framesElapsed > 30) {
      context.textAlign = 'center';
      drawEngine.drawText('Level Complete!', 40, 'white', 480, 230);
    }

    if (this.framesElapsed >= 60) {
      context.textAlign = 'left';
      drawEngine.drawText('Resistance Bonus', 40, 'white', 160, 380);
      context.textAlign = 'right';
      drawEngine.drawText(this.resistanceBonus.toString(), 40, 'white', 800, 380);
      if (hud.healthPercent >= 1) {
        hud.takeHit(1);
        hud.updateScore(1000);
        this.resistanceBonus += 1000;
      } else {
        context.textAlign = 'left';
        drawEngine.drawText('Time Bonus', 40, 'white', 160, 580);
        context.textAlign = 'right';
        drawEngine.drawText(this.timeBonus.toString(), 40, 'white', 800, 580);
        hud.updateScore(this.timeBonus);
        if (this.scoreEndFrame === 0) {
          this.scoreEndFrame = this.framesElapsed;
        }
      }
    }

    context.restore();

    comboEngine.update();
    hud.update();

    if (this.playerScale >= 80) {
      gameStateMachine.setState('level-transition', this.levelNumberEnded + 1);
    }
  }

  onEnter(levelNumber: number, levelTime: number) {
    this.framesElapsed = 0;
    this.scoreEndFrame = 0;
    this.playerScale = 1;
    this.scaleRate = 0.1;
    this.levelNumberEnded = levelNumber;
    this.playerPosition = { x: player.startX, y: player.startY - 12 };
    const expectedTime = assetEngine.levels[levelNumber].enemyWaves.length * 10;
    const baseBonus = (expectedTime - Math.floor(levelTime / 1000)) * 10000;
    this.timeBonus = baseBonus > 0 ? baseBonus : 0;
    backgroundManager.updateBackgrounds();
    hud.update();
    comboEngine.update();
    assetEngine.musicEngine.startSong(3);
  }

  onLeave() {
    hud.saveHighScore();
  }
}

export const endOfLevel = new EndOfLevelState();
