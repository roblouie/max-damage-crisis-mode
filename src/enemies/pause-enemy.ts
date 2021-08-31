import { Enemy } from "./enemy";

export class PauseEnemy extends Enemy {
  pausedFor = 0;
  startingY?: number;

  constructor(gridPosition: number, colorNum: number) {
    super(gridPosition, 16, colorNum, [12]);
  }

  update() {
    if (this.startingY === undefined) {
      this.startingY = this.position.y;
    }

    if (this.position.y >= this.startingY + 240 && this.pausedFor < 5) {
      this.pausedFor += 0.0167;
    } else {
      this.position.y += 0.8;
    }
    super.update();
  }
}
