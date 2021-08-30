import { Enemy } from "./enemy";

export class StraightEnemy extends Enemy {
  constructor(gridPosition: number, colorNum: number) {
    super(gridPosition, 16, colorNum);
  }

  update() {
    this.position.y += 0.8;
    super.update();
  }
}
