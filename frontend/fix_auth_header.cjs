const fs = require('fs');
let fp = 'd:/Parisu Ulagam_Test/frontend/src/components/OrderDetailsView.jsx';
let c = fs.readFileSync(fp, 'utf8');

c = c.replace(/Authorization:\s*`Bearer \$\{token\}`/g, "'x-user-token': token");

fs.writeFileSync(fp, c, 'utf8');
console.log('Fixed auth header in OrderDetailsView.jsx');
