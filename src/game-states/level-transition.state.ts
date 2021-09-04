import { State } from "../core/state";
import { assetEngine } from "../core/asset-engine-instance";
import { gameStateMachine } from "../game-state-machine";
import {hud} from "../hud";

class LevelTransitionState implements State {
  levelNumber = 0;
  framesElapsed = 0;

  onEnter(levelNumber: number) {
    this.framesElapsed = 0;
    this.levelNumber = levelNumber;
    assetEngine.musicEngine.stopSong();
    if (this.levelNumber === assetEngine.levels.length) {
      gameStateMachine.setState('credits');
    }
  }

  onUpdate(): void {
    this.framesElapsed++;
    const context = assetEngine.drawEngine.getContext();
    assetEngine.drawEngine.clearContext();
    context.textAlign = 'center';

    assetEngine.drawEngine.drawText(`Level  ${this.levelNumber + 1}`, 40, 120, 100);

    if (this.framesElapsed >= 121) {
      hud.saveHighScore();
      gameStateMachine.setState('in-level', this.levelNumber);
    }
  }
}

export const levelTransition = new LevelTransitionState();
