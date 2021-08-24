import { chunkArrayInGroups } from "./game-asset-unpacker";
import { SpriteTile } from "./sprite-tile.model";
import { Sprite } from "./sprite.model";
import { BackgroundLayer } from "./background-layer";

export class DrawingEngine {
  private tileSize = 16;
  private canvasContext: CanvasRenderingContext2D;
  private readonly width = 240;
  private readonly height = 320;
  private offscreenCanvases: HTMLCanvasElement[] = [];
  private offscreenContexts: CanvasRenderingContext2D[] = [];

  constructor(
    private palettes: string[][],
    private tiles: number[][],
    private sprites: Sprite[],
    public backgrounds: BackgroundLayer[][],
    private canvas: HTMLCanvasElement,
  ) {
    this.canvasContext = canvas.getContext('2d')!;
    this.canvasContext.imageSmoothingEnabled = false;

    document.querySelectorAll<HTMLCanvasElement>('.oc').forEach(e => {
      this.offscreenCanvases.push(e);
      const c = e!.getContext('2d')!
      c.imageSmoothingEnabled = false;
      this.offscreenContexts.push(c);
    });
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getContext(): CanvasRenderingContext2D {
    return this.canvasContext;
  }

  getScreenWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  clearContext(): void {
    this.canvasContext.clearRect(0, 0, this.width, this.height);
  }

  tileToImageData(tile: number[], palette: string[]): ImageData {
    const imageData = new ImageData(this.tileSize, this.tileSize);

    tile.forEach((pixelValue, index) => {
      const imageDataIndex = index * 4;
      const colorString = palette[pixelValue];
      const red = parseInt(colorString.substr(1, 2), 16);
      const green = parseInt(colorString.substr(3, 2), 16);
      const blue = parseInt(colorString.substr(5, 2), 16);
      let alpha = 255;
      if (pixelValue === 15 && colorString === '#000000') {
        alpha = 140;
      } else if (pixelValue === 0 && colorString === '#000000') {
        alpha = 0;
      }

      imageData.data[imageDataIndex] = red;
      imageData.data[imageDataIndex + 1] = green;
      imageData.data[imageDataIndex + 2] = blue;
      imageData.data[imageDataIndex + 3] = alpha;
    });

    return imageData;
  }

  loadSpritesToSpriteCanvas() {
    this.sprites.forEach((sprite, index) => {
      this.drawSpriteToCanvas(index, index * 32, 0, 3);
    });
  }

  drawSprite(spriteNumber: number, positionX: number, positionY: number) {
    const sprite = this.sprites[spriteNumber];
    const canvas = this.offscreenCanvases[3];
    this.canvasContext.drawImage(canvas, spriteNumber * 32, 0, sprite.width * 16, sprite.height * 16, positionX, positionY, sprite.width * 16, sprite.height * 16);
  }

  private drawSpriteToCanvas(spriteNumber: number, positionX: number, positionY: number, ocContextNumber?: number) {
    const sprite = this.sprites[spriteNumber];
    sprite.spriteTiles.forEach((spriteTile: SpriteTile, index: number) => {
      const tile = this.tiles[spriteTile.tileNumber];
      const palette = this.palettes[sprite.paletteNumber];

      let imageData = this.tileToImageData(tile, palette);
      if (spriteTile.isFlippedX) {
        imageData = this.flipImageDataHorizontally(imageData);
      }
      if (spriteTile.isFlippedY) {
        imageData = this.flipImageDataVertically(imageData);
      }

      let context = this.canvasContext;

      if (ocContextNumber !== undefined) {
        context = this.offscreenContexts[ocContextNumber];
      }

      if (index === 0) {
        context.putImageData(imageData, positionX, positionY);
      } else if (index === 1 && sprite.width === 1) {
        context.putImageData(imageData, positionX, positionY + this.tileSize);
      } else if (index === 1 && sprite.width === 2) {
        context.putImageData(imageData, positionX + this.tileSize, positionY);
      } else if (index === 2) {
        context.putImageData(imageData, positionX, positionY + this.tileSize);
      } else if (index === 3) {
        context.putImageData(imageData, positionX + this.tileSize, positionY + this.tileSize);
      }
    });
  }

  drawBackgroundLayerToBackgroundCanvases(backgroundIndex: number) {
    for (let i = 0; i < 3; i++) {
      this.offscreenContexts[i].clearRect(0, 0, 128, 256);
      const backgroundLayer = this.backgrounds[backgroundIndex][i];

      backgroundLayer.sprites.forEach(sprite => {
        const gridX = sprite.position % 4;
        const gridY = Math.floor(sprite.position / 4);
        this.drawSpriteToCanvas(backgroundLayer.spriteStartOffset + sprite.spriteIndex, gridX * 32, gridY * 32, i);
      });
    }
  }

  getBackgroundLayerCanvas(backgroundIndex: number) {
    return this.offscreenCanvases[backgroundIndex];
  }

  flipImageDataHorizontally(imageData: ImageData): ImageData {
    const flippedImageData = new ImageData(imageData.width, imageData.height);
    const chunked = chunkArrayInGroups(imageData.data, this.tileSize * 4);
    let imageDataIndex = 0;
    chunked.forEach(imageRow => {
      for (let i = imageRow.length - 4; i >= 0; i -= 4) {
        flippedImageData.data[imageDataIndex] = imageRow[i];
        flippedImageData.data[imageDataIndex + 1] = imageRow[i + 1];
        flippedImageData.data[imageDataIndex + 2] = imageRow[i + 2];
        flippedImageData.data[imageDataIndex + 3] = imageRow[i + 3];
        imageDataIndex += 4;
      }
    });

    return flippedImageData;
  }

  flipImageDataVertically(imageData: ImageData): ImageData {
    const flippedImageData = new ImageData(imageData.width, imageData.height);
    const chunked = chunkArrayInGroups(imageData.data, this.tileSize * 4);
    chunked.reverse();
    let imageDataIndex = 0;
    chunked.forEach(imageRow => {
      for (let i = 0; i < imageRow.length; i+= 4) {
        flippedImageData.data[imageDataIndex] = imageRow[i];
        flippedImageData.data[imageDataIndex + 1] = imageRow[i + 1];
        flippedImageData.data[imageDataIndex + 2] = imageRow[i + 2];
        flippedImageData.data[imageDataIndex + 3] = imageRow[i + 3];
        imageDataIndex += 4;
      }
    });

    return flippedImageData;
  }
}

