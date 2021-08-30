// There is a much simpler method in unpacker that can split a byte into two pieces
// This logic will let you split any value of any number of bytes into any number of pieces
// However the overhead of this code existing my not make up for just manually doing more complex
// splits by hand, considering presently we only do larger more complex splits in a couple of places.

export function splitByte(byte: number, ...positions: number[]) {
  return splitData(byte, 1, positions);
}

export function split16Bit(twoByteValue: number, ...positions: number[]) {
  return splitData(twoByteValue, 2, positions);
}

export function split24Bit(threeByteValue: number, ...positions: number[]) {
  return splitData(threeByteValue, 3, positions);
}

// Used to split byte into multiple pieces. Positions are binary places (decimal places but binary), so going
// from the right to the left zeros, twos, fours, eights, etc. Positions must be passed from highest binary place to
// lowest. For instance splitByteMultiWay(255, 2, 1) returns [63, 1, 1], since 6 bits is 63, then position 2 is only
// one bit because position one is also its own bit. splitByteMultiWay(255, 4, 2) returns [15, 3, 3], again because
// four bits is 15, then positions 4 and 3 are 2 bits so 3, and 2 and 1 are 2 bits so 3.
function splitData(byteData: number, numberOfBytes: number, positions: number[]) {
  const maskBase = (1 << (numberOfBytes * 8)) - 1;
  const numberOfBits = numberOfBytes * 8;
  return [
    byteData & (maskBase >> positions[0]),
    ...positions.map((position, index) => {
      // Makes use of the fact that NaN is converted to zero for bitwise shift,
      // so for the final position in the array positions[index + 1] is undefined
      // so 8 - position - undefined is Nan, which means 255 is shifted zero places
      // resulting in 255, which is what we want for the final position, as it simply
      // shouldn't be masked.
      const mask = maskBase >> (numberOfBits - (position - positions[index + 1]));
      return (byteData >> (numberOfBits - position)) & mask;
    })
  ];
}
