import { Enemy } from "./enemy";

export class GreenEnemy extends Enemy{
  constructor(x: number, y: number) {
    super(x, y, 0.5, 16, '#00ff00');
  }
}
