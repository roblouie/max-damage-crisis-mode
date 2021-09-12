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
  }

  onUpdate(): void {
    const isLastLevel = this.levelNumber === assetEngine.levels.length;
    const text = isLastLevel ? 'You Win!' : `Level  ${this.levelNumber + 1}`;
    isLastLevel && this.framesElapsed === 0 && assetEngine.musicEngine.startSong(4, false);
    this.framesElapsed++;
    assetEngine.drawEngine.clearContext();
    assetEngine.drawEngine.drawText(text, 12, 120, 100);

    if (this.framesElapsed >= (isLastLevel ? 600 : 121)) {
      hud.saveHighScore();
      isLastLevel ? gameStateMachine.setState('menu', 0) : gameStateMachine.setState('in-level', this.levelNumber);
    }
  }
}

export const levelTransition = new LevelTransitionState();
