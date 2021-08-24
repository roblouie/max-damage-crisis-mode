import { Enemy } from "./enemy";

export class BlueEnemy extends Enemy {
  constructor(x: number, y: number) {
    super(x, y, 0.3, 20, '#0000ff');
  }
}
