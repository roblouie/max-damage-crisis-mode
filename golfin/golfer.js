const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '../dist');
const jsString = fs.readFileSync(`${jsPath}/bundle.out.js`, 'utf8');

// Remove 'use strict';
const nonStrictJs = jsString.replace(`'use strict';`, '');

// Replace built in object methods with short names
const replacerLogic = `let eb=[["forEach","map","find","push"],["save","restore","drawImage","clearRect","putImageData"],["getUint8","getUint16"],["setValueAtTime"],['forEach'];[Object.getPrototypeOf([]),CanvasRenderingContext2D.prototype,DataView.prototype,AudioParam.prototype,Float32Array].map((a,b)=>{eb[b].map((c,d)=>{a[String.fromCharCode(d+65+6*(25<d))]=a[c]})});`;
const replacedMethodNames = replaceBuiltInMethodNames(nonStrictJs);
const jsWithMethodReplacerAdded = replacerLogic + replacedMethodNames;

// Replace const with let
const allLets = jsWithMethodReplacerAdded.split('const ').join('let ');

// Replace newlines, google closure compiler adds them for some reason
const noNewline = allLets.split('\n').join('');

const finalJs = noNewline;

fs.writeFileSync(`${jsPath}/golfed.js`, finalJs);


function replaceBuiltInMethodNames(jsString) {
  let newJs = jsString;
  const replaceData = getReplaceData();
  replaceData.forEach(replacer => {
    newJs = newJs.split(replacer.oldMethod).join(replacer.newMethod);
  });

  return newJs;
}

function getReplaceData() {
  return [
    // Array
    { newMethod: 'A(', oldMethod: 'forEach('},
    { newMethod: 'B(', oldMethod: 'map('},
    { newMethod: 'C(', oldMethod: 'find('},
    { newMethod: 'D(', oldMethod: 'push('},

    // Canvas
    { newMethod: 'A(', oldMethod: 'save('},
    { newMethod: 'B(', oldMethod: 'restore('},
    { newMethod: 'C(', oldMethod: 'drawImage('},
    { newMethod: 'D(', oldMethod: 'clearRect('},
    { newMethod: 'E(', oldMethod: 'putImageData('},

    // DataView
    { newMethod: 'A(', oldMethod: 'getUint8('},
    { newMethod: 'B(', oldMethod: 'getUint16('},

    // AudioParam
    { newMethod: 'A(', oldMethod: 'setValueAtTime('},

  ];
}
