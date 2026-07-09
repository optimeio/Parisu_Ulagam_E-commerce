const fs = require('fs');
const c = fs.readFileSync('d:/Parisu Ulagam_Test/frontend/src/App.jsx', 'utf8');

const s = c.indexOf('starsString(rating)');
console.log('Stars string context:');
console.log(JSON.stringify(c.substring(s, s + 200)));

const m = c.indexOf("label: 'Mobile'");
console.log('Mobile context:');
console.log(JSON.stringify(c.substring(m - 30, m + 80)));
