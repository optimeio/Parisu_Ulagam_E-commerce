const fs = require('fs');

const stylesFile = 'd:/Parisu Ulagam_Test/frontend/src/styles.css';
let css = fs.readFileSync(stylesFile, 'utf8');

// Ensure password input font family is sans-serif
if (!css.includes('input[type="password"]')) {
  const cssAdd = `\n\n/* Password input fix for masking dots */\ninput[type="password"] {\n  font-family: system-ui, -apple-system, sans-serif;\n  letter-spacing: 2px;\n}\n`;
  css += cssAdd;
  fs.writeFileSync(stylesFile, css, 'utf8');
  console.log('Fixed styles.css');
} else {
  console.log('styles.css already contains password input fix');
}
