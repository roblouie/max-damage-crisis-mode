import { State } from "../core/state";
import { assetEngine } from "../core/asset-engine-instance";
import { controls } from "../core/controls";
import { gameStateMachine } from "../game-state-machine";

class MenuState implements State {
  onUpdate() {
    assetEngine.drawEngine.clearContext();
    assetEngine.drawEngine.getContext().fillStyle = 'white';
    assetEngine.drawEngine.getContext().fillText('Main Menu', 100, 100);
  }

  onEnter() {
    assetEngine.musicEngine.startSong(0);
    controls.onClick(() => {
      gameStateMachine.setState('level-transition', 0);
    });
  }

  onLeave() {
    controls.onClick(undefined);
  }
}

export const menu = new MenuState();
