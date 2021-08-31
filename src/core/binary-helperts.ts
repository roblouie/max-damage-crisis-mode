export function splitByte(byte: number, ...positions: number[]) {
  return splitData(byte, 1, positions);
}

export function split16Bit(twoByteValue: number, ...positions: number[]) {
  return splitData(twoByteValue, 2, positions);
}

export function split24Bit(threeByteValue: number, ...positions: number[]) {
  return splitData(threeByteValue, 3, positions);
}

function splitData(value: number, numberOfBytes: 1 | 2 | 3, positions: number[]) {
  const maskBase = (1 << (numberOfBytes * 8)) - 1;
  const numberOfBits = numberOfBytes * 8;

  return positions.map((position, index) => {
    const positionDifference = position - (positions[index - 1] ?? 0);
    const mask = maskBase >> (numberOfBits - positionDifference);
    return (value >> positions[index - 1]) & mask;
  });
}
