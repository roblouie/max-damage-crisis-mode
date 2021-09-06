import {Point} from "./point";

export class Rectangle {
  pos: Point;
  width: number;
  height: number;

  constructor(point: Point, width: number, height: number) {
    this.pos = point;
    this.width = width;
    this.height = height;
  }

  getCenter(): Point {
    const x = (this.pos.x + this.width) / 2;
    const y = (this.pos.y + this.height) / 2;
    return { x, y }
  }

  containsPoint(point: Point): boolean {
    const isInX = point.x >= this.pos.x && point.x <= this.pos.x + this.width;
    const isInY = point.y >= this.pos.y && point.y <= this.pos.y + this.height;
    return isInX && isInY
  }
}
