import { unpackGameAssets } from "../from-asset-engine/game-asset-unpacker";
import { initializeMusicEngine } from "../from-asset-engine/music-engine";
import { SfxEngine } from "../from-asset-engine/sfx-engine";
import { Level } from "../levels/level";
import {EffectEngine} from "../from-asset-engine/effect-engine.model";
import { drawEngine, initializeDrawEngine } from "../from-asset-engine/drawing-engine";

export let assetEngine: { drawEngine: any, musicEngine: any, sfxEngine: SfxEngine, levels: Level[], resetLevels: () => void, effectEngine: EffectEngine  };
let assetFile: ArrayBuffer;

export async function initializeAssetEngine(canvas: HTMLCanvasElement) {
  assetFile = await getFileFromServer('./a.assets');
  const assets = unpackGameAssets(assetFile);
  initializeDrawEngine(assets.paletteAsset.data,
    assets.tileAsset.data,
    assets.spriteAsset.data,
    assets.backgroundAsset.data,
    canvas);

  assetEngine = {
    drawEngine,
    musicEngine: initializeMusicEngine(assets.songsAsset.data),
    sfxEngine: new SfxEngine(assets.soundEffectsAsset.data),
    levels: assets.levelsAsset.data,
    resetLevels() {
      this.levels = unpackGameAssets(assetFile).levelsAsset.data;
    },
    effectEngine: new EffectEngine()
  };
}

const getFileFromServer = (url: string): Promise<ArrayBuffer> => {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.responseType = "arraybuffer";
  return new Promise(resolve => {
    xhr.onload = () => resolve(xhr.response);
    xhr.send();
  });
}
