import { State } from "../core/state";
import { assetEngine } from "../core/asset-engine-instance";
import {controls} from "../core/controls";
import {gameStateMachine} from "../game-state-machine";


class CreditsState implements State {
  onEnter() {
    assetEngine.musicEngine.startSong(4)
    controls.onClick(() => gameStateMachine.setState('menu'))
  }

  onUpdate() {
    assetEngine.drawEngine.clearContext();
    assetEngine.drawEngine.drawText('You Win!', 40,  120, 30);
  }

  onLeave() {
    assetEngine.musicEngine.stopSong();
    controls.onClick(() => null);
  }
}

export const credits = new CreditsState();
