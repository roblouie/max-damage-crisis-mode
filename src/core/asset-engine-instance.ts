import { unpackGameAssets } from "../from-asset-engine/game-asset-unpacker";
import { DrawingEngine } from "../from-asset-engine/drawing-engine";

export let assetEngine: { drawEngine: DrawingEngine };

export async function initializeAssetEngine(canvasContext: CanvasRenderingContext2D) {
  const assetFile = await getFileFromServer('./a');
  const assets = unpackGameAssets(assetFile);
  const context = document.querySelector('canvas')!.getContext('2d')!;
  context.imageSmoothingEnabled = false;

  assetEngine = {
    drawEngine: new DrawingEngine(assets.paletteAsset.data, assets.tileAsset.data, assets.spriteAsset.data, canvasContext)
  };
}

function getFileFromServer(url: string): Promise<ArrayBuffer> {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.responseType = "arraybuffer";
  return new Promise((resolve, reject) => {
    xhr.onload = function () {
      if (this.status === 200) {
        resolve(xhr.response)
      } else {
        reject(xhr.response);
      }
    };
    xhr.send();
  });
}