export const splitByte = (byte: number, ...positions: number[]) => splitData(byte, 1, positions);

export const split16Bit = (twoByteValue: number, ...positions: number[]) => splitData(twoByteValue, 2, positions);

export const split24Bit = (threeByteValue: number, ...positions: number[]) => splitData(threeByteValue, 3, positions);

const splitData = (value: number, numberOfBytes: 1 | 2 | 3, positions: number[]) => {
  const maskBase = (1 << (numberOfBytes * 8)) - 1;
  const numberOfBits = numberOfBytes * 8;

  return [...positions, numberOfBits].map((position, index) => {
    const positionDifference = position - (positions[index - 1] ?? 0);
    const mask = maskBase >> (numberOfBits - positionDifference);
    return (value >> positions[index - 1]) & mask;
  });
}
