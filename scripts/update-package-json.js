const fs = require('fs');
const path = require('path');

// 開発用フィールドを除いて新オブジェクトを作る
const {
  scripts,
  devDependencies,
  electronmon,
  volta,
  ...prodPkg
} = require('../package.json');

prodPkg.main = 'main.js'; // エントリポイントを調整

fs.writeFileSync(
  path.join(__dirname, '../dist/package.json'),
  JSON.stringify(prodPkg, null, 2)
);
