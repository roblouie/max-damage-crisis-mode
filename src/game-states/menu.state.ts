import { State } from "../core/state";
import { assetEngine } from "../core/asset-engine-instance";
import { controls } from "../core/controls";
import { gameStateMachine } from "../game-state-machine";
import {audioContext, masterGainNode} from "../from-asset-engine/audio-initializer";
import {hud} from "../hud";
import { backgroundManager } from "../background-manager";
import { Point } from "../core/point";

class MenuState implements State {
  levelNumber = 0;

  onUpdate() {
    assetEngine.drawEngine.clearContext();
    backgroundManager.updateBackgrounds();

    assetEngine.drawEngine.drawText('SPACE JUMP', 40, 120, 60, '#cf2127');
    assetEngine.drawEngine.drawText('BOMBER', 60, 120, 110, '#00A99D');
    assetEngine.drawEngine.drawSprite(2, new Point(120, 135), 2);

    assetEngine.drawEngine.drawMenu(225, [
      this.levelNumber === 0 ? 'New Game' : `Continue from Level ${this.levelNumber + 1}`,
      masterGainNode.gain.value === 0 ? '🔈 Enable Audio' : '🔈 Mute',
      'Toggle Fullscreen',
      `High Score: ${hud.getHighScore()}`
    ], (returnIndex: number) => {
      switch (returnIndex) {
        case 0:
          gameStateMachine.setState('level-transition', this.levelNumber);
          break;
        case 1:
          if ((masterGainNode.gain.value = masterGainNode.gain.value === 1 ? 0 : 1) === 1){
            audioContext.resume();
            assetEngine.musicEngine.startSong(0);
          }
          break;
        case 2:
          this.toggleFullScreen();
          break;
      }
    });
    assetEngine.effectEngine.update();
  }

  toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  onEnter(levelNumber: number) {
    this.levelNumber = levelNumber;
    backgroundManager.loadBackgrounds(1);
  }

  onLeave() {
    controls.onClick(undefined);
  }
}

export const menu = new MenuState();
