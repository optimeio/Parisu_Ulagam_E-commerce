const fs = require('fs');

const filePath = 'd:/Parisu Ulagam_Test/frontend/src/App.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  ['& ⚜ &', '✦ ⚜ ✦'],
  ['½ View Store', '← View Store'],
  ["return '\\u0005'.repeat(full)", "return '★'.repeat(full)"],
  ["{ icon: '📤', label: 'Mobile', value: currentUser.mobile || '\\u0014' }", "{ icon: '📱', label: 'Mobile', value: currentUser.mobile || '—' }"],
  ["{ icon: '📤', label: 'Extra Details', value: currentUser.extraDetails || 'N/A' }", "{ icon: '📝', label: 'Extra Details', value: currentUser.extraDetails || 'N/A' }"]
];

let changed = false;
for (const [from, to] of replacements) {
  if (content.includes(from)) {
    content = content.split(from).join(to);
    changed = true;
    console.log(`Replaced: ${from} -> ${to}`);
  } else {
    console.log(`Not found: ${from}`);
  }
}

if (changed) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('App.jsx fixed successfully.');
} else {
  console.log('No changes needed.');
}
