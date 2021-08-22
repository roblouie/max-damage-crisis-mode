import { State } from "./core/state";
import { assetEngine } from "./core/asset-engine-instance";
import { stateMachine } from "./core/state-machine";

class Menu implements State {
  onUpdate() {
    assetEngine.drawEngine.clearContext();
    assetEngine.drawEngine.getContext().fillStyle = 'white';
    assetEngine.drawEngine.getContext().fillText('Click to start', 100, 100);
  }

  onEnter() {
    assetEngine.drawEngine.clearContext();
    assetEngine.drawEngine.getCanvas().onclick = () => {
      stateMachine.setState('game');
    }
  }

  onLeave() {
  }
}

export const menu = new Menu();
