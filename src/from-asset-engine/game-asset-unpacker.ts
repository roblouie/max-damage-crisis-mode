import { Sprite } from "./sprite.model";
import { SpriteTile } from "./sprite-tile.model";
import { BackgroundLayer } from "./background-layer";
import { Song } from "./song.model";
import { Track } from "./track.model";
import { NotePosition } from "./note-position.model";
import {SoundEffect} from "./sound-effect.model";
import { split16Bit, splitByte } from "../core/binary-helperts";
import { SwoopEnemy } from "../enemies/swoop-enemy";
import { ScreenEdgeBounceEnemy } from "../enemies/screen-edge-bounce-enemy";
import { WaveEnemy } from "../enemies/wave-enemy";
import { PauseEnemy } from "../enemies/pause-enemy";
import { StraightEnemy } from "../enemies/straight-enemy";
import { EnemyWave } from "../levels/enemy-wave";
import { Level } from "../levels/level";
import { doTimes } from "../core/timing-helpers";

interface UnpackedAsset {
  data: any;
  finalByteIndex: number;
}

export function unpackGameAssets(arrayBuffer: ArrayBuffer) {
  const paletteAsset = bytesToPalettes(arrayBuffer, 0);
  const tileAsset = bytesToTiles(arrayBuffer, paletteAsset.finalByteIndex);
  const spriteAsset = bytesToSprites(arrayBuffer, tileAsset.finalByteIndex);
  const backgroundAsset = bytesToBackgrounds(arrayBuffer, spriteAsset.finalByteIndex);
  const songsAsset = bytesToSongs(arrayBuffer, backgroundAsset.finalByteIndex);
  const soundEffectsAsset = bytesToSoundEffects(arrayBuffer, songsAsset.finalByteIndex);
  const levelsAsset = bytesToLevels(arrayBuffer, soundEffectsAsset.finalByteIndex);

  return {
    paletteAsset,
    tileAsset,
    spriteAsset,
    backgroundAsset,
    songsAsset,
    soundEffectsAsset,
    levelsAsset,
  };
}

function bytesToPalettes(arrayBuffer: ArrayBuffer, startingOffset = 0): UnpackedAsset {
  const dataView = new DataView(arrayBuffer, startingOffset);
  const numberOfPalettes = dataView.getUint8(0);
  const paletteSize = 16 * 3; // sixteen colors, three bytes per color
  const totalPalettesByteSize = (numberOfPalettes * paletteSize) + 1;

  const palettes = [];

  for (let byteOffset = 1; byteOffset < totalPalettesByteSize; byteOffset += 3) {
    // @ts-ignore
    palettes.push(parseInt(dataView.getUint32(byteOffset) / 256));
  }

  const paletteData = chunkArrayInGroups(palettes, 16);

  return {
    data: paletteData,
    finalByteIndex: startingOffset + totalPalettesByteSize,
  };
}

function bytesToTiles(arrayBuffer: ArrayBuffer, startingOffset: number): UnpackedAsset {
  const dataView = new DataView(arrayBuffer, startingOffset);
  const numberOfTiles = dataView.getUint8(0);
  const totalTilesByteSize = (numberOfTiles * 128) + 1;

  const rawTileValues: number[] = [];

  for (let byteOffset = 1; byteOffset < totalTilesByteSize; byteOffset++) {
    rawTileValues.push(...splitByte(dataView.getUint8(byteOffset), 4));
  }

  const tileData = chunkArrayInGroups(rawTileValues, 256);

  return {
    data: tileData,
    finalByteIndex: startingOffset + totalTilesByteSize,
  };
}

function bytesToSprites(arrayBuffer: ArrayBuffer, startingOffset: number): UnpackedAsset {
  const dataView = new DataView(arrayBuffer, startingOffset);
  const numberOfSprites = dataView.getUint8(0);

  let bytePosition = 1;
  const sprites: Sprite[] = [];

  doTimes(numberOfSprites, () => {
    // @ts-ignore
    const sprite = new Sprite(...splitByte(dataView.getUint8(bytePosition++), 6));
    doTimes(sprite.spriteTiles.length, (i: number) => {
      const value = dataView.getUint16(bytePosition);
      bytePosition += 2;
      const [flippedYBit, flippedXBit, _, tileNumber] = split16Bit(value, 1, 2, 8);
      sprite.spriteTiles[i] = new SpriteTile(!!flippedXBit, !!flippedYBit, tileNumber);
    });

    sprites.push(sprite);
  });

  return {
    data: sprites,
    finalByteIndex: startingOffset + bytePosition,
  };
}

function bytesToBackgrounds(arrayBuffer: ArrayBuffer, startingOffset: number): UnpackedAsset {
    const dataView = new DataView(arrayBuffer, startingOffset);
    const numberOfBackgroundLayers = dataView.getUint8(0) * 3;
    let bytePosition = 1;
    const backgroundLayers: BackgroundLayer[] = [];

    doTimes(numberOfBackgroundLayers, () => {
      const value = dataView.getUint16(bytePosition, true);
      const [numberOfSpritesInBackground, spriteStartIndex, isSemiTransparent] = split16Bit(value, 8, 15);
      bytePosition += 2;

      const backgroundLayer = new BackgroundLayer();
      backgroundLayer.spriteStartOffset = spriteStartIndex;
      backgroundLayer.isSemiTransparent = isSemiTransparent === 1;

      doTimes(numberOfSpritesInBackground, () => {
        const spriteByte = dataView.getUint8(bytePosition++);
        const [spriteIndex, position] = splitByte(spriteByte, 3);
        backgroundLayer.sprites.push({ position, spriteIndex });
      });

      backgroundLayers.push(backgroundLayer);
    });

    const groupedByLayer = chunkArrayInGroups(backgroundLayers, 3);

    groupedByLayer.forEach(layer => {
      if (layer.length === 1) {
        layer.push(new BackgroundLayer(), new BackgroundLayer());
      } else if (layer.length === 2) {
        layer.push(new BackgroundLayer());
      }
    });

    return {
      data: groupedByLayer,
      finalByteIndex: startingOffset + bytePosition,
    };
}

