import { Sprite } from "./sprite.model";
import { SpriteTile } from "./sprite-tile.model";
import { BackgroundLayer } from "./background-layer";
import { Song } from "./song.model";
import { Track } from "./track.model";
import { NotePosition } from "./note-position.model";
import {SoundEffect} from "./sound-effect.model";

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

  return {
    paletteAsset,
    tileAsset,
    spriteAsset,
    backgroundAsset,
    songsAsset,
    soundEffectsAsset,
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
    palettes.push('#' + parseInt(dataView.getUint32(byteOffset) / 256).toString(16).padStart(6, '0'));
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
  if (startingOffset >= arrayBuffer.byteLength) {
    return {
      data: [],
      finalByteIndex: startingOffset,
    };
  }
  const dataView = new DataView(arrayBuffer, startingOffset);
  const numberOfSprites = dataView.getUint8(0);

  let spritesParsed = 0;
  let bytePosition = 1;
  const sprites: Sprite[] = [];

  while (spritesParsed < numberOfSprites) {
    // @ts-ignore
    const sprite = new Sprite(...splitByte(dataView.getUint8(bytePosition), 2));
    bytePosition++;

    for (let i = 0; i < sprite.spriteTiles.length; i++) {
      const tileByte = dataView.getUint8(bytePosition);
      const paletteNumber = tileByte & 63;
      const isFlippedX = ((tileByte >> 6) & 1) === 1;
      const isFlippedY = (tileByte >> 7) === 1;
      sprite.spriteTiles[i] = new SpriteTile(isFlippedX, isFlippedY, paletteNumber);
      bytePosition++;
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
  if (startingOffset >= arrayBuffer.byteLength) {
    return {
      data: [],
      finalByteIndex: startingOffset,
    };
  }

  const dataView = new DataView(arrayBuffer, startingOffset);
  const numberOfBackgrounds = dataView.getUint8(0);
  const numberOfBackgroundLayers = numberOfBackgrounds * 3;

  let backgroundsParsed = 0;
  let bytePosition = 1;
  const backgroundLayers: BackgroundLayer[] = [];

  while (backgroundsParsed < numberOfBackgroundLayers) {
    const numberOfSpritesInBackground = dataView.getUint8(bytePosition);
    bytePosition++;

    // @ts-ignore
    const backgroundLayer = new BackgroundLayer(...splitByte(dataView.getUint8(bytePosition), 1));
    bytePosition++;

    for (let i = 0; i < numberOfSpritesInBackground; i++) {
      const [spriteIndex, position] = splitByte(dataView.getUint8(bytePosition), 5);
      bytePosition++;
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
    const tempo = dataView.getUint8(bytePosition);
    bytePosition++;
    const numberOfTracks = dataView.getUint8(bytePosition);
    bytePosition++;

    const tracks: Track[] = [];
    let tracksParsed = 0;
    while (tracksParsed < numberOfTracks) {
      const [numberOfPitches, waveformIndex] = splitByte(dataView.getUint8(bytePosition), 4);
      bytePosition++;

      const waveform = waves.find((wave: any, index: number) => index === waveformIndex);

      let pitchesParsed = 0;
      const pitches = [];
      while (pitchesParsed < numberOfPitches + 1) {
        pitches.push(dataView.getUint16(bytePosition));
        bytePosition += 2;
        pitchesParsed++;
      }

      const numberOfNotes = dataView.getUint8(bytePosition);
      bytePosition++;

      let notesParsed = 0;
      const notes: NotePosition[] = [];
      let currentStepPosition = 0;
      while (notesParsed < numberOfNotes) {
        const [noteLength, pitchIndex] = splitByte(dataView.getUint8(bytePosition), 4);
        bytePosition++;

        if (pitchIndex !== 0) {
          const noteFrequency = pitches[pitchIndex];

          notes.push({
            frequency: noteFrequency,
            startPosition: currentStepPosition,
            duration: noteLength + 1,
          });
        }
        currentStepPosition += noteLength + 1;
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
    const [numberOfOtherInstructions, numberOfGainInstructions] = splitByte(dataView.getUint8(bytePosition), 4);
    bytePosition++;

    let gainInstructionsParsed = 0;
    const gainInstructions = [];
    while (gainInstructionsParsed < numberOfGainInstructions) {
      const gainInstruction = dataView.getUint8(bytePosition);
      bytePosition++;
      const gain = (gainInstruction >> 6) / 3;
      const isWhiteNoise = ((gainInstruction >> 5) & 0b1) === 1;
      const timeFromLastInstruction = (gainInstruction & 0b11111) / 10;
      gainInstructions.push({ gain, isWhiteNoise, timeFromLastInstruction });
      gainInstructionsParsed++;
    }

    let otherInstructionsParsed = 0;
    const widthInstructions = [];
    const pitchInstructions = [];

    while (otherInstructionsParsed < numberOfOtherInstructions) {
      const otherInstruction = dataView.getUint8(bytePosition);
      bytePosition++;

      const isWidth = otherInstruction >> 7 === 1;
      if (isWidth) {
        const timeFromLastInstruction = (otherInstruction & 0b11111) / 10;
        widthInstructions.push({ timeFromLastInstruction, isWidth });
      } else {
        const isLinearRampTo = ((otherInstruction >> 5) & 0b1) === 1;
        const durationInSeconds = (otherInstruction & 0b11111) / 10;

        const pitchBytes = dataView.getUint8(bytePosition);
        bytePosition++;
        const pitch = (pitchBytes * 70) + 1;
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

function splitByte(byte: number, position: number) {
  return [byte & (255 >> position), byte >> (8 - position)];
}

export function chunkArrayInGroups(array: any[] | Uint8ClampedArray, chunkSize: number): any[] | Uint8ClampedArray[] {
  const chunkedArray = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunkedArray.push(array.slice(i, i + chunkSize));
  }
  return chunkedArray;
}
