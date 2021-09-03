import { State } from "../core/state";
import { assetEngine } from "../core/asset-engine-instance";
import { gameStateMachine } from "../game-state-machine";

class LevelTransitionState implements State {
  levelNumber = 0;
  framesElapsed = 0;

  onEnter(levelNumber: number) {
    this.framesElapsed = 0;
    this.levelNumber = levelNumber;
  }

  onUpdate(): void {
    assetEngine.musicEngine.stopSong();
    this.framesElapsed++;
    const context = assetEngine.drawEngine.getContext();
    context.save();
    assetEngine.drawEngine.clearContext();
    const isOnLastLevel = (this.levelNumber === assetEngine.levels.length);
    context.textAlign = 'center';
    const text = isOnLastLevel ? 'You Win!' : `Level  ${this.levelNumber + 1}`;
    assetEngine.drawEngine.drawText(text, 40, 'white', 480, 300);
    context.restore();

    if (this.framesElapsed >= 120) {
      if (isOnLastLevel) {
        //TODO: Go to credits screen
        gameStateMachine.setState('menu');
      } else {
        gameStateMachine.setState('in-level', this.levelNumber);
      }
    }
  }
}

export const levelTransition = new LevelTransitionState();
