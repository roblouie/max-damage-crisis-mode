export class BackgroundLayer {
  spriteStartOffset = 0;
  isSemiTransparent = false;
  sprites: { position: number, spriteIndex: number }[] = []; // max length of 32, position must be between 0 and 32
}