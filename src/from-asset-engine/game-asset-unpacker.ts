import { Sprite } from "./sprite.model";
import { SpriteTile } from "./sprite-tile.model";
import { BackgroundLayer } from "./background-layer";
import { Song } from "./song.model";
import { Track } from "./track.model";
import { NotePosition } from "./note-position.model";

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

  return {
    paletteAsset,
    tileAsset,
    spriteAsset,
    backgroundAsset,
    songsAsset,
  };
}

function bytesToPalettes(arrayBuffer: ArrayBuffer, startingOffset = 0): UnpackedAsset {
  const dataView = new DataView(arrayBuffer, startingOffset);
  const numberOfPalettes = dataView.getUint8(0);
  const paletteSize = 16 * 3; // sixteen colors, three bytes per color
  const totalPalettesByteSize = (numberOfPalettes * paletteSize) + 1;

  const palettes = [];

  for (let byteOffset = 1; byteOffset < totalPalettesByteSize; byteOffset += 3) {
    const byte0 = dataView.getUint8(byteOffset);
    const byte1 = dataView.getUint8(byteOffset + 1);
    const byte2 = dataView.getUint8(byteOffset + 2);

    const byte0String = byte0.toString(16).padStart(2, '0');
    const byte1String = byte1.toString(16).padStart(2, '0');
    const byte2String = byte2.toString(16).padStart(2, '0');

    palettes.push('#' + byte0String + byte1String + byte2String);
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
    const byte = dataView.getUint8(byteOffset);
    const firstValue = byte & 0xf;
    const secondValue = (byte >> 4) & 0xf;
    rawTileValues.push(firstValue, secondValue);
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
    const spriteHeaderByte = dataView.getUint8(bytePosition);
    const paletteNumber = spriteHeaderByte & 63;
    const size = spriteHeaderByte >> 6;
    bytePosition++;

    const sprite = new Sprite(paletteNumber, size);

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

    const metadata = dataView.getUint8(bytePosition);
    const spriteStartIndex = metadata & 127;
    const isSemiTransparent = metadata >> 7;
    bytePosition++;

    const backgroundLayer = new BackgroundLayer();
    backgroundLayer.spriteStartOffset = spriteStartIndex;
    backgroundLayer.isSemiTransparent = isSemiTransparent === 1;

    for (let i = 0; i < numberOfSpritesInBackground; i++) {
      const spriteByte = dataView.getUint8(bytePosition);
      bytePosition++;

      const position = spriteByte >> 3;
      const spriteIndex = spriteByte & 0b111;
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

function bytesToSongs(arrayBuffer: ArrayBuffer, startingOffset: number): UnpackedAsset {
  if (startingOffset >= arrayBuffer.byteLength) {
    return {
      data: [],
      finalByteIndex: startingOffset,
    };
  }

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
      const numberOfPitches = dataView.getUint8(bytePosition);
      bytePosition++;

      let pitchesParsed = 0;
      const pitches = [];
      while (pitchesParsed < numberOfPitches) {
        pitches.push(dataView.getUint16(bytePosition));
        pitchesParsed++;
        bytePosition += 2;
      }

      const numberOfNotes = dataView.getUint8(bytePosition);
      bytePosition++;

      let notesParsed = 0;
      const notes: NotePosition[] = [];
      let currentStepPosition = 0;
      while (notesParsed < numberOfNotes) {
        const combinedInstruction = dataView.getUint8(bytePosition);
        const pitchIndex = combinedInstruction >> 4;
        const noteLength = (combinedInstruction & 15) + 1; // note length is stored 0-indexed

        if (pitchIndex !== 0) {
          const noteFrequency = pitches[pitchIndex];

          notes.push({
            frequency: noteFrequency,
            startPosition: currentStepPosition,
            duration: noteLength,
          });
        }
        currentStepPosition += noteLength;
        bytePosition++;
        notesParsed++;
      }

      tracks.push({ trackId: tracksParsed, notes: notes });
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

export function chunkArrayInGroups(array: any[] | Uint8ClampedArray, chunkSize: number): any[] | Uint8ClampedArray[] {
  const chunkedArray = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunkedArray.push(array.slice(i, i + chunkSize));
  }
  return chunkedArray;
}
