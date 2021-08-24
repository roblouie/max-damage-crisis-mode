import { assetEngine } from "../core/asset-engine-instance";

export abstract class Enemy {
  position = { x: 0, y: 0 };
  speed: number;
  size: number;
  color = '#000000';

  protected constructor(x: number, y: number, speed: number, size: number, color: string) {
    this.position.x = x;
    this.position.y = y;
    this.speed = speed;
    this.size = size;
    this.color = color;
  }

  update() {
    const context = assetEngine.drawEngine.getContext();
    context.fillStyle = this.color;
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
    context.stroke();
    context.fill();

    this.position.y += this.speed;
  }
}