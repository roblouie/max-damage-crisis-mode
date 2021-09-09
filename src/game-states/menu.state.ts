import { State } from "../core/state";
import { assetEngine } from "../core/asset-engine-instance";
import { controls } from "../core/controls";
import { gameStateMachine } from "../game-state-machine";
import {audioContext, masterGainNode, toggleMute} from "../from-asset-engine/audio-initializer";
import {hud} from "../hud";
import { backgroundManager } from "../background-manager";

class MenuState implements State {
  onUpdate() {
    assetEngine.drawEngine.clearContext();
    backgroundManager.updateBackgrounds();

    assetEngine.drawEngine.drawMenu(200, ['New Game', this.getAudioText(), '', '', `High Score: ${hud.getHighScore()}`], (returnIndex: number) => {
      switch (returnIndex) {
        case 0:
          gameStateMachine.setState('level-transition', 0);
          return;
        case 1:
          audioContext.resume();
          toggleMute();
          if (masterGainNode.gain.value === 1){
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

  getAudioText() {
    return masterGainNode.gain.value === 0 ? '🔈 Enable Audio' : '🔈 Mute'
  }
}

export const menu = new MenuState();
