export class BackgroundLayer {
  isSemiTransparent = false;
  sprites: { position: number, spriteIndex: number }[] = [];
  constructor(isSemiTransparent?: boolean | number) {
    this.isSemiTransparent = !!isSemiTransparent;
  }
}
