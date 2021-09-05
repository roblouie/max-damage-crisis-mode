module.exports = [
  // Array
  {
    search: /aForEach/g,
      replace: 'A',
  },
  {
    search: /aMap/g,
    replace: 'B',
  },
  {
    search: /aFind/g,
      replace: 'C'
  },

  // Canvas
  {
    search: /cSave/g,
    replace: 'A',
  },
  {
    search: /cRestore/g,
    replace: 'B',
  },
  {
    search: /cDrawImage/g,
    replace: 'C',
  },
  {
    search: /cClearRect/g,
    replace: 'D',
  },
  {
    search: /cPutImageData/g,
    replace: 'E',
  },

  // Dataview
  {
    search: /dGetUint8/g,
    replace: 'A',
  },
  {
    search: /dGetUint16/g,
    replace: 'B',
  },
];
