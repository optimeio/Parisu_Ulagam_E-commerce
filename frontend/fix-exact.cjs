const fs = require('fs');
const filePath = 'd:/Parisu Ulagam_Test/frontend/src/App.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// The star char was corrupted to \x05. Let's fix that specific line
const badStarReturn = "return '\\x05'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));";
const goodStarReturn = "return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));";
if (content.includes(badStarReturn)) {
  content = content.replace(badStarReturn, goodStarReturn);
  console.log('Fixed stars');
}

// The mobile value placeholder
const badMobileValue = "{ icon: '📤', label: 'Mobile', value: currentUser.mobile || '\\x14' }";
const goodMobileValue = "{ icon: '📱', label: 'Mobile', value: currentUser.mobile || '—' }";
if (content.includes(badMobileValue)) {
  content = content.replace(badMobileValue, goodMobileValue);
  console.log('Fixed mobile');
}

// The extra details icon
const badExtraDetails = "{ icon: '📤', label: 'Extra Details', value: currentUser.extraDetails || 'N/A' }";
const goodExtraDetails = "{ icon: '📝', label: 'Extra Details', value: currentUser.extraDetails || 'N/A' }";
if (content.includes(badExtraDetails)) {
  content = content.replace(badExtraDetails, goodExtraDetails);
  console.log('Fixed extra details');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done replacement.');
