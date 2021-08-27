import { Enemy } from "./enemy";

export class StraightEnemy extends Enemy {
  constructor(x: number, y: number, color: string) {
    super(x, y, 16, color);
  }

  update() {
    this.position.y += 0.5;
    super.update();
  }
}
