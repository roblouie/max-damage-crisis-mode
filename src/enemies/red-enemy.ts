import { Enemy } from "./enemy";

export class RedEnemy extends Enemy {
  constructor(x: number, y: number) {
    super(x, y, 0.5, 16, '#ff0000');
  }
}
