import {assetEngine} from "../core/asset-engine-instance";
import { animationFrameSequencer } from "../core/animation-frame-sequencer";

class Satellite {
  private startX = 104;
  private startY = 280;
  private size = 32;

  private frameSequencer = animationFrameSequencer([89, 90], 10, true);
  suggestLanding = false;

  getRadius() {
    return this.size / 2;
  }

  getCenter() {
    return { x: this.startX + this.getRadius(), y: this.startY + this.getRadius() };
  }

  update() {
    assetEngine.drawEngine.drawSprite(this.suggestLanding ? this.frameSequencer.next().value : 90, this.getCenter());
  }
}

export const satellite = new Satellite();
