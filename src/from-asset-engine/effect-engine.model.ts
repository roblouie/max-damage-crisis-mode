import {Effect} from "./effect.model";
import {Point} from "../core/point";

export class EffectEngine {
  currentEffects: Effect[] = [];

  constructor() {
  }

  update() {
    this.currentEffects.forEach(effect => effect.update())
    this.currentEffects = this.currentEffects.filter(effect => !effect.getIsDone());
  }

  addEffect(startPosition: Point, animationFrames: number[], animationRate: number, framesDuration: number, translationRate: Point, rotationRate: number, scaleRate: number, initialAngle = 0) {
    this.currentEffects.push(new Effect(startPosition, animationFrames, animationRate, framesDuration, translationRate, rotationRate, scaleRate, initialAngle))
  }
}