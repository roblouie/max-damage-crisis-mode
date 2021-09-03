export class BackgroundLayer {
  spriteStartOffset = 0;
  isSemiTransparent = false;
  sprites: { position: number, spriteIndex: number }[] = [];
  constructor(isSemiTransparent?: boolean | number) {
    this.isSemiTransparent = !!isSemiTransparent;
  }
}
