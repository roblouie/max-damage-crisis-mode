const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '../dist');
const jsString = fs.readFileSync(`${jsPath}/bundle.out.js`, 'utf8');

// Remove 'use strict';
const nonStrictJs = jsString.replace(`'use strict';`, '');

// Replace const with let
const allLets = nonStrictJs.split('const ').join('let ');

const finalJs = allLets;

fs.writeFileSync(`${jsPath}/golfed.js`, finalJs);
