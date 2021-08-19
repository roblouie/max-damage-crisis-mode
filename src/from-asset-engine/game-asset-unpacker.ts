import { Sprite } from "./sprite.model";
import { SpriteTile } from "./sprite-tile.model";

interface UnpackedAsset {
  data: any;
  finalByteIndex: number;
}

export function unpackGameAssets(arrayBuffer: ArrayBuffer) {
  const paletteAsset = bytesToPalettes(arrayBuffer, 0);
  const tileAsset = bytesToTiles(arrayBuffer, paletteAsset.finalByteIndex);
  const spriteAsset = bytesToSprites(arrayBuffer, tileAsset.finalByteIndex);
  const songsAsset = bytesToSongs(arrayBuffer, spriteAsset.finalByteIndex);

  return {
    paletteAsset,
    tileAsset,
    spriteAsset,
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

function bytesToSongs(arrayBuffer: ArrayBuffer, startingOffset: number): UnpackedAsset {
  // TODO: logic for load sound assets
  return {} as UnpackedAsset;
}

export function chunkArrayInGroups(array: any[] | Uint8ClampedArray, chunkSize: number): any[] | Uint8ClampedArray[] {
  const chunkedArray = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunkedArray.push(array.slice(i, i + chunkSize));
  }
  return chunkedArray;
}
