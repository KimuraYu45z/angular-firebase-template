const fs = require('fs');

const sources = ['firestore/.rules', 'styles.css'];

fs.mkdirSync('dist/lib/firestore');
for (const source of sources) {
  fs.copyFileSync(source, `dist/lib/${source}`);
}
