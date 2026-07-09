const fs = require('fs');
const fp = 'd:/Parisu Ulagam_Test/frontend/src/components/OrderDetailsView.jsx';
let c = fs.readFileSync(fp, 'utf8');

c = c.replace(
  /const data = await res\.json\(\);/g,
  `const data = await res.json();
      if (res.status === 401 && onLogout) {
        onLogout();
        return;
      }`
);

fs.writeFileSync(fp, c, 'utf8');
console.log('Added 401 checks to OrderDetailsView.jsx');
