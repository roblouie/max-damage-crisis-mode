import { Enemy } from "./enemy";

export class PauseEnemy extends Enemy {
  pausedFor = 0;
  startingY?: number;

  constructor(x: number, y: number, color: string) {
    super(x, y, 16, color);
  }

  update() {
    if (this.startingY === undefined) {
      this.startingY = this.position.y;
    }

    if (this.position.y >= this.startingY + 240 && this.pausedFor < 10) {
      this.pausedFor += 0.0167;
    } else {
      this.position.y += 0.5;
    }
    super.update();
  }
}
