import {assetEngine} from "../core/asset-engine-instance";

class Satellite {
  private startX = 104;
  private startY = 260;
  private size = 32;

  getRadius() {
    return this.size / 2;
  }

  getCenter() {
    return { x: this.startX + this.getRadius(), y: this.startY + this.getRadius() };
  }

  update() {
    assetEngine.drawEngine.drawSprite(14, this.startX, this.startY);
    // DEBUG
    const context = assetEngine.drawEngine.getContext();
    context.save();
    context.fillStyle = 'white';
    context.beginPath();
    context.scale(4, 4);
    context.arc(this.getCenter().x, this.getCenter().y, this.getRadius(), 0, 2 * Math.PI);
    context.stroke();
    context.fill();
    context.restore();
  }
}

export const satellite = new Satellite();
