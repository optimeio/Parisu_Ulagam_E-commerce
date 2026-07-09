const fs = require('fs');
const path = require('path');
const srcDir = 'd:/Parisu Ulagam_Test/frontend/src';

function fixFile(fp) {
  let c = fs.readFileSync(fp, 'utf8');
  let original = c;
  
  // Replace the control characters with their original glyphs based on context
  // Use generic control char matching in case it's not just \x15
  // We'll replace them contextually.

  // 1. Close buttons: >\x15</button> -> >✕</button>
  c = c.replace(/>[\x00-\x1F]<\/button>/g, '>✕</button>');
  
  // 2. Select Category: [\x00-\x1F] Select Category [\x00-\x1F] -> — Select Category —
  c = c.replace(/[\x00-\x1F]Select Category[\x00-\x1F]/g, '— Select Category —');
  c = c.replace(/[\x00-\x1F]\s*Select Category\s*[\x00-\x1F]/g, '— Select Category —');

  // 3. Paid: [\x00-\x1F] Paid -> ✅ Paid
  c = c.replace(/[\x00-\x1F]\s*Paid/g, '✅ Paid');

  // 4. Texts with em-dashes (like "Step 1 of 3 \x15 Your Details")
  c = c.replace(/Step (\d) of 3[\s\x00-\x1F]+(Your|Email|Password)/g, 'Step $1 of 3 — $2');
  
  // 5. General fallback: if there's still a control char, we might need to look at it.
  // We know there's one for "0" or "X" in menuOpen: {menuOpen ? '\x15' : '☰'}
  c = c.replace(/menuOpen \? '[\x00-\x1F]' : '0'/g, "menuOpen ? '✕' : '☰'"); 
  // actually wait, earlier it was {menuOpen ? '✕' : '☰'} but the code says {menuOpen ? ' ' : '0'} where '0' might also be corrupted? Wait, in the grep output it was:
  // [App.jsx:3726] {menuOpen ? ' ' : '0'} -> let's fix it to: {menuOpen ? '✕' : '☰'}
  c = c.replace(/\{menuOpen \? '[\x00-\x1F]' : '0'\}/g, "{menuOpen ? '✕' : '☰'}");
  c = c.replace(/\{menuOpen \? '[\x00-\x1F]' : '[\x00-\x1F]'\}/g, "{menuOpen ? '✕' : '☰'}");

  // 6. Minus for quantity: Math.max(1, item.quantity - 1))}>[\x00-\x1F]</button> -> >−</button>
  c = c.replace(/Math\.max\(1, item\.quantity - 1\)\)\}>[\x00-\x1F]<\/button>/g, 'Math.max(1, item.quantity - 1))}>−</button>');

  // 7. Any remaining control char between spaces like "materials \x15 from gold-plated" -> "materials — from gold-plated"
  c = c.replace(/([a-zA-Z])[\x00-\x1F]([a-zA-Z])/g, '$1 — $2'); // usually it has spaces though
  c = c.replace(/ ([a-z]+)[\x00-\x1F]+([a-z]+) /gi, ' $1 — $2 ');
  
  // We'll just generically replace all remaining \x15 (or other ctrl chars from \x0E-\x1F) with em-dash if surrounded by spaces
  c = c.replace(/ [\x00-\x08\x0B\x0C\x0E-\x1F] /g, ' — ');
  
  // Empty space defaults like `c.mobile || '\x15'`
  c = c.replace(/\|\| '[\x00-\x1F]'/g, "|| '—'");
  c = c.replace(/\? '[\x00-\x1F]' :/g, "? '—' :");
  c = c.replace(/: '[\x00-\x1F]'/g, ": '—'");

  // Fix the 0 in menuOpen if we missed it
  c = c.replace(/\{menuOpen \? '✕' : '0'\}/g, "{menuOpen ? '✕' : '☰'}");

  if (c !== original) {
    fs.writeFileSync(fp, c, 'utf8');
    console.log(`Fixed ${path.basename(fp)}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) walk(fp);
    else if (fp.endsWith('.jsx')) {
      fixFile(fp);
    }
  }
}

walk(srcDir);
