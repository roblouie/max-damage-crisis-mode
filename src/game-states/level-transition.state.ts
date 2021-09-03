import { State } from "../core/state";
import { assetEngine } from "../core/asset-engine-instance";
import { gameStateMachine } from "../game-state-machine";
import {hud} from "../hud";

class LevelTransitionState implements State {
  levelNumber = 0;
  framesElapsed = 0;
  isOnLastLevel = false;

  onEnter(levelNumber: number) {
    this.framesElapsed = 0;
    this.levelNumber = levelNumber;
    this.isOnLastLevel = (this.levelNumber === assetEngine.levels.length);
    if (this.isOnLastLevel) {
      hud.saveHighScore()
    }
  }

  onLeave() {
    this.isOnLastLevel = false;
  }

  onUpdate(): void {
    assetEngine.musicEngine.stopSong();
    this.framesElapsed++;
    const context = assetEngine.drawEngine.getContext();
    context.save();
    assetEngine.drawEngine.clearContext();
    context.textAlign = 'center';
    const text = this.isOnLastLevel ? 'You Win!' : `Level  ${this.levelNumber + 1}`;
    assetEngine.drawEngine.drawText(text, 40, 480, 300);
    context.restore();

    if (this.framesElapsed >= 120) {
      if (this.isOnLastLevel) {
        //TODO: Go to credits screen
        gameStateMachine.setState('menu');
      } else {
        gameStateMachine.setState('in-level', this.levelNumber);
      }
    }
  }
}

export const levelTransition = new LevelTransitionState();
