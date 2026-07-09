const fs = require('fs');

let c = fs.readFileSync('d:/Parisu Ulagam_Test/frontend/src/App.jsx', 'utf8');
let original = c;

// Fix stars
c = c.replace(/'[\x00-\x1F]'\.repeat\(full\)/g, "'★'.repeat(full)");
c = c.replace(/\{'[\x00-\x1F]'\.repeat\(r\.rating\)\}/g, "{'★'.repeat(r.rating)}");
c = c.replace(/4\.9 [\x00-\x1F]<\/div>/g, "4.9 ★</div>");

// Fix checkmark in image selection
c = c.replace(/fontWeight: 'bold' \}\}>[\x00-\x1F]<\/div>/g, "fontWeight: 'bold' }}>✓</div>");

// Clean up any remaining standalone control chars on empty lines
c = c.replace(/^[\x00-\x1F]+$/gm, "");

if (c !== original) {
  fs.writeFileSync('d:/Parisu Ulagam_Test/frontend/src/App.jsx', c, 'utf8');
  console.log('Fixed remaining chars in App.jsx');
}
