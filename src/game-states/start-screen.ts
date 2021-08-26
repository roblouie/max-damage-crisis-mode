import { State } from "../core/state";
import { assetEngine } from "../core/asset-engine-instance";
import { controls } from "../core/controls";
import { gameStateMachine } from "../game-state-machine";
import {audioContext} from "../from-asset-engine/audio-initializer";

class StartScreen implements State {
  onUpdate() {
    assetEngine.drawEngine.clearContext();
    assetEngine.drawEngine.getContext().fillStyle = 'white';
    assetEngine.drawEngine.getContext().fillText('Click to start', 100, 100);
  }

  onEnter() {
    controls.onClick(() => {
      audioContext.resume();
      gameStateMachine.setState('menu');
    });
  }

  onLeave() {
    controls.onClick(undefined);
  }
}

export const startScreen = new StartScreen();
