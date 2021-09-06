import { State } from "../core/state";
import { assetEngine } from "../core/asset-engine-instance";
import { controls } from "../core/controls";
import { gameStateMachine } from "../game-state-machine";
import {audioContext, masterGainNode, toggleMute} from "../from-asset-engine/audio-initializer";
import {hud} from "../hud";

class MenuState implements State {
  onUpdate() {
    assetEngine.drawEngine.clearContext();
    assetEngine.drawEngine.drawText('Main Menu', 40,  120, 30);
    const audioText = masterGainNode.gain.value === 0 ? '🔈 Unmute' : '🔊 Mute'
    assetEngine.drawEngine.drawMenu(100, ['New Game', 'Music Player', 'Sfx Player', audioText, '', `High Score: ${hud.getHighScore()}`], (returnIndex) => {
      console.log(returnIndex)
      if (returnIndex === 0) {
        gameStateMachine.setState('level-transition', 0)
      }
      if (returnIndex === 3) {
        audioContext.resume();
        toggleMute();
        assetEngine.musicEngine.startSong(0);
      }
    })
  }

  onEnter() {
    if (masterGainNode.gain.value === 1){
      assetEngine.musicEngine.startSong(0);
    }
  }

  onLeave() {
    controls.onClick(undefined);
  }
}

export const menu = new MenuState();
