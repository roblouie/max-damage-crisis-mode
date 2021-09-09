import { assetEngine } from "../core/asset-engine-instance";
import { animationFrameSequencer } from "../core/animation-frame-sequencer";

export abstract class Enemy {
  position = { x: 0, y: 0 };
  size = 32;
  radius = 16;
  color = '#000000';
  isDead = false;
  isMineAttached = false;
  isMineActivated = false;
  abstract speed: number;
  private frameSequencer: Generator<number>;
  private minePlantedSequencer: Generator<number>;

  getCenter() {
    return { x: this.position.x + this.radius, y: this.position.y + this.radius }
  }

  static Colors = [
    '#0000ff',
    '#00ff00',
    '#ffff00',
    '#ff00ff',
  ];

  protected constructor(gridPosition: number, colorNum: number, spriteFrames: number[]) {
    const xPositions = [0, 35, 70, 104, 139, 174, 208];
    const column = (gridPosition % 7);
    const row = Math.floor(gridPosition / 7);
    this.position.x = xPositions[column];
    this.position.y = row * 35;
    this.color = Enemy.Colors[colorNum];
    this.frameSequencer = animationFrameSequencer(spriteFrames, 7, true);
    this.minePlantedSequencer = animationFrameSequencer([[90, 91, 92, 93][colorNum], 89], 10, true);
  }

  update() {
    assetEngine.drawEngine.drawSpriteBetter(this.frameSequencer.next().value, this.getCenter());
    if (this.isMineAttached) {
      assetEngine.drawEngine.drawSpriteBetter(this.isMineActivated ? this.minePlantedSequencer.next().value : 89, this.getCenter());
    }
  }

  isOffScreen() {
    return (this.position.y - this.size - 20) >= assetEngine.drawEngine.getScreenHeight() / assetEngine.drawEngine.getRenderMultiplier();
  }
}
