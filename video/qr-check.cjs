/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const { PNG } = require('./qrcheck/node_modules/pngjs');
const jsQR = require('./qrcheck/node_modules/jsqr');
const png = PNG.sync.read(fs.readFileSync(process.argv[2]));
const result = jsQR(png.data, png.width, png.height);
if (!result) process.exit(1);
console.log(result.data);
