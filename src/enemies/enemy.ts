import { assetEngine } from "../core/asset-engine-instance";

export class Enemy {
  position = { x: 0, y: 0 };
  speed = 0.25;
  size = 20;

  constructor(x: number, y: number) {
    this.position.x = x;
    this.position.y = y;
  }

  update() {
    const context = assetEngine.drawEngine.getContext();
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
    context.stroke();

    this.position.y += this.speed;
  }
}