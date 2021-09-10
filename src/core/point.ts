export class Point {
  x: number;
  y: number;

  constructor(point: Point);
  constructor(x: number, y: number)
  constructor(...args: any) {
    this.x = args[0].x ?? args[0];
    this.y = args[0].y ?? args[1];
  }

  times(multiplier: number) {
    this.x *= multiplier;
    this.y *= multiplier;
    return this;
  }

  plus(val: number): Point;
  plus(x: number, y: number): Point;
  plus(xOrVal: number, y?: number) {
    this.x += xOrVal;
    this.y += y ?? xOrVal;
    return this;
  }

  static AngleBetweenTwo(point1: Point, point2: Point) {
    const dy = point1.y - point2.y;
    const dx = point1.x - point2.x;
    let theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    return theta;
  }

  static DistanceBetweenTwo(point1: Point, point2: Point) {
    return Math.sqrt((point1.x - point2.x) * (point1.x - point2.x) + (point1.y - point2.y) * (point1.y - point2.y));
  }
}
