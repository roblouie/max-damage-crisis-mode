import { unpackGameAssets } from "../from-asset-engine/game-asset-unpacker";
import { DrawingEngine } from "../from-asset-engine/drawing-engine";
import { MusicEngine } from "../from-asset-engine/music-engine";
import { SfxEngine } from "../from-asset-engine/sfx-engine";
import { Level } from "../levels/level";
import {EffectEngine} from "../from-asset-engine/effect-engine.model";

export let assetEngine: { drawEngine: DrawingEngine, musicEngine: MusicEngine, sfxEngine: SfxEngine, levels: Level[], resetLevels: () => void, effectEngine: EffectEngine  };
let assetFile: ArrayBuffer;

export async function initializeAssetEngine(canvas: HTMLCanvasElement) {
  assetFile = await getFileFromServer('./a.assets');
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
    levels: assets.levelsAsset.data,
    resetLevels() {
      this.levels = unpackGameAssets(assetFile).levelsAsset.data;
    },
    effectEngine: new EffectEngine()
  };
}

function getFileFromServer(url: string): Promise<ArrayBuffer> {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.responseType = "arraybuffer";
  return new Promise((resolve, reject) => {
    xhr.onload = () => resolve(xhr.response);
    xhr.send();
  });
}
