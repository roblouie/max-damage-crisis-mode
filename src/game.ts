import { State } from "./core/state";
import { assetEngine } from "./core/asset-engine-instance";
import { controls } from "./core/controls";

class Game implements State {
  posX = 0;
  posY = 0;

  onEnter() {
  }

  onLeave() {
  }

  onUpdate(timeElapsed: number): void {
    if (controls.state.isPressingLeft) {
      this.posX--;
    }

    if (controls.state.isPressingRight) {
      this.posX++;
    }

    if (controls.state.isPressingDown) {
      this.posY++;
    }

    if (controls.state.isPressingUp) {
      this.posY--;
    }

    assetEngine.drawEngine.clearContext();
    assetEngine.drawEngine.drawSpriteToCanvas(0, this.posX, this.posY);
  }

}

export const game = new Game();
