import {assetEngine} from "../core/asset-engine-instance";

class Satellite {
  private startX = 120;
  private startY = 270;
  private size = 16;
  private position = { x: this.startX, y: this.startY };

  getRadius() {
    return this.size / 2;
  }

  getCenter() {
    return { x: this.startX - this.getRadius(), y: this.startY - this.getRadius() };
  }

  update() {
    assetEngine.drawEngine.drawSprite(10, this.position.x - this.getRadius(), this.position.y - this.getRadius());
  }
}

export const satellite = new Satellite();