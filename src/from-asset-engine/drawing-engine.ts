import { chunkArrayInGroups } from "./game-asset-unpacker";
import { SpriteTile } from "./sprite-tile.model";
import { Sprite } from "./sprite.model";

export class DrawingEngine {
  private tileSize = 16;
  constructor(private palettes: string[][], private tiles: number[][],  private sprites: Sprite[], private canvasContext: CanvasRenderingContext2D) {}

  getContext(): CanvasRenderingContext2D {
    return this.canvasContext;
  }

  clearContext(): void {
    this.canvasContext.clearRect(0, 0, 320, 240);
  }

  tileToImageData(tile: number[], palette: string[]): ImageData {
    const imageData = new ImageData(this.tileSize, this.tileSize);

    tile.forEach((pixelValue, index) => {
      const imageDataIndex = index * 4;
      const colorString = palette[pixelValue];
      const red = parseInt(colorString.substr(1, 2), 16);
      const green = parseInt(colorString.substr(3, 2), 16);
      const blue = parseInt(colorString.substr(5, 2), 16);
      imageData.data[imageDataIndex] = red;
      imageData.data[imageDataIndex + 1] = green;
      imageData.data[imageDataIndex + 2] = blue;
      imageData.data[imageDataIndex + 3] = (colorString === '#000000' && pixelValue === 0) ? 0 : 255;
    });

    return imageData;
  }

  drawSpriteToCanvas(spriteNumber: number, positionX: number, positionY: number) {
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

      if (index === 0) {
        this.canvasContext.putImageData(imageData, positionX, positionY);
      } else if (index === 1 && sprite.width === 1) {
        this.canvasContext.putImageData(imageData, positionX, positionY + this.tileSize);
      } else if (index === 1 && sprite.width === 2) {
        this.canvasContext.putImageData(imageData, positionX + this.tileSize, positionY);
      } else if (index === 2) {
        this.canvasContext.putImageData(imageData, positionX, positionY + this.tileSize);
      } else if (index === 3) {
        this.canvasContext.putImageData(imageData, positionX + this.tileSize, positionY + this.tileSize);
      }

    });
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

