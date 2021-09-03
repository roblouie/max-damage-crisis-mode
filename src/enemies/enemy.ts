import { assetEngine } from "../core/asset-engine-instance";
import { animationFrameSequencer } from "../core/animation-frame-sequencer";

export abstract class Enemy {
  position = { x: 0, y: 0 };
  size: number;
  color = '#000000';
  isDead = false;
  isMineAttached = false;
  abstract speed: number;
  private frameSequencer: Generator<number>;
  private mineSequencer: Generator<number>

  getCenter() {
    return { x: this.position.x + (this.size / 2), y: this.position.y + (this.size / 2) }
  }

  getRadius() {
    return this.size / 2;
  }

  static Colors = [
    '#0000ff',
    '#00ff00',
    '#ffff00',
    '#ff00ff',
  ];

  protected constructor(gridPosition: number, size: number, colorNum: number, spriteFrames: number[]) {
    const xPositions = [0, 35, 70, 104, 139, 174, 208];
    const column = (gridPosition % 7);
    const row = Math.floor(gridPosition / 7);
    this.position.x = xPositions[column];
    this.position.y = row * 35;
    this.size = size;
    this.color = Enemy.Colors[colorNum];
    this.frameSequencer = animationFrameSequencer(spriteFrames, 7, true);
    this.mineSequencer = animationFrameSequencer([27, 28], 20, true);
  }

  update() {
    assetEngine.drawEngine.drawSprite(this.frameSequencer.next().value, this.position.x, this.position.y);
    if (this.isMineAttached) {
      assetEngine.drawEngine.drawSprite(this.mineSequencer.next().value, this.getCenter().x, this.getCenter().y);
    }
  }

  isOffScreen() {
    return (this.position.y - this.size - 20) >= assetEngine.drawEngine.getScreenHeight() / assetEngine.drawEngine.getRenderMultiplier();
  }
}