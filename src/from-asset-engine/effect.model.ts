import {Point} from "../core/point";
import {assetEngine} from "../core/asset-engine-instance";
import { animationFrameSequencer } from "../core/animation-frame-sequencer";

export class Effect {
  private currentFrame = 0;
  // @ts-ignore
  private pos: Point;
  // @ts-ignore
  private animationFrames: number[];
  // @ts-ignore
  private duration: number;
  // @ts-ignore
  private opacity: number;
  // @ts-ignore
  private translationRate: Point;
  private currentRotation = 0;
  // @ts-ignore
  private rotationRate: number;
  private currentScale = 1;
  // @ts-ignore
  private scaleRate: number;
  // @ts-ignore
  private width: number;
  // @ts-ignore
  private height: number;
  // @ts-ignore
  private frameSequencer: Generator<number>

  constructor(startPosition: Point, animationFrames: number[], animationRate: number, durationInFrames: number, opacity: number, translationRate: Point, rotationRate: number, scaleRate: number) {
    const t = this;
    t.pos = startPosition;
    t.animationFrames = animationFrames;
    t.duration = durationInFrames;
    t.opacity = opacity;
    t.translationRate = translationRate;
    t.rotationRate = rotationRate;
    t.scaleRate = scaleRate;
    const startSprite = assetEngine.drawEngine.sprites[t.animationFrames[0]];
    t.height = startSprite.height * 16;
    t.width = startSprite.width * 16;
    t.frameSequencer = animationFrameSequencer(animationFrames, animationRate);
  }

  update() {
    const t = this;
    t.pos.x += t.translationRate.x;
    t.pos.y += t.translationRate.y;
    t.currentScale += t.scaleRate;
    t.currentRotation += t.rotationRate;
    t.drawAtAngle(t.currentRotation);
    t.currentFrame += 1;
  }

  getCenter() {
    const t = this;
    return { x: t.pos.x + (t.width / 2), y: t.pos.y + (t.height / 2)};
  }

  getIsDone = () => this.currentFrame >= this.duration;

  drawAtAngle(angle: number) {
    const t = this;
    const context = assetEngine.drawEngine.getContext();
    context.save();
    const center = this.getCenter();
    context.scale(4, 4);
    context.translate(center.x, center.y);
    context.rotate((angle - 90) * Math.PI / 180);
    context.scale(1/4 * t.currentScale, 1/4 * t.currentScale);
    assetEngine.drawEngine.drawSprite(this.frameSequencer.next().value, -t.width / 2, -t.height / 2);
    context.restore();
  }
}