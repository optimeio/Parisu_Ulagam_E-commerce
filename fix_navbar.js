const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'frontend/src/styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Change --bg-nav
css = css.replace(
  /--bg-nav: #028090;.*/,
  '--bg-nav: linear-gradient(135deg, #012a32 0%, #03404c 100%); /* Deep Royal Teal */'
);

// Change --gold-text-gradient to an actual readable gold gradient
css = css.replace(
  /--gold-text-gradient: linear-gradient\(135deg, #0096C7 0%, #0077B6 100%\);.*/,
  '--gold-text-gradient: linear-gradient(135deg, #F3E5AB 0%, #D4AF37 50%, #C08D46 100%); /* Royal Gold text gradient */'
);

// Make sure .brand__tag is visible on dark background (it was using var(--text-muted) which is dark)
// Let's replace the .brand__tag color rule specifically
css = css.replace(
  /.brand__tag {\n\s+font-size: 0.7rem;\n\s+letter-spacing: 0.18em;\n\s+text-transform: uppercase;\n\s+color: var\(--text-muted\);/,
  '.brand__tag {\n    font-size: 0.7rem;\n    letter-spacing: 0.18em;\n    text-transform: uppercase;\n    color: rgba(255, 255, 255, 0.7);'
);

fs.writeFileSync(cssPath, css);
console.log('Navbar and logo colors updated successfully!');
