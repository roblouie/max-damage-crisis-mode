export class BackgroundLayer {
  spriteStartOffset = 0;
  isSemiTransparent = false;
  sprites: { pos: number, spriteIndex: number }[] = [];
  constructor(isSemiTransparent?: boolean | number) {
    this.isSemiTransparent = !!isSemiTransparent;
  }
}
