import { assetEngine } from "./core/asset-engine-instance";

interface BackgroundPosition {
  top: number;
  middle: number;
  bottom: number;
}

class BackgroundManager {
  positions: { left: BackgroundPosition, right: BackgroundPosition }[] = [];
  backgroundNumber = 0;

  resetPositions() {
    const startingPosition = {
      left: {
        top: -256,
        middle: 0,
        bottom: 256,
      },
      right: {
        top: -128,
        middle: 128,
        bottom: 384,
      }
    }
    this.positions[0] = JSON.parse(JSON.stringify(startingPosition));
    this.positions[1] = JSON.parse(JSON.stringify(startingPosition));
    this.positions[2] = JSON.parse(JSON.stringify(startingPosition));
  }


  loadBackgrounds(backgroundNumber: number) {
    this.resetPositions();
    this.backgroundNumber = backgroundNumber;
    assetEngine.drawEngine.drawBackgroundLayerToBackgroundCanvases(backgroundNumber);
  }

  updateBackgrounds(interval: number) {
    //TODO: take into account the time interval so scrolling speed is consistent across refresh rates

    for (let i = 0; i < 3; i++) {
      const position = this.positions[i];

      for (const horizontalPosition in position) {
        // @ts-ignore
        for (const verticalPosition in position[horizontalPosition]) {
          // @ts-ignore
          this.updateGameCanvas(i, position[horizontalPosition][verticalPosition], horizontalPosition === 'right');
          // @ts-ignore
          position[horizontalPosition][verticalPosition] += i / 4 + 0.5;

          // @ts-ignore
          if (position[horizontalPosition][verticalPosition] === 512) {
            // @ts-ignore
            position[horizontalPosition][verticalPosition] = -256;
          }
        }

      }
    }
  }

  private updateGameCanvas(layerNumber: number, yPos: number, isRightSide = false) {
    const context = assetEngine.drawEngine.getContext();
    const layerCanvas = assetEngine.drawEngine.getBackgroundLayerCanvas(layerNumber);
    context.save();
    if (assetEngine.drawEngine.backgrounds[this.backgroundNumber][layerNumber].isSemiTransparent) {
      context.globalAlpha = 0.65;
    }
    if (isRightSide) {
      context.scale(-1, 1);
      context.drawImage(layerCanvas, -248, yPos, 128, 257);
    } else {
      context.drawImage(layerCanvas, -8, yPos, 128, 257);
    }
    context.restore();
  }
}

export const backgroundManager = new BackgroundManager();