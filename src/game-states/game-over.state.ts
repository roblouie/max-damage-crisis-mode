import { State } from "../core/state";
import { assetEngine } from "../core/asset-engine-instance";
import { controls } from "../core/controls";
import { gameStateMachine } from "../game-state-machine";
import { hud } from "../hud";

class GameOverState implements State {
  onUpdate() {
    assetEngine.drawEngine.clearContext();
    assetEngine.drawEngine.getContext().fillStyle = 'white';
    assetEngine.drawEngine.getContext().fillText('Game Over', 100, 100);
  }

  onEnter() {
    hud.resetScore();
    assetEngine.musicEngine.startSong(2, false);
    assetEngine.drawEngine.clearContext();
    controls.onClick(() => {
      gameStateMachine.setState('in-level', 0);
    });
  }
}

export const gameOver = new GameOverState();
