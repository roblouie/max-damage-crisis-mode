import {Point} from "../core/point";
import {assetEngine} from "../core/asset-engine-instance";
import {Sprite} from "./sprite.model";

export class Effect {
  private animationFrameIndex = 0;
  private currentFrame = 0;
  private position: Point;
  private animationFrames: number[];
  private animationRate: number;
  private framesDuration: number;
  private opacity: number;
  private translationRate: Point;
  private currentRotation = 0;
  private rotationRate: number;
  private currentScale = 1;
  private scaleRate: number;
  private width: number;
  private height: number;

  constructor(startPosition: Point, animationFrames: number[], animationRate: number, framesDuration: number, opacity: number, translationRate: Point, rotationRate: number, scaleRate: number) {
    this.position = startPosition;
    this.animationFrames = animationFrames;
    this.animationRate = animationRate;
    this.framesDuration = framesDuration;
    this.opacity = opacity;
    this.translationRate = translationRate;
    this.rotationRate = rotationRate;
    this.scaleRate = scaleRate;
    const startSprite = assetEngine.drawEngine.sprites[this.animationFrames[0]];
    this.height = startSprite.height;
    this.width = startSprite.width;
  }

  update() {
    this.position.x += this.translationRate.x;
    this.position.y += this.translationRate.y;
    this.currentScale *= this.scaleRate;
    this.currentRotation += this.rotationRate;
    if (this.currentFrame % this.animationRate === 0) {
      this.animationFrameIndex += 1;
    }
    this.drawAtAngle(this.currentRotation);
    this.currentFrame += 1;
  }

  getCenter() {
    return { x: this.position.x + (this.width / 2), y: this.position.y + (this.height / 2)};
  }

  getIsDone() {
    return this.currentFrame >= this.framesDuration;
  }

  drawAtAngle(angle: number) {
    const context = assetEngine.drawEngine.getContext();
    context.save();
    const center = this.getCenter();
    context.scale(4, 4);
    context.translate(center.x, center.y);
    context.rotate((angle - 90) * Math.PI / 180);
    context.scale(1/4 * this.currentScale, 1/4 * this.currentScale);
    assetEngine.drawEngine.drawSprite(this.animationFrames[this.animationFrameIndex], -this.width / 2, -this.height / 2);
    context.restore();
  }
}