import { State } from "./core/state";
import { assetEngine } from "./core/asset-engine-instance";
import { controls } from "./core/controls";
import { gameStateMachine } from "./game-state-machine";

class GameOver implements State {
  onUpdate() {
    assetEngine.drawEngine.clearContext();
    assetEngine.drawEngine.getContext().fillStyle = 'white';
    assetEngine.drawEngine.getContext().fillText('Game Over', 100, 100);
  }

  onEnter() {
    assetEngine.musicEngine.startSong(2, false);
    assetEngine.drawEngine.clearContext();
    controls.onClick(() => {
      gameStateMachine.setState('game');
    });
  }

  onLeave() {
    //
  }
}

export const gameOver = new GameOver();
