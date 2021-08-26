import { Enemy } from "./enemy";

export class BlueEnemy extends Enemy {
  constructor(x: number, y: number) {
    super(x, y, 0.5, 16, '#0000ff');
  }
}
