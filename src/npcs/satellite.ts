import {assetEngine} from "../core/asset-engine-instance";
import { animationFrameSequencer } from "../core/animation-frame-sequencer";
import { Point } from "../core/point";

class Satellite {
  private position = new Point(104, 280);
  private size = 32;

  private frameSequencer = animationFrameSequencer([89, 90], 20, true);
  suggestLanding = false;

  getRadius() {
    return this.size / 2;
  }

  getCenter() {
    return new Point(this.position).plus(this.getRadius());
  }

  update() {
    assetEngine.drawEngine.drawSprite(this.suggestLanding ? this.frameSequencer.next().value : 90, this.getCenter());
  }
}

export const satellite = new Satellite();
