import { assetEngine } from "./core/asset-engine-instance";
import { doTimes } from "./core/timing-helpers";

interface BackgroundPosition {
  top: number;
  middle: number;
  bottom: number;
}

let backgroundNumber = 2;
const
  J = JSON,
  deepCopy = (toCopy: any) => J.parse(J.stringify(toCopy)),
  N = Number,
  isInt = N.isInteger,
  positions: { left: BackgroundPosition, right: BackgroundPosition }[] = [],
  tempBackgroundLocations = [0, 0, 0],

  resetPositions = () => {
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
    doTimes(3,(i: number) => positions[i] = deepCopy(startingPosition));
  },

  updateGameCanvas = (layerNumber: number, yPos: number, isRightSide = false) => {
    const context = assetEngine.drawEngine.getContext();
    const layerCanvas = assetEngine.drawEngine.getBackgroundLayerCanvas(layerNumber);
    context.save();
    context.scale(4, 4);
    if (assetEngine.drawEngine.backgrounds[backgroundNumber][layerNumber].isSemiTransparent) {
      context.globalAlpha = 0.65;
    }
    if (isRightSide) {
      context.scale(-1, 1);
      context.drawImage(layerCanvas, -248, yPos, 128, 256);
    } else {
      context.drawImage(layerCanvas, -8, yPos, 128, 256);
    }
    context.restore();
  };

export const backgroundManager = {
  resetPositions,
  updateGameCanvas,

  loadBackgrounds(aBackgroundNumber: number) {
    resetPositions();
    backgroundNumber = aBackgroundNumber;
    assetEngine.drawEngine.drawBackgroundLayerToBackgroundCanvases(backgroundNumber);
  },

  updateBackgrounds() {
    tempBackgroundLocations[0] += 0.5;
    tempBackgroundLocations[1] += 1;
    tempBackgroundLocations[2] += 2;

    doTimes(3, (i: number) => {
      const position = positions[i];

      for (const horizontalPosition in position) {
        // @ts-ignore
        for (const verticalPosition in position[horizontalPosition]) {
          // @ts-ignore
          updateGameCanvas(i, position[horizontalPosition][verticalPosition], horizontalPosition === 'right');

          if (isInt(tempBackgroundLocations[i])) {
            // @ts-ignore
            position[horizontalPosition][verticalPosition] = position[horizontalPosition][verticalPosition] + tempBackgroundLocations[i];
          }

          // @ts-ignore
          if (position[horizontalPosition][verticalPosition] === 512) {
            // @ts-ignore
            position[horizontalPosition][verticalPosition] = -256;
          }
        }
      }

      if (isInt(tempBackgroundLocations[i])) {
        tempBackgroundLocations[i] = 0;
      }
    });
  }
};
