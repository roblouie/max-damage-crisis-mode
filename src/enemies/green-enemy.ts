import { Enemy } from "./enemy";

export class GreenEnemy extends Enemy{
  constructor(x: number, y: number) {
    super(x, y, 0.3, 20, '#00ff00');
  }
}
