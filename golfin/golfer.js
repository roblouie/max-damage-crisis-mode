const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '../dist');
const jsString = fs.readFileSync(`${jsPath}/bundle.out.js`, 'utf8');

// Remove 'use strict';
const nonStrictJs = jsString.replace(`'use strict';`, '');

const methodReplacer = `let o1=-1,n1=0,u8=Uint8ClampedArray.prototype;u8.N2=u8.slice;["",0,[]].map(x=>Object.getOwnPropertyNames(P=x.__proto__).map((p,i)=>{P[String.fromCharCode(i+65+6*(i>25))+((i<o1)?n1++:n1)]=P[p];o1=i;}));`;
const replacedMethodNames = replaceBuiltInMethodNames(nonStrictJs);
const jsWithMethodReplacerPrepended = methodReplacer + replacedMethodNames;


const finalJs = jsWithMethodReplacerPrepended;

console.log(finalJs);

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
  { newMethod: 'C0(', oldMethod: 'anchor('},
  { newMethod: 'D0(', oldMethod: 'big('},
  { newMethod: 'E0(', oldMethod: 'blink('},
  { newMethod: 'F0(', oldMethod: 'bold('},
  { newMethod: 'G0(', oldMethod: 'charAt('},
  { newMethod: 'H0(', oldMethod: 'charCodeAt('},
  { newMethod: 'I0(', oldMethod: 'codePointAt('},
  { newMethod: 'J0(', oldMethod: 'concat('},
  { newMethod: 'K0(', oldMethod: 'endsWith('},
  { newMethod: 'L0(', oldMethod: 'fontcolor('},
  { newMethod: 'M0(', oldMethod: 'fontsize('},
  { newMethod: 'N0(', oldMethod: 'fixed('},
  { newMethod: 'O0(', oldMethod: 'includes('},
  { newMethod: 'P0(', oldMethod: 'indexOf('},
  { newMethod: 'Q0(', oldMethod: 'italics('},
  { newMethod: 'R0(', oldMethod: 'lastIndexOf('},
  { newMethod: 'S0(', oldMethod: 'link('},
  { newMethod: 'T0(', oldMethod: 'localeCompare('},
  { newMethod: 'U0(', oldMethod: 'match('},
  { newMethod: 'V0(', oldMethod: 'matchAll('},
  { newMethod: 'W0(', oldMethod: 'normalize('},
  { newMethod: 'X0(', oldMethod: 'padEnd('},
  { newMethod: 'Y0(', oldMethod: 'padStart('},
  { newMethod: 'Z0(', oldMethod: 'repeat('},
  { newMethod: 'a0(', oldMethod: 'replace('},
  { newMethod: 'b0(', oldMethod: 'replaceAll('},
  { newMethod: 'c0(', oldMethod: 'search('},
  { newMethod: 'e0(', oldMethod: 'small('},
  { newMethod: 'f0(', oldMethod: 'split('},
  { newMethod: 'g0(', oldMethod: 'strike('},
  { newMethod: 'h0(', oldMethod: 'sub('},
  { newMethod: 'i0(', oldMethod: 'substr('},
  { newMethod: 'j0(', oldMethod: 'substring('},
  { newMethod: 'k0(', oldMethod: 'sup('},
  { newMethod: 'l0(', oldMethod: 'startsWith('},
  { newMethod: 'm0(', oldMethod: 'toString('},
  { newMethod: 'n0(', oldMethod: 'trim('},
  { newMethod: 'o0(', oldMethod: 'trimStart('},
  { newMethod: 'p0(', oldMethod: 'trimStart('},
  { newMethod: 'q0(', oldMethod: 'trimEnd('},
  { newMethod: 'r0(', oldMethod: 'trimEnd('},
  { newMethod: 's0(', oldMethod: 'toLocaleLowerCase('},
  { newMethod: 't0(', oldMethod: 'toLocaleUpperCase('},
  { newMethod: 'u0(', oldMethod: 'toLowerCase('},
  { newMethod: 'v0(', oldMethod: 'toUpperCase('},
  { newMethod: 'w0(', oldMethod: 'valueOf('},
  { newMethod: 'x0(', oldMethod: 'at('},
  { newMethod: 'A1(', oldMethod: 'Number('},
  { newMethod: 'B1(', oldMethod: 'toExponential('},
  { newMethod: 'C1(', oldMethod: 'toFixed('},
  { newMethod: 'D1(', oldMethod: 'toPrecision('},
  { newMethod: 'E1(', oldMethod: 'toString('},
  { newMethod: 'F1(', oldMethod: 'valueOf('},
  { newMethod: 'G1(', oldMethod: 'toLocaleString('},
  { newMethod: 'C2(', oldMethod: 'concat('},
  { newMethod: 'D2(', oldMethod: 'copyWithin('},
  { newMethod: 'F2(', oldMethod: 'find('},
  { newMethod: 'G2(', oldMethod: 'findIndex('},
  { newMethod: 'H2(', oldMethod: 'lastIndexOf('},
  { newMethod: 'I2(', oldMethod: 'pop('},
  { newMethod: 'J2(', oldMethod: 'push('},
  { newMethod: 'K2(', oldMethod: 'reverse('},
  { newMethod: 'L2(', oldMethod: 'shift('},
  { newMethod: 'M2(', oldMethod: 'unshift('},
  { newMethod: 'N2(', oldMethod: 'slice('},
  { newMethod: 'O2(', oldMethod: 'sort('},
  { newMethod: 'P2(', oldMethod: 'splice('},
  { newMethod: 'Q2(', oldMethod: 'includes('},
  { newMethod: 'R2(', oldMethod: 'indexOf('},
  { newMethod: 'S2(', oldMethod: 'join('},
  { newMethod: 'T2(', oldMethod: 'keys('},
  { newMethod: 'U2(', oldMethod: 'entries('},
  { newMethod: 'V2(', oldMethod: 'values('},
  { newMethod: 'W2(', oldMethod: 'forEach('},
  { newMethod: 'X2(', oldMethod: 'filter('},
  { newMethod: 'Y2(', oldMethod: 'flat('},
  { newMethod: 'Z2(', oldMethod: 'flatMap('},
  { newMethod: 'a2(', oldMethod: 'map('},
  { newMethod: 'b2(', oldMethod: 'every('},
  { newMethod: 'c2(', oldMethod: 'some('},
  { newMethod: 'd2(', oldMethod: 'reduce('},
  { newMethod: 'e2(', oldMethod: 'reduceRight('},
  { newMethod: 'f2(', oldMethod: 'toLocaleString('},
  { newMethod: 'g2(', oldMethod: 'toString('},
  { newMethod: 'h2(', oldMethod: 'at('},
  ];
}
