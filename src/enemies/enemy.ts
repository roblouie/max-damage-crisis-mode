import { assetEngine } from "../core/asset-engine-instance";
import { animationFrameSequencer } from "../core/animation-frame-sequencer";
import { Point } from "../core/point";
import { debounce } from "../core/timing-helpers";

export abstract class Enemy {
  position = new Point(0, 0);
  size = 32;
  radius = 14;
  color = '#000000';
  isDead = false;
  isMineAttached = false;
  isMineActivated = false;
  abstract speed: number;
  private frameSequencer: Generator<number>;
  private minePlantedSequencer: Generator<number>;

  getCenter() {
    return new Point(this.position).plus(this.radius);
  }

  static Colors = [
    '#0000ff',
    '#00ff00',
    '#ffff00',
    '#ff00ff',
  ];

  protected constructor(gridPosition: number, colorNum: number, spriteFrames: number[]) {
    const xPositions = [1, 35, 70, 104, 139, 174, 208];
    const column = (gridPosition % 7);
    const row = Math.floor(gridPosition / 7);
    this.position.x = xPositions[column];
    this.position.y = row * 40 - 710;
    this.color = Enemy.Colors[colorNum];
    this.frameSequencer = animationFrameSequencer(spriteFrames, 7, true);
    this.minePlantedSequencer = animationFrameSequencer([[77, 78, 79, 80][colorNum], 76], 10, true);
  }

  update() {
    assetEngine.drawEngine.drawSprite(this.frameSequencer.next().value, this.getCenter());
    if (this.isMineAttached) {
      assetEngine.drawEngine.drawSprite(this.isMineActivated ? this.minePlantedSequencer.next().value : 76, this.getCenter());
    }

    // DEBUGGER
    // const context = assetEngine.drawEngine.getContext();
    // context.save();
    // context.fillStyle = this.color;
    // context.beginPath();
    // context.scale(4, 4);
    // context.arc(this.getCenter().x, this.getCenter().y, this.radius, 0, 2 * Math.PI);
    // context.stroke();
    // context.fill();
    // context.restore();

  }

  removeMine() {
    this.isMineAttached = false;
    this.isMineAttached = false;
    assetEngine.effectEngine.addEffect(new Point(this.position).plus(8), [81], 5, 18, new Point(0, this.speed), -10, .94);
  }

  isOffScreen() {
    return (this.position.y - this.size - 20) >= assetEngine.drawEngine.getRenderHeight();
  }
}
