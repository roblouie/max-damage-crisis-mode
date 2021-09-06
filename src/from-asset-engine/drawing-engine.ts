import { chunkArrayInGroups } from "./game-asset-unpacker";
import { SpriteTile } from "./sprite-tile.model";
import { Sprite } from "./sprite.model";
import { BackgroundLayer } from "./background-layer";
import { split24Bit } from "../core/binary-helperts";
import { doTimes } from "../core/timing-helpers";
import { assetEngine } from "../core/asset-engine-instance";

let sprites: Sprite[],
  tileSize = 16,
  canvasContext: CanvasRenderingContext2D,
  width = 960,
  height = 1280,
  renderMultiplier = 4,
  offscreenCanvases: HTMLCanvasElement[] = [],
  offscreenContexts: CanvasRenderingContext2D[] = [],
  palettes: number[][],
  tiles: number[][],
  backgrounds: BackgroundLayer[][] =[],
  canvas: HTMLCanvasElement;

export const initializeDrawEngine = (aPalettes: number[][], aTiles: number[][], aSprites: Sprite[], aBackgrounds: BackgroundLayer[][], aCanvas: HTMLCanvasElement) => {
  palettes = aPalettes;
  tiles = aTiles;
  sprites = aSprites;
  backgrounds = aBackgrounds;
  canvas = aCanvas;
  canvasContext = aCanvas.getContext('2d')!;
  canvasContext.imageSmoothingEnabled = false;

  [...document.querySelectorAll<HTMLCanvasElement>('.oc')].forEach(e => {
    offscreenCanvases.push(e);
    const c = e!.getContext('2d')!
    c.imageSmoothingEnabled = false;
    offscreenContexts.push(c);
  });

  drawEngine = {
    backgrounds,
    sprites,
    getCanvas: () => canvas,
    getContext: () => canvasContext,
    getScreenWidth: () => width,
    getScreenHeight: () => height,
    getRenderMultiplier: () => renderMultiplier,
    clearContext() {
      canvasContext.clearRect(0, 0, width, height);
    },
    drawText(text: string, fontSize: number, x: number, y: number, color = 'white', textAlign: 'center' | 'left' | 'right' = 'center') {
      canvasContext.save();
      canvasContext.font = `${fontSize}px Impact, sans-serif-black`;
      canvasContext.textAlign = textAlign;
      canvasContext.strokeStyle = 'black';
      canvasContext.lineWidth = 4;
      canvasContext.strokeText(text, x * renderMultiplier, y * renderMultiplier);
      canvasContext.fillStyle = color;
      canvasContext.fillText(text, x * renderMultiplier, y * renderMultiplier);
      canvasContext.restore();
    },
    loadSpritesToSpriteCanvas() {
      doTimes(sprites.length, (i: number) => {
        drawSpriteToCanvas(i, i * 32, 0, 3);
      });
    },
    drawSprite(spriteNumber: number, positionX: number, positionY: number) {
      const sprite = sprites[spriteNumber];
      const canvas = offscreenCanvases[3];
      canvasContext.save();
      canvasContext.scale(4, 4);
      canvasContext.drawImage(canvas, spriteNumber * 32, 0, sprite.width * 16, sprite.height * 16, positionX, positionY, sprite.width * 16, sprite.height * 16);
      canvasContext.restore();
    },
    drawBackgroundLayerToBackgroundCanvases(backgroundIndex: number) {
      doTimes(3, (i: number) => {
        offscreenContexts[i].clearRect(0, 0, 128, 256);
        const backgroundLayer = backgrounds[backgroundIndex][i];

        backgroundLayer.sprites.forEach(sprite => {
          const gridX = sprite.pos % 4;
          const gridY = Math.floor(sprite.pos / 4);
          drawSpriteToCanvas(backgroundLayer.spriteStartOffset + sprite.spriteIndex, gridX * 32, gridY * 32, i);
        });
      });
    },
    getBackgroundLayerCanvas(backgroundIndex: number) {
      return offscreenCanvases[backgroundIndex];
    }
  };
}

export let drawEngine: { sprites: Sprite[], backgrounds: BackgroundLayer[][]; getCanvas: () => HTMLCanvasElement; getContext: () => CanvasRenderingContext2D; getScreenWidth: () => number; getScreenHeight: () => number; getRenderMultiplier: () => number; clearContext(): void; drawText(text: string, fontSize: number, x: number, y: number, color?: string, textAlign?: "center" | "left" | "right"): void; loadSpritesToSpriteCanvas(): void; drawSprite(spriteNumber: number, positionX: number, positionY: number): void; drawBackgroundLayerToBackgroundCanvases(backgroundIndex: number): void; getBackgroundLayerCanvas(backgroundIndex: number): HTMLCanvasElement; };

function tileToImageData(tile: number[], palette: number[]): ImageData {
  const imageData = new ImageData(tileSize, tileSize);

  tile.forEach((pixelValue, index) => {
    const imageDataIndex = index * 4;
    const color = palette[pixelValue];
    let alpha = 255;
    if (pixelValue === 15 && color === 0) {
      alpha = 140;
    } else if (pixelValue === 0 && color === 0) {
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

function drawSpriteToCanvas(spriteNumber: number, positionX: number, positionY: number, ocContextNumber?: number) {
  const sprite = sprites[spriteNumber];
  sprite.spriteTiles.forEach((spriteTile: SpriteTile, index: number) => {
    const tile = tiles[spriteTile.tileNumber];
    const palette = palettes[sprite.paletteNumber];

    let imageData = tileToImageData(tile, palette);
    //TODO: See if this can be replaced with canvas flipping, as I could then remove flipImageData methods
    if (spriteTile.isFlippedX) {
      imageData = flipImageDataHorizontally(imageData);
    }
    if (spriteTile.isFlippedY) {
      imageData = flipImageDataVertically(imageData);
    }

    let context = canvasContext;

    if (ocContextNumber !== undefined) {
      context = offscreenContexts[ocContextNumber];
    }

    if (index === 0) {
      context.putImageData(imageData, positionX, positionY);
    } else if (index === 1 && sprite.width === 1) {
      context.putImageData(imageData, positionX, positionY + tileSize);
    } else if (index === 1 && sprite.width === 2) {
      context.putImageData(imageData, positionX + tileSize, positionY);
    } else if (index === 2) {
      context.putImageData(imageData, positionX, positionY + tileSize);
    } else if (index === 3) {
      context.putImageData(imageData, positionX + tileSize, positionY + tileSize);
    }
  });
}

function flipImageDataHorizontally(imageData: ImageData): ImageData {
  const flippedImageData = new ImageData(imageData.width, imageData.height);
  const chunked = chunkArrayInGroups(imageData.data, tileSize * 4);
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

function flipImageDataVertically(imageData: ImageData): ImageData {
  const flippedImageData = new ImageData(imageData.width, imageData.height);
  const chunked = chunkArrayInGroups(imageData.data, tileSize * 4);
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
