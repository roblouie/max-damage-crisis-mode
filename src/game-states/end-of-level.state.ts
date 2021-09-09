import { State } from "../core/state";
import { assetEngine } from "../core/asset-engine-instance";
import { controls } from "../core/controls";
import { backgroundManager } from "../background-manager";
import { hud } from "../hud";
import { satellite } from "../npcs/satellite";
import { player } from "../player/player";
import { gameStateMachine } from "../game-state-machine";
import { Point } from "../core/point";

class EndOfLevelState implements State {
  framesElapsed = 0;
  resistanceBonus = 0;
  scoreEndFrame = 0;
  levelNumberEnded = 0;

  onUpdate() {
    this.framesElapsed++;

    const { drawEngine } = assetEngine;
    assetEngine.drawEngine.clearContext();
    backgroundManager.updateBackgrounds();

    satellite.update();

    if (!player.isOnSatelite) {
      player.update();
    } else {
      controls.onClick(undefined);
      controls.onMouseMove(undefined);
      if (this.framesElapsed === 340) {
        assetEngine.effectEngine.addEffect({x: 120, y: 278}, [3], 999, 31, new Point(0, -5), 0, 1.07, 90)
        assetEngine.sfxEngine.playEffect(2);
        assetEngine.sfxEngine.playEffect(6);
      }
      this.framesElapsed < 340 && drawEngine.drawSprite(2, {x: 120, y: 278});
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

    assetEngine.effectEngine.update();
    hud.update();

    if (this.framesElapsed >= 370) {
      this.resistanceBonus = 0;
      gameStateMachine.setState('level-transition', this.levelNumberEnded + 1);
    }
  }

  onEnter(levelNumber: number) {
    this.framesElapsed = 0;
    this.scoreEndFrame = 0;
    this.levelNumberEnded = levelNumber;
    backgroundManager.updateBackgrounds();
    hud.update();
    assetEngine.musicEngine.startSong(3, false);
  }
}

export const endOfLevel = new EndOfLevelState();
