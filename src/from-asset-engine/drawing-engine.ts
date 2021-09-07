import { chunkArrayInGroups } from "./game-asset-unpacker";
import { SpriteTile } from "./sprite-tile.model";
import { Sprite } from "./sprite.model";
import { BackgroundLayer } from "./background-layer";
import { split24Bit } from "../core/binary-helperts";
import {doTimes, runOnce} from "../core/timing-helpers";
import { assetEngine } from "../core/asset-engine-instance";
import {controls} from "../core/controls";

export class DrawingEngine {
  sprites: Sprite[];
  private tileSize = 16;
  private canvasContext: CanvasRenderingContext2D;
  private readonly width = 960;
  private readonly height = 1280;
  private readonly renderMultiplier = 4;
  private offscreenCanvases: HTMLCanvasElement[] = [];
  private offscreenContexts: CanvasRenderingContext2D[] = [];

  constructor(
    private palettes: number[][],
    private tiles: number[][],
    sprites: Sprite[],
    public backgrounds: BackgroundLayer[][],
    private canvas: HTMLCanvasElement,
  ) {
    this.sprites = sprites;
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

  getScreenHeight(): number {
    return this.height;
  }

  getRenderMultiplier(): number {
    return this.renderMultiplier;
  }

  clearContext(): void {
    this.canvasContext.clearRect(0, 0, this.width, this.height);
  }

  drawText(text: string, fontSize: number, x: number, y: number, color = 'white', textAlign: 'center' | 'left' | 'right' = 'center') {
    const context = this.canvasContext;
    context.save();
    const scale = assetEngine.drawEngine.getRenderMultiplier();
    context.font = `${fontSize}px Impact, sans-serif-black`;
    context.textAlign = textAlign;
    context.strokeStyle = 'black';
    context.lineWidth = 4;
    context.strokeText(text, x * scale, y * scale);
    context.fillStyle = color;
    context.fillText(text, x * scale, y * scale);
    context.restore();
  }

  drawMenu(startPositionY: number, options: string[], callback: (arg0: number) => void) {
    options.forEach((option, index) => {
      this.drawText(option, 40,120,startPositionY + (index * 25))
    })

    controls.onClick((position) => callback(Math.ceil((position.y - startPositionY) / 25)))
  }

  tileToImageData(tile: number[], palette: number[]): ImageData {
    const imageData = new ImageData(this.tileSize, this.tileSize);

    tile.forEach((pixelValue, index) => {
      const imageDataIndex = index * 4;
      const color = palette[pixelValue];
      let alpha = 255;
      if (pixelValue === 0 && color === 0) {
        alpha = 0;
      }

      const [blue, green, red] = split24Bit(color, 8, 16);
      imageData.data[imageDataIndex] = red;
      imageData.data[imageDataIndex + 1] = green;
      imageData.data[imageDataIndex + 2] = blue;
      imageData.data[imageDataIndex + 3] = alpha;
    });

    return imageData;
  }

  loadSpritesToSpriteCanvas() {
    doTimes(this.sprites.length, (i: number) => {
      this.drawSpriteToCanvas(i, i * 32, 0, 3);
    });
  }

  drawSprite(spriteNumber: number, positionX: number, positionY: number) {
    const sprite = this.sprites[spriteNumber];
    const canvas = this.offscreenCanvases[3];
    this.canvasContext.save();
    this.canvasContext.scale(4, 4);
    this.canvasContext.drawImage(canvas, spriteNumber * 32, 0, sprite.width * 16, sprite.height * 16, positionX, positionY, sprite.width * 16, sprite.height * 16);
    this.canvasContext.restore();
  }

  private drawSpriteToCanvas(spriteNumber: number, positionX: number, positionY: number, ocContextNumber?: number) {
    const sprite = this.sprites[spriteNumber];
    sprite.spriteTiles.forEach((spriteTile: SpriteTile, index: number) => {
      const tile = this.tiles[spriteTile.tileNumber];
      const palette = this.palettes[sprite.paletteNumber];

      let imageData = this.tileToImageData(tile, palette);
      //TODO: See if this can be replaced with canvas flipping, as I could then remove flipImageData methods
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
    doTimes(3, (i: number) => {
      this.offscreenContexts[i].clearRect(0, 0, 128, 256);
      const backgroundLayer = this.backgrounds[backgroundIndex][i];

      backgroundLayer.sprites.forEach(sprite => {
        const gridX = sprite.position % 4;
        const gridY = Math.floor(sprite.position / 4);
        this.drawSpriteToCanvas(backgroundLayer.spriteStartOffset + sprite.spriteIndex, gridX * 32, gridY * 32, i);
      });
    });
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