const waves = [
  'sawtooth',
  'sine',
  'square',
  'triangle',
] as any;

function bytesToSongs(arrayBuffer: ArrayBuffer, startingOffset: number): UnpackedAsset {
  const dataView = new DataView(arrayBuffer, startingOffset);
  const numberOfSongs = dataView.getUint8(0);

  let bytePosition = 1;
  const songs: Song[] = [];

  doTimes(numberOfSongs, () => {
    const [numberOfTracks, tempo] = split16Bit(dataView.getUint16(bytePosition), 8);
    bytePosition += 2;

    const tracks: Track[] = [];
    doTimes(numberOfTracks, () => {
      const [numberOfPitches, waveformIndex] = splitByte(dataView.getUint8(bytePosition++), 4);

      const waveform = waves.find((wave: any, index: number) => index === waveformIndex);

      const pitches: number[] = [];

      doTimes(numberOfPitches + 1, () => {
        pitches.push(dataView.getUint16(bytePosition));
        bytePosition += 2;
      });

      const numberOfNotes = dataView.getUint8(bytePosition++);

      const notes: NotePosition[] = [];
      let startPosition = 0;

      doTimes(numberOfNotes, () => {
        const [noteLength, pitchIndex] = splitByte(dataView.getUint8(bytePosition++), 4);

        if (pitchIndex !== 0) {
          const frequency = pitches[pitchIndex];

          notes.push({
            frequency,
            startPosition,
            duration: noteLength + 1,
          });
        }
        startPosition += noteLength + 1;
      });

      tracks.push({ wave: waveform, notes: notes });
    });

    songs.push(new Song(tempo, tracks));
  });

  return {
    data: songs,
    finalByteIndex: startingOffset + bytePosition,
  };
}

function bytesToSoundEffects(arrayBuffer: ArrayBuffer, startingOffset: number): UnpackedAsset {
  const dataView = new DataView(arrayBuffer, startingOffset);
  const numberOfSoundEffects = dataView.getUint8(0);

  let bytePosition = 1;
  const soundEffects: SoundEffect[] = [];

  doTimes(numberOfSoundEffects, () => {
    const [numberOfOtherInstructions, numberOfGainInstructions] = splitByte(dataView.getUint8(bytePosition++), 4);

    const gainInstructions: { gain: number; isWhiteNoise: boolean; timeFromLastInstruction: number; }[] = [];
    doTimes(numberOfGainInstructions, () => {
      const [timeFromLastInstruction, whiteNoiseBit, gain] = splitByte(dataView.getUint8(bytePosition++), 5, 6);
      gainInstructions.push({
        gain: gain / 3,
        isWhiteNoise: !!whiteNoiseBit,
        timeFromLastInstruction: timeFromLastInstruction / 20
      });
    })

    const widthInstructions: { timeFromLastInstruction: number; }[] = [];
    const pitchInstructions: { pitch: number; durationInSeconds: number; isLinearRampTo: boolean; }[] = [];

    doTimes(numberOfOtherInstructions, () => {
      const [pitchBytes, duration, linearRampBit, _, widthBit] = split16Bit(dataView.getUint16(bytePosition++), 8, 13, 14, 15);
      if (!!widthBit) {
        const timeFromLastInstruction = duration / 20;
        widthInstructions.push({ timeFromLastInstruction });
      } else {
        bytePosition++;
        const isLinearRampTo = !!linearRampBit;
        const durationInSeconds = duration / 20;

        const pitch = Math.pow((pitchBytes + 9), 1.7);
        pitchInstructions.push({ pitch, durationInSeconds, isLinearRampTo });
      }
    });

    soundEffects.push({ gainInstructions, widthInstructions, pitchInstructions });
  });

  return {
    data: soundEffects,
    finalByteIndex: startingOffset + bytePosition,
  };
}

function bytesToLevels(arrayBuffer: ArrayBuffer, startingOffset: number): UnpackedAsset {
  const dataView = new DataView(arrayBuffer, startingOffset);
  const numberOfLevels = dataView.getUint8(0);
  let bytePosition = 1;

  const levels: Level[] =[];

  doTimes(numberOfLevels, () => {
    const level = new Level([]);

    const numberOfWaves = dataView.getUint8(bytePosition++);

    doTimes(numberOfWaves, () => {
      const wave = new EnemyWave([]);
      const numberOfEnemies = dataView.getUint8(bytePosition++);

      doTimes(numberOfEnemies, () => {
        const data = dataView.getUint16(bytePosition);
        const [position, colorNum, typeNum] = split16Bit(data, 8, 12);
        bytePosition += 2;

        const TypeConstructor = [StraightEnemy, PauseEnemy, WaveEnemy, WaveEnemy, ScreenEdgeBounceEnemy, ScreenEdgeBounceEnemy, SwoopEnemy, SwoopEnemy][typeNum];
        wave.enemies.push(new TypeConstructor(position, colorNum, !!(typeNum % 2)));
      });

      level.enemyWaves.push(wave);
    });
    levels.push(level);
  })

  return {
    data: levels,
    finalByteIndex: bytePosition,
  };
}

export function chunkArrayInGroups(array: any[] | Uint8ClampedArray, chunkSize: number): any[] | Uint8ClampedArray[] {
  const chunkedArray = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunkedArray.push(array.slice(i, i + chunkSize));
  }
  return chunkedArray;
}