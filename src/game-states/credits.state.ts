import { State } from "../core/state";
import { assetEngine } from "../core/asset-engine-instance";
import {controls} from "../core/controls";
import {gameStateMachine} from "../game-state-machine";
import {doTimes} from "../core/timing-helpers";


class CreditsState implements State {
  framesElapsed = 0

  onEnter() {
    assetEngine.musicEngine.startSong(4)
    controls.onClick(() => gameStateMachine.setState('menu'))
  }

  onUpdate() {
    this.framesElapsed ++
    assetEngine.drawEngine.clearContext();

    const animationOffset = this.framesElapsed > 120 ? (this.framesElapsed - 120) / 4 : 0;
    assetEngine.drawEngine.drawText('You Win!', 60, 120, 100 - animationOffset);
    const credits = ['Robert Louison', 'James Schroederson', 'Jordan Louison', 'Nicole Witowskerson', 'Hendricks Henderson']
    credits.forEach((text, index) => {
      assetEngine.drawEngine.drawText(text, 40,  120, (index * 25) + 400 - animationOffset);
    })
    assetEngine.drawEngine.drawText('Thanks for Playing!', 60, 120, 800 - animationOffset);
    if (this.framesElapsed > 3500) {
      gameStateMachine.setState('menu');
    }
  }

  onLeave() {
    assetEngine.musicEngine.stopSong();
    controls.onClick(() => null);
  }
}

export const credits = new CreditsState();
