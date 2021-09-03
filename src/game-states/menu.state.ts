import { State } from "../core/state";
import { assetEngine } from "../core/asset-engine-instance";
import { controls } from "../core/controls";
import { gameStateMachine } from "../game-state-machine";
import {Point} from "../core/point";
import {audioContext, masterGainNode, toggleMute} from "../from-asset-engine/audio-initializer";
import {hud} from "../hud";

class MenuState implements State {
  onUpdate() {
    assetEngine.drawEngine.clearContext();
    assetEngine.drawEngine.drawText('Main Menu', 40, 'white', 100, 100);
    assetEngine.drawEngine.drawText(`High Score: ${hud.getHighScore()}`, 30, 'white', 400, 400)
    assetEngine.drawEngine.drawText(masterGainNode.gain.value === 0 ? '🔈' : '🔊', 60, 'white', 850, 1150);
  }

  onEnter() {
    controls.onClick((position) => {
      // TODO: update values to eval y position against if switching to real render resolution as
      // source of truth for whole game
      if (position.y > 250 && position.y < 320 && position.x > 200 && position.x < 240) {
        audioContext.resume();
        toggleMute()
        assetEngine.musicEngine.startSong(0);
        return;
      }
      gameStateMachine.setState('level-transition', 0);
    });
  }

  onLeave() {
    controls.onClick(undefined);
  }
}

export const menu = new MenuState();
