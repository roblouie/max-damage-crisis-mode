import { assetEngine } from "./core/asset-engine-instance";
import { doTimes } from "./core/timing-helpers";

class BackgroundManager {
  positions: any[] = [];
  backgroundNumber = 2;

  resetPositions() {
    this.positions[0] = [[-256, 0, 256], [-128, 128, 384]];
    this.positions[1] = [[-256, 0, 256], [-128, 128, 384]];
    this.positions[2] = [[-256, 0, 256], [-128, 128, 384]];
  }


  loadBackgrounds(backgroundNumber: number) {
    this.resetPositions();
    this.backgroundNumber = backgroundNumber;
    assetEngine.drawEngine.drawBackgroundLayerToBackgroundCanvases(backgroundNumber, ['#9cd775', '#000', '#AF5F33'][backgroundNumber]);
  }

  private tempBackgroundLocations = [0, 0, 0];

  updateBackgrounds() {
    this.tempBackgroundLocations[0] += 0.5;
    this.tempBackgroundLocations[1] += 1;
    this.tempBackgroundLocations[2] += 2;

    doTimes(3, (i: number) => {
      const position = this.positions[i];

      doTimes(2, (horizontalPosition: number) => {
        // @ts-ignore
        doTimes(3, (verticalPosition: number) => {
          // @ts-ignore
          this.updateGameCanvas(i, position[horizontalPosition][verticalPosition], horizontalPosition === 1);

          if (Number.isInteger(this.tempBackgroundLocations[i])) {
            // @ts-ignore
            position[horizontalPosition][verticalPosition] = position[horizontalPosition][verticalPosition] + this.tempBackgroundLocations[i];
          }


          // @ts-ignore
          if (position[horizontalPosition][verticalPosition] === 512) {
            // @ts-ignore
            position[horizontalPosition][verticalPosition] = -256;
          }
        });
      });

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