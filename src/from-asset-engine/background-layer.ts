export class BackgroundLayer {
  spriteStartOffset = 0;
  isSemiTransparent = false;
  sprites: { position: number, spriteIndex: number }[] = []; // max length of 32, position must be between 0 and 32

  constructor(spriteStartOffset?: number, isSemiTransparent?: boolean | number) {
    this.spriteStartOffset = spriteStartOffset ?? 0;
    this.isSemiTransparent = !!isSemiTransparent;
  }
}