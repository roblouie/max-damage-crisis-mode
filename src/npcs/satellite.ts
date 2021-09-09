import {assetEngine} from "../core/asset-engine-instance";
import { animationFrameSequencer } from "../core/animation-frame-sequencer";

class Satellite {
  private startX = 104;
  private startY = 280;
  private size = 32;

  private frameSequencer = animationFrameSequencer([45, 46, 47], 10, true);

  getRadius() {
    return this.size / 2;
  }

  getCenter() {
    return { x: this.startX + this.getRadius(), y: this.startY + this.getRadius() };
  }

  update() {
    assetEngine.drawEngine.drawSprite(this.frameSequencer.next().value, this.getCenter());
  }
}

export const satellite = new Satellite();
