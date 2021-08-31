import { assetEngine } from "../core/asset-engine-instance";

export abstract class Enemy {
  position = { x: 0, y: 0 };
  size: number;
  color = '#000000';
  isDead = false;

  static Colors = [
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ff00ff',
  ];

  protected constructor(gridPosition: number, size: number, colorNum: number) {
    this.position.x = (gridPosition % 7) * 32 + 16;
    this.position.y = Math.floor(gridPosition / 7) * 32;
    this.size = size;
    this.color = Enemy.Colors[colorNum];
  }

  update() {
    const context = assetEngine.drawEngine.getContext();
    context.save();
    context.fillStyle = this.color;
    context.beginPath();
    context.scale(4, 4);
    context.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
    context.stroke();
    context.fill();
    context.restore();
  }

  isOffScreen() {
    return (this.position.y - this.size - 20) >= assetEngine.drawEngine.getScreenHeight() / assetEngine.drawEngine.getRenderMultiplier();
  }
}