import { State } from "./core/state";
import { assetEngine } from "./core/asset-engine-instance";
import { controls } from "./core/controls";
import { gameStateMachine } from "./game-state-machine";

class Menu implements State {
  onUpdate() {
    assetEngine.drawEngine.clearContext();
    assetEngine.drawEngine.getContext().fillStyle = 'white';
    assetEngine.drawEngine.getContext().fillText('Click to start', 100, 100);
  }

  onEnter() {
    assetEngine.drawEngine.clearContext();
    controls.onClick(() => {
      gameStateMachine.setState('game');
    });
  }

  onLeave() {
    controls.onClick(undefined);
  }
}

export const menu = new Menu();
