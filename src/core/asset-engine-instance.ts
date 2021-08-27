import { unpackGameAssets } from "../from-asset-engine/game-asset-unpacker";
import { DrawingEngine } from "../from-asset-engine/drawing-engine";
import { MusicEngine } from "../from-asset-engine/music-engine";
import { SfxEngine } from "../from-asset-engine/sfx-engine";

export let assetEngine: { drawEngine: DrawingEngine, musicEngine: MusicEngine, sfxEngine: SfxEngine };

export async function initializeAssetEngine(canvas: HTMLCanvasElement) {
  const assetFile = await getFileFromServer('./a');
  const assets = unpackGameAssets(assetFile);

  assetEngine = {
    drawEngine: new DrawingEngine(
      assets.paletteAsset.data,
      assets.tileAsset.data,
      assets.spriteAsset.data,
      assets.backgroundAsset.data,
      canvas
    ),
    musicEngine: new MusicEngine(assets.songsAsset.data),
    sfxEngine: new SfxEngine(assets.soundEffectsAsset.data),
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
