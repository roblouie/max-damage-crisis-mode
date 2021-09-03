import { State } from "../core/state";
import { assetEngine } from "../core/asset-engine-instance";
import { controls } from "../core/controls";
import { gameStateMachine } from "../game-state-machine";
import {audioContext, masterGainNode, toggleMute} from "../from-asset-engine/audio-initializer";
import {hud} from "../hud";

class MenuState implements State {
  onUpdate() {
    assetEngine.drawEngine.clearContext();
    assetEngine.drawEngine.drawText('Main Menu', 40,  100, 100);
    assetEngine.drawEngine.drawText(`High Score: ${hud.getHighScore()}`, 30, 400, 400)
    assetEngine.drawEngine.drawText(masterGainNode.gain.value === 0 ? '🔈' : '🔊', 60, 850, 1150);
    if (masterGainNode.gain.value === 0) {
      assetEngine.drawEngine.drawText('\\', 80, 860, 1153, 'gray');
      assetEngine.drawEngine.drawText('muted', 20, 855, 1183);
    }
  }

  onEnter() {
    controls.onMouseMove(position => {
      if (position.y > 250 && position.y < 320 && position.x > 200 && position.x < 240) {
        assetEngine.drawEngine.getCanvas().style.cursor = 'pointer';
      } else {
        assetEngine.drawEngine.getCanvas().style.cursor = 'default';
      }
    });

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
