const fs = require('fs');
const path = require('path');
const srcDir = 'd:/Parisu Ulagam_Test/frontend/src';

let controlCharsFound = 0;
function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) walk(fp);
    else if (fp.endsWith('.jsx')) {
      const c = fs.readFileSync(fp, 'utf8');
      const lines = c.split('\n');
      lines.forEach((line, i) => {
        if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(line)) {
          console.log(`[${f}:${i+1}]`, line.trim());
          controlCharsFound++;
        }
      });
    }
  }
}
walk(srcDir);
if (controlCharsFound === 0) console.log('No control characters found.');
