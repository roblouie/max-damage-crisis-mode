import { Enemy } from "./enemy";

export class PauseEnemy extends Enemy {
  pausedFor = 0;
  startingY?: number;
  speed = 0.8;

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
      this.position.y += this.speed;
    }
    super.update();
  }
}
