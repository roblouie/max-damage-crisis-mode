import {Point} from "./point";

export class Rectangle {
  position: Point;
  width: number;
  height: number;

  constructor(point: Point, width: number, height: number) {
    this.position = point;
    this.width = width;
    this.height = height;
  }

  getCenter(): Point {
    const x = (this.position.x + this.width) / 2;
    const y = (this.position.y + this.height) / 2;
    return { x, y }
  }

  isPointInRectangle(point: Point): boolean {
    const isInX = point.x >= this.position.x && point.x <= this.position.x + this.width;
    const isInY = point.y >= this.position.y && point.y <= this.position.y + this.height;
    return isInX && isInY
  }
}
