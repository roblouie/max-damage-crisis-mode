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

  let spritesParsed = 0;
  let bytePosition = 1;
  const sprites: Sprite[] = [];

  while (spritesParsed < numberOfSprites) {
    // @ts-ignore
    const sprite = new Sprite(...splitByte(dataView.getUint8(bytePosition++), 6));
    for (let i = 0; i < sprite.spriteTiles.length; i++) {
      const [paletteNumber, flippedXBit, flippedYBit] = splitByte(dataView.getUint8(bytePosition++), 6, 7);
      sprite.spriteTiles[i] = new SpriteTile(!!flippedXBit, !!flippedYBit, paletteNumber);
    }

    sprites.push(sprite);
    spritesParsed++;
  }

  return {
    data: sprites,
    finalByteIndex: startingOffset + bytePosition,
  };
}

function bytesToBackgrounds(arrayBuffer: ArrayBuffer, startingOffset: number): UnpackedAsset {
  const dataView = new DataView(arrayBuffer, startingOffset);
  const numberOfBackgrounds = dataView.getUint8(0);
  const numberOfBackgroundLayers = numberOfBackgrounds * 3;

  let backgroundsParsed = 0;
  let bytePosition = 1;
  const backgroundLayers: BackgroundLayer[] = [];

  while (backgroundsParsed < numberOfBackgroundLayers) {
    const [numberOfSpritesInBackground, semiTransparent] = split16Bit(dataView.getUint16(bytePosition, true), 8);
    bytePosition += 2;
    const backgroundLayer = new BackgroundLayer(semiTransparent);

    for (let i = 0; i < numberOfSpritesInBackground; i++) {
      const [spriteIndex, position] = split16Bit(dataView.getUint16(bytePosition), 8);
      bytePosition += 2;
      backgroundLayer.sprites.push({ position, spriteIndex });
    }

    backgroundLayers.push(backgroundLayer);
    backgroundsParsed++;
  }

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
  let songsParsed = 0;
  const songs: Song[] = [];

  while (songsParsed < numberOfSongs) {
    const [numberOfTracks, tempo] = split16Bit(dataView.getUint16(bytePosition), 8);
    bytePosition += 2;

    const tracks: Track[] = [];
    let tracksParsed = 0;
    while (tracksParsed < numberOfTracks) {
      const [numberOfPitches, waveformIndex] = splitByte(dataView.getUint8(bytePosition++), 4);

      const waveform = waves.find((wave: any, index: number) => index === waveformIndex);

      let pitchesParsed = 0;
      const pitches = [];
      while (pitchesParsed < numberOfPitches + 1) {
        pitches.push(dataView.getUint16(bytePosition));
        bytePosition += 2;
        pitchesParsed++;
      }

      const numberOfNotes = dataView.getUint8(bytePosition++);

      let notesParsed = 0;
      const notes: NotePosition[] = [];
      let startPosition = 0;
      while (notesParsed < numberOfNotes) {
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
        notesParsed++;
      }

      tracks.push({ wave: waveform, notes: notes });
      tracksParsed++;
    }
    songs.push(new Song(tempo, tracks));
    songsParsed++;
  }

  return {
    data: songs,
    finalByteIndex: startingOffset + bytePosition,
  };
}

function bytesToSoundEffects(arrayBuffer: ArrayBuffer, startingOffset: number): UnpackedAsset {
  const dataView = new DataView(arrayBuffer, startingOffset);
  const numberOfSoundEffects = dataView.getUint8(0);

  let bytePosition = 1;
  let soundEffectsParsed = 0;
  const soundEffects: SoundEffect[] = [];

  while (soundEffectsParsed < numberOfSoundEffects) {
    const [numberOfOtherInstructions, numberOfGainInstructions] = splitByte(dataView.getUint8(bytePosition++), 4);

    let gainInstructionsParsed = 0;
    const gainInstructions = [];
    while (gainInstructionsParsed < numberOfGainInstructions) {
      const [timeFromLastInstruction, whiteNoiseBit, gain] = splitByte(dataView.getUint8(bytePosition++), 5, 6);
      gainInstructions.push({
        gain: gain / 3,
        isWhiteNoise: !!whiteNoiseBit,
        timeFromLastInstruction: timeFromLastInstruction / 20
      });
      gainInstructionsParsed++;
    }

    let otherInstructionsParsed = 0;
    const widthInstructions = [];
    const pitchInstructions = [];

    while (otherInstructionsParsed < numberOfOtherInstructions) {
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
      otherInstructionsParsed++;
    }

    soundEffects.push({ gainInstructions, widthInstructions, pitchInstructions });
    soundEffectsParsed++;
  }

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

  for (let i = 0; i < numberOfLevels; i++) {
    const level = new Level([]);

    const numberOfWaves = dataView.getUint8(bytePosition++);

    for (let j = 0; j < numberOfWaves; j++) {
      const wave = new EnemyWave([]);
      const numberOfEnemies = dataView.getUint8(bytePosition++);

      for (let k = 0; k < numberOfEnemies; k++) {
        const [position, colorNum, typeNum] = splitByte(dataView.getUint16(bytePosition), 8, 12);
        bytePosition += 2;

        const TypeConstructor = [StraightEnemy, PauseEnemy, WaveEnemy, WaveEnemy, ScreenEdgeBounceEnemy, ScreenEdgeBounceEnemy, SwoopEnemy, SwoopEnemy][typeNum];
        wave.enemies.push(new TypeConstructor(position, colorNum, !!(typeNum % 2)));
      }

      level.enemyWaves.push(wave);
    }
    levels.push(level);
  }

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
