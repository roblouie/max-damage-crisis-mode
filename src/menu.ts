import { State } from "./core/state";
import { assetEngine } from "./core/asset-engine-instance";
import { controls } from "./core/controls";
import { stateMachine } from "./core/state-machine";

class Menu implements State {
  onUpdate() {
    assetEngine.drawEngine.clearContext();
    assetEngine.drawEngine.getContext().fillStyle = 'white';
    assetEngine.drawEngine.getContext().fillText('Press Enter to Start', 100, 100);

    if (controls.state.isPressingStart) {
      stateMachine.setState('game');
    }
  }

  onEnter() {
    assetEngine.drawEngine.clearContext();
  }

  onLeave() {
  }
}

export const menu = new Menu();
