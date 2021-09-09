import { State } from "../core/state";
import { assetEngine } from "../core/asset-engine-instance";
import { controls } from "../core/controls";
import { gameStateMachine } from "../game-state-machine";
import {audioContext, masterGainNode} from "../from-asset-engine/audio-initializer";
import {hud} from "../hud";
import { backgroundManager } from "../background-manager";

class MenuState implements State {
  onUpdate() {
    assetEngine.drawEngine.clearContext();
    backgroundManager.updateBackgrounds();

    assetEngine.drawEngine.drawText('SPACE JUMP', 40, 120, 70, '#cf2127');
    assetEngine.drawEngine.drawText('BOMBER', 60, 120, 120, '#00A99D');
    assetEngine.drawEngine.drawSprite(2, { x: 120, y: 145 }, 2);

    assetEngine.drawEngine.drawMenu(235, ['New Game', masterGainNode.gain.value === 0 ? '🔈 Enable Audio' : '🔈 Mute', '', `High Score: ${hud.getHighScore()}`,], (returnIndex: number) => {
      switch (returnIndex) {
        case 0:
          gameStateMachine.setState('level-transition', 0);
          break;
        case 1:
          if ((masterGainNode.gain.value = masterGainNode.gain.value === 1 ? 0 : 1) === 1){
            audioContext.resume();
            assetEngine.musicEngine.startSong(0);
          }
      }
    });
  }

  onEnter() {
    backgroundManager.loadBackgrounds(1);
  }

  onLeave() {
    controls.onClick(undefined);
  }
}

export const menu = new MenuState();
