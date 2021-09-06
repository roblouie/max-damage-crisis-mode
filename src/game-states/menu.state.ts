import { State } from "../core/state";
import { assetEngine } from "../core/asset-engine-instance";
import { controls } from "../core/controls";
import { gameStateMachine } from "../game-state-machine";
import {audioContext, masterGainNode, toggleMute} from "../from-asset-engine/audio-initializer";
import {hud} from "../hud";
import { Rectangle } from "../core/rectangle";

class MenuState implements State {
  muteRectangle = new Rectangle({ x: 210, y: 280 }, 40, 40);
  onUpdate() {
    const context = assetEngine.drawEngine.getContext();
    const canvas = assetEngine.drawEngine.getCanvas();
    assetEngine.drawEngine.clearContext();
    context.scale(1/4, 1/4);
    assetEngine.drawEngine.drawText('Main Menu', 40,  120, 30);
    context.scale(1/2, 1/2);
    assetEngine.drawEngine.drawText(`High Score: ${hud.getHighScore()}`, 30, 120, 150)
    assetEngine.drawEngine.drawText(masterGainNode.gain.value === 0 ? '🔈' : '🔊', 60, 222, 300);
    if (masterGainNode.gain.value === 0) {
      assetEngine.drawEngine.drawText('\\', 80, 222, 300, 'gray');
      assetEngine.drawEngine.drawText('muted', 20, 222, 308);
    }
  }

  onEnter() {
    if (masterGainNode.gain.value === 1){
      assetEngine.musicEngine.startSong(0);
    }

    controls.onMouseMove(position => {
      if (this.muteRectangle.containsPoint(position)) {
        assetEngine.drawEngine.getCanvas().style.cursor = 'pointer';
      } else {
        assetEngine.drawEngine.getCanvas().style.cursor = 'default';
      }
    });

    controls.onClick((position) => {
      // TODO: update values to eval y position against if switching to real render resolution as
      // source of truth for whole game
      if (this.muteRectangle.containsPoint(position)) {
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
