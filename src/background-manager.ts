import { assetEngine } from "./core/asset-engine-instance";
import { doTimes } from "./core/timing-helpers";

interface BackgroundPosition {
  top: number;
  middle: number;
  bottom: number;
}

class BackgroundManager {
  positions: { left: BackgroundPosition, right: BackgroundPosition }[] = [];
  backgroundNumber = 2;

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

  private tempBackgroundLocations = [0, 0, 0];

  updateBackgrounds() {
    this.tempBackgroundLocations[0] += 0.5;
    this.tempBackgroundLocations[1] += 1;
    this.tempBackgroundLocations[2] += 2;

    doTimes(3, (i: number) => {
      const position = this.positions[i];

      for (const horizontalPosition in position) {
        // @ts-ignore
        for (const verticalPosition in position[horizontalPosition]) {
          // @ts-ignore
          this.updateGameCanvas(i, position[horizontalPosition][verticalPosition], horizontalPosition === 'right');

          if (Number.isInteger(this.tempBackgroundLocations[i])) {
            // @ts-ignore
            position[horizontalPosition][verticalPosition] = position[horizontalPosition][verticalPosition] + this.tempBackgroundLocations[i];
          }


          // @ts-ignore
          if (position[horizontalPosition][verticalPosition] === 512) {
            // @ts-ignore
            position[horizontalPosition][verticalPosition] = -256;
          }
        }

      }

      if (Number.isInteger(this.tempBackgroundLocations[i])) {
        this.tempBackgroundLocations[i] = 0;
      }
    });
  }

  private updateGameCanvas(layerNumber: number, yPos: number, isRightSide = false) {
    const context = assetEngine.drawEngine.getContext();
    const layerCanvas = assetEngine.drawEngine.getBackgroundLayerCanvas(layerNumber);
    context.save();
    context.scale(4, 4);
    if (assetEngine.drawEngine.backgrounds[this.backgroundNumber][layerNumber].isSemiTransparent) {
      context.globalAlpha = 0.65;
    }
    if (isRightSide) {
      context.scale(-1, 1);
      context.drawImage(layerCanvas, -248, yPos, 128, 256);
    } else {
      context.drawImage(layerCanvas, -8, yPos, 128, 256);
    }
    context.restore();
  }
}

export const backgroundManager = new BackgroundManager();