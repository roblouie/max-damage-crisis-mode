import { Enemy } from "./enemy";

export class GreenEnemy extends Enemy{
  constructor(x: number, y: number) {
    super(x, y, 1.2, 40, '#00ff00');
  }
}
