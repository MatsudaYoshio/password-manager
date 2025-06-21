const fs = require('fs');
const path = require('path');

const pkg = require('../package.json');
pkg.main = 'main.js';

fs.writeFileSync(
  path.join(__dirname, '../dist/package.json'),
  JSON.stringify(pkg, null, 2)
);
