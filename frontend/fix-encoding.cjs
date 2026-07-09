const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Fix remaining lone U+FFFD chars that represent ₹ (rupee sign)
  // Pattern: \uFFFD followed by { or $ (template literal for price)
  content = content.replace(/\uFFFD\{/g, '₹{');
  content = content.replace(/\uFFFD\$/g, '₹$');
  
  // Pattern: \uFFFD inside labels like "Price (₹)" "Shipping Charge (₹)"
  content = content.replace(/\(\uFFFD\)/g, '(₹)');
  content = content.replace(/\(₹\) \*/g, '(₹) *');

  // Fix password placeholder: garbled dots
  content = content.replace(/\uFFFD€½€½€½€½€½€½€½€\uFFFD/g, '••••••••');

  // Fix phone icon (📞): =\uFFFD before phone numbers
  content = content.replace(/=\uFFFD /g, '📞 ');

  // Fix address icon: \uFFFDŸ½ -> 🏡
  content = content.replace(/\uFFFDŸ½/g, '🏡');
  // Fix mobile icon: 📱 variations
  content = content.replace(/'\uFFFDŸ½'/g, "'🏡'");

  // Fix \uFFFD · (middot with FFFD before it) in CustomerDashboard
  // Pattern: qty · ₹price - the · might be fine, check the context
  // "Qty: {it.quantity} &nbsp;·&nbsp; ₹{it.price}"
  // Here \uFFFD\u0026 should be ·& or just ·
  content = content.replace(/\uFFFD\u0026nbsp;/g, '·\u0026nbsp;');

  // CSS comment fixes: responsive breakpoint comments
  // Pattern: RESPONSIVE \uFFFD\u001d → RESPONSIVE —
  content = content.replace(/\uFFFD\u001d/g, '—');
  // Pattern: (\uFFFD0\uFFFD → (≤  -- actually these are just ≤ chars
  content = content.replace(/\uFFFD0\uFFFD/g, '≤');

  // Any remaining isolated \uFFFD (that isn't part of a template) → remove or replace
  // Be careful: only remove if it's clearly a lost char, not if it's meaningful
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

const files = [
  'd:/Parisu Ulagam_Test/frontend/src/App.jsx',
  'd:/Parisu Ulagam_Test/frontend/src/components/CustomerDashboard.jsx',
  'd:/Parisu Ulagam_Test/frontend/src/styles.css',
];

for (const file of files) {
  if (fixFile(file)) {
    console.log('Fixed:', path.basename(file));
  } else {
    console.log('No changes:', path.basename(file));
  }
}

// Final check
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const count = (content.match(/\uFFFD/g) || []).length;
  console.log(path.basename(file) + ': ' + count + ' replacement chars remaining');
}

console.log('\nDone!');
