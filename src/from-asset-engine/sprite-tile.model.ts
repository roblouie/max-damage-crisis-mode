export class SpriteTile {
  isFlippedX: boolean;
  isFlippedY: boolean;
  tileNumber: number;

  constructor(isFlippedX: boolean, isFlippedY: boolean, tileNumber: number) {
    this.isFlippedX = isFlippedX;
    this.isFlippedY = isFlippedY;
    this.tileNumber = tileNumber;
  }
}
