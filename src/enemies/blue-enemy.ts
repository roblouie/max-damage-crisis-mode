import { Enemy } from "./enemy";

export class BlueEnemy extends Enemy {
  constructor(x: number, y: number) {
    super(x, y, 2, 40, '#0000ff');
  }
}
