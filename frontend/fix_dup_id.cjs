const fs = require('fs');
let c = fs.readFileSync('d:/Parisu Ulagam_Test/frontend/src/App.jsx', 'utf8');
c = c.replace(/<input id="shippingIsActive" name="shippingIsActive"/, '<input name="shippingIsActive"');
fs.writeFileSync('d:/Parisu Ulagam_Test/frontend/src/App.jsx', c, 'utf8');
console.log('Fixed duplicate id in App.jsx');
