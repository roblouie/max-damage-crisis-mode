import {assetEngine} from "../core/asset-engine-instance";
import { animationFrameSequencer } from "../core/animation-frame-sequencer";

class Satellite {
  private startX = 104;
  private startY = 280;
  private size = 32;
  private frameSequencer = animationFrameSequencer([86, 87, 88], 10, true);

  getRadius() {
    return this.size / 2;
  }

  getCenter() {
    return { x: this.startX + this.getRadius(), y: this.startY + this.getRadius() };
  }

  update() {
    assetEngine.drawEngine.drawSpriteBetter(this.frameSequencer.next().value, this.getCenter());
    // DEBUG
    // const context = assetEngine.drawEngine.getContext();
    // context.save();
    // context.fillStyle = 'white';
    // context.beginPath();
    // context.scale(4, 4);
    // context.arc(this.getCenter().x, this.getCenter().y, this.getRadius(), 0, 2 * Math.PI);
    // context.stroke();
    // context.fill();
    // context.restore();
  }
}

export const satellite = new Satellite();
