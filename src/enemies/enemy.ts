import { assetEngine } from "../core/asset-engine-instance";
import { EnemyPattern } from "./enemy-patterns/enemy-pattern";

export abstract class Enemy {
  position = { x: 0, y: 0 };
  enemyPattern: EnemyPattern;
  size: number;
  color = '#000000';
  isDead = false;

  protected constructor(x: number, y: number, size: number, color: string, enemyPattern: EnemyPattern) {
    this.position.x = x;
    this.position.y = y;
    this.size = size;
    this.color = color;
    this.enemyPattern = enemyPattern;
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
    this.enemyPattern.update(this.position);
  }

  isOffScreen() {
    return (this.position.y - this.size - 20) >= assetEngine.drawEngine.getScreenHeight() / assetEngine.drawEngine.getRenderMultiplier();
  }
}