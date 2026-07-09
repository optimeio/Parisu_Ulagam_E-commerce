const fs = require('fs');
const path = require('path');
const srcDir = 'd:/Parisu Ulagam_Test/frontend/src';

let icons = {
  fontAwesome: 0,
  primeIcons: 0,
  bootstrapIcons: 0,
  materialIcons: 0,
  svgs: 0
};

let closeButtons = [];
let passInputs = [];

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) walk(fp);
    else if (fp.endsWith('.jsx')) {
      const c = fs.readFileSync(fp, 'utf8');
      
      // Icon usage
      icons.fontAwesome += (c.match(/fa fa-/g) || []).length + (c.match(/fas fa-/g) || []).length;
      icons.primeIcons += (c.match(/pi pi-/g) || []).length;
      icons.bootstrapIcons += (c.match(/bi bi-/g) || []).length;
      icons.materialIcons += (c.match(/material-icons/g) || []).length;
      icons.svgs += (c.match(/<svg/g) || []).length;

      // Close buttons
      const closeMatches = c.match(/<button[^>]*close[^>]*>.*?<\/button>/gi);
      if (closeMatches) closeButtons.push({file: f, matches: closeMatches});
      
      const xMatches = c.match(/<button[^>]*>✕<\/button>/gi);
      if (xMatches) closeButtons.push({file: f, matches: xMatches});

      // Password inputs
      const passMatches = c.match(/<input[^>]*type=[\"']password[\"'][^>]*>/gi);
      if (passMatches) passInputs.push({file: f, matches: passMatches});
      
      // Password toggle icons
      const toggleMatches = c.match(/<span[^>]*password-toggle[^>]*>.*?<\/span>/gi);
      if (toggleMatches) passInputs.push({file: f, matches: toggleMatches});
    }
  }
}
walk(srcDir);

console.log('Icon Usage:', icons);
console.log('\nClose Buttons Found:');
closeButtons.forEach(b => console.log(b.file, b.matches));
console.log('\nPassword Inputs Found:');
passInputs.forEach(p => console.log(p.file, p.matches));
