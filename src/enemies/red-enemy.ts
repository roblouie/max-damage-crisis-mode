import { Enemy } from "./enemy";

export class RedEnemy extends Enemy {
  constructor(x: number, y: number) {
    super(x, y, 1.2, 40, '#ff0000');
  }
}
