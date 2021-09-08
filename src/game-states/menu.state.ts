import { State } from "../core/state";
import { assetEngine } from "../core/asset-engine-instance";
import { controls } from "../core/controls";
import { gameStateMachine } from "../game-state-machine";
import {audioContext, masterGainNode, toggleMute} from "../from-asset-engine/audio-initializer";
import {hud} from "../hud";
import { backgroundManager } from "../background-manager";

class MenuState implements State {
  menuOptions = [''];
  callback = (i: number) => {};

  onUpdate() {
    assetEngine.drawEngine.clearContext();
    backgroundManager.updateBackgrounds();

    assetEngine.drawEngine.drawMenu(60, this.menuOptions, this.callback)
  }

  onEnter() {
    backgroundManager.loadBackgrounds(1)
    this.setMainState()
  }

  onLeave() {
    controls.onClick(undefined);
  }

  setMainState() {
    if (masterGainNode.gain.value === 1){
      assetEngine.musicEngine.startSong(0);
    }
    this.menuOptions = ['Main Menu', '', 'New Game', 'Music Player', this.getAudioText(), '', '', `High Score: ${hud.getHighScore()}`];
    this.callback = (returnIndex: number) => {
      switch (returnIndex) {
        case 2:
          gameStateMachine.setState('level-transition', 0)
          break;
        case 3:
          this.setMusicPlayerState()
          break;
        case 4:
          audioContext.resume();
          toggleMute();
          this.setMainState();
          break;
      }
    }
  }

  setMusicPlayerState() {
    assetEngine.musicEngine.stopSong();
    this.menuOptions = ['Music Player', '', 'Space Man Theme', 'Jump to space!', 'Game Over', 'You Win!', 'Final Victory', 'Back to Menu']
    this.callback = (returnIndex: number) => {
      if (masterGainNode.gain.value === 0) {
        toggleMute();
      }
      returnIndex > 6 ? this.setMainState() : assetEngine.musicEngine.startSong(returnIndex - 2);
    }
  }

  getAudioText() {
    return masterGainNode.gain.value === 0 ? '🔈 Unmute' : '🔊 Mute'
  }
}

export const menu = new MenuState();
