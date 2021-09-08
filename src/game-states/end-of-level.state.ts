import { State } from "../core/state";
import { assetEngine } from "../core/asset-engine-instance";
import { controls } from "../core/controls";
import { backgroundManager } from "../background-manager";
import { hud } from "../hud";
import { satellite } from "../npcs/satellite";
import { player } from "../player/player";
import { gameStateMachine } from "../game-state-machine";
import { runOnce } from "../core/timing-helpers";

class EndOfLevelState implements State {
  framesElapsed = 0;
  resistanceBonus = 0;
  scoreEndFrame = 0;
  playerScale = 1;
  playerPosition = {x: 0, y: 0};
  scaleRate = 0.1;
  levelNumberEnded = 0;
  playJumpSound?: Function;
  playerFrame = 2;

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
      if (this.framesElapsed >= 340) {
        this.playJumpSound!();
        this.playerFrame = 3;
        this.playerScale += this.scaleRate;
        this.playerPosition.y -= this.playerScale * 8;
        this.playerPosition.x += this.scaleRate * 5;
        this.scaleRate += 0.02;
        this.framesElapsed === 340 && assetEngine.sfxEngine.playEffect(6);
      }
      this.framesElapsed < 370 && drawEngine.drawSpriteBetter(this.playerFrame, this.playerPosition, this.playerScale);
      context.restore();
    }

    if (this.framesElapsed > 30) {
      drawEngine.drawText('Level Complete!', 10, 120, 100);
    }

    if (this.framesElapsed >= 60) {
      drawEngine.drawText('Resistance Bonus', 10, 40, 125, 'white', 'left');
      drawEngine.drawText(this.resistanceBonus.toString(), 10, 180, 125, 'white', 'right');
      if (hud.healthPercent >= 0.5) {
        hud.takeHit(0.5);
        hud.updateScore(500);
        this.resistanceBonus += 500;
      }
    }

    context.restore();
    hud.update();

    if (this.playerScale >= 80) {
      gameStateMachine.setState('level-transition', this.levelNumberEnded + 1);
    }
  }

  onEnter(levelNumber: number) {
    this.framesElapsed = 0;
    this.scoreEndFrame = 0;
    this.playerScale = 1;
    this.scaleRate = 0.1;
    this.levelNumberEnded = levelNumber;
    this.playerPosition = { x: player.startX, y: player.startY - 12 };
    this.playJumpSound = runOnce(() => assetEngine.sfxEngine.playEffect(2));
    backgroundManager.updateBackgrounds();
    hud.update();
    assetEngine.musicEngine.startSong(3, false);
  }
}

export const endOfLevel = new EndOfLevelState();
