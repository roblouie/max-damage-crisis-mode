import {Point} from "../core/point";
import {assetEngine} from "../core/asset-engine-instance";
import { animationFrameSequencer } from "../core/animation-frame-sequencer";

export class Effect {
  private currentFrame = 0;
  private position: Point;
  private animationFrames: number[];
  private duration: number;
  private opacity: number;
  private translationRate: Point;
  private currentRotation = 0;
  private rotationRate: number;
  private currentScale = 1;
  private scaleRate: number;
  private width: number;
  private height: number;
  private frameSequencer: Generator<number>

  constructor(startPosition: Point, animationFrames: number[], animationRate: number, durationInFrames: number, opacity: number, translationRate: Point, rotationRate: number, scaleRate: number) {
    this.position = startPosition;
    this.animationFrames = animationFrames;
    this.duration = durationInFrames;
    this.opacity = opacity;
    this.translationRate = translationRate;
    this.rotationRate = rotationRate;
    this.scaleRate = scaleRate;
    const startSprite = assetEngine.drawEngine.sprites[this.animationFrames[0]];
    this.height = startSprite.height * 16;
    this.width = startSprite.width * 16;
    this.frameSequencer = animationFrameSequencer(animationFrames, animationRate);
  }

  update() {
    this.position.x += this.translationRate.x;
    this.position.y += this.translationRate.y;
    this.currentScale += this.scaleRate;
    this.currentRotation += this.rotationRate;
    this.drawAtAngle(this.currentRotation);
    this.currentFrame += 1;
  }

  getCenter() {
    return { x: this.position.x + (this.width / 2), y: this.position.y + (this.height / 2)};
  }

  getIsDone() {
    return this.currentFrame >= this.duration;
  }

  drawAtAngle(angle: number) {
    const context = assetEngine.drawEngine.getContext();
    context.cSave();
    const center = this.getCenter();
    context.scale(4, 4);
    context.translate(center.x, center.y);
    context.rotate((angle - 90) * Math.PI / 180);
    context.scale(1/4 * this.currentScale, 1/4 * this.currentScale);
    assetEngine.drawEngine.drawSprite(this.frameSequencer.next().value, -this.width / 2, -this.height / 2);
    context.cRestore();
  }
}