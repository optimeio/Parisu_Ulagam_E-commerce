const fs = require('fs');
const path = require('path');

function addIdName(fp) {
  let c = fs.readFileSync(fp, 'utf8');
  let original = c;
  
  let i = 0;
  c = c.replace(/<input([^>]*?)>/gi, (match, attrs) => {
    if (!attrs.includes('id=') && !attrs.includes('name=')) {
      i++;
      // Determine what to name it based on value/onChange or placeholder
      let inferredName = `inputField${i}`;
      if (attrs.includes('adminSearchQuery')) inferredName = 'adminSearchQuery';
      else if (attrs.includes('inventorySearchQuery')) inferredName = 'inventorySearchQuery';
      else if (attrs.includes('editingStockValue')) inferredName = 'editingStockValue';
      else if (attrs.includes('shippingProviderName')) inferredName = 'shippingProviderName';
      else if (attrs.includes('shippingCharge')) inferredName = 'shippingCharge';
      else if (attrs.includes('shippingIsActive')) inferredName = 'shippingIsActive';
      else if (attrs.includes('checkoutPhone')) inferredName = 'checkoutPhone';
      else if (attrs.includes('searchQuery')) inferredName = 'searchQuery';
      
      return `<input id="${inferredName}" name="${inferredName}"${attrs}>`;
    }
    return match;
  });
  
  if (c !== original) {
    fs.writeFileSync(fp, c, 'utf8');
    console.log(`Added missing id/name to inputs in ${path.basename(fp)}`);
  }
}

addIdName('d:/Parisu Ulagam_Test/frontend/src/App.jsx');
addIdName('d:/Parisu Ulagam_Test/frontend/src/components/SignupPage.jsx');
addIdName('d:/Parisu Ulagam_Test/frontend/src/components/CustomerDashboard.jsx');
