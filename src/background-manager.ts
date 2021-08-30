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
      top: -320,
      middle: 0,
      bottom: 320,
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

    for (let i = 0; i < 3; i++) {
      const position = this.positions[i];

        // @ts-ignore
        for (const verticalPosition in position) {
          // @ts-ignore
          this.updateGameCanvas(i, position[verticalPosition]);

          if (Number.isInteger(this.tempBackgroundLocations[i])) {
            // @ts-ignore
            position[verticalPosition] = position[verticalPosition] + this.tempBackgroundLocations[i];
          }


          // @ts-ignore
          if (position[verticalPosition] === 640) {
            // @ts-ignore
            position[verticalPosition] = -320;
          }
        }


      if (Number.isInteger(this.tempBackgroundLocations[i])) {
        this.tempBackgroundLocations[i] = 0;
      }
    }
  }

  private updateGameCanvas(layerNumber: number, yPos: number, isRightSide = false) {
    const context = assetEngine.drawEngine.getContext();
    const layerCanvas = assetEngine.drawEngine.getBackgroundLayerCanvas(layerNumber);
    context.save();
    context.scale(4, 4);
    if (assetEngine.drawEngine.backgrounds[this.backgroundNumber][layerNumber].isSemiTransparent) {
      context.globalAlpha = 0.65;
    }
    context.drawImage(layerCanvas, -8, yPos, 256, 320);
    context.restore();
  }
}

export const backgroundManager = new BackgroundManager();