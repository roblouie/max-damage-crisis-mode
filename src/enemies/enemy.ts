import { assetEngine } from "../core/asset-engine-instance";
import { animationFrameSequencer } from "../core/animation-frame-sequencer";
import { Point } from "../core/point";
import { debounce } from "../core/timing-helpers";

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
    this.minePlantedSequencer = animationFrameSequencer([[77, 78, 79, 80][colorNum], 76], 10, true);
  }

  update() {
    assetEngine.drawEngine.drawSprite(this.frameSequencer.next().value, this.getCenter());
    if (this.isMineAttached) {
      assetEngine.drawEngine.drawSprite(this.isMineActivated ? this.minePlantedSequencer.next().value : 76, this.getCenter());
    }
  }

  removeMine() {
    this.isMineAttached = false;
    this.isMineAttached = false;
    assetEngine.effectEngine.addEffect({ x: this.position.x + 8, y: this.position.y + 8 }, [81], 5, 18, new Point(0, this.speed), -10, .94);
    debounce(() => assetEngine.sfxEngine.playEffect(4), 1);
  }

  isOffScreen() {
    return (this.position.y - this.size - 20) >= assetEngine.drawEngine.getRenderHeight();
  }
}
