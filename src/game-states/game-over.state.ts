import { State } from "../core/state";
import { assetEngine } from "../core/asset-engine-instance";
import { controls } from "../core/controls";
import { gameStateMachine } from "../game-state-machine";
import { hud } from "../hud";

class GameOverState implements State {
  onUpdate() {
    assetEngine.drawEngine.clearContext();
    assetEngine.drawEngine.getContext().fillStyle = 'white';
    assetEngine.drawEngine.drawText('Game Over', 12, 120, 100);
  }

  onEnter(levelNumber: number) {
    hud.saveHighScore();
    hud.resetScore();
    assetEngine.musicEngine.startSong(2, false);
    assetEngine.drawEngine.clearContext();
    controls.onClick(() => {
      gameStateMachine.setState('menu', levelNumber);
    });
  }
}

export const gameOver = new GameOverState();
