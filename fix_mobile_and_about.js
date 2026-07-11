const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'frontend/src/styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Fix mobile hero slider height cut-off
css = css.replace(
  /.hero-slider-section {\n\s+min-height: 360px;\n\s+max-height: unset;\n\s+padding: 20px 14px;\n\s+}/,
  '.hero-slider-section {\n    min-height: 360px;\n    max-height: unset;\n    height: auto !important;\n    padding: 20px 14px 40px;\n  }'
);

// 2. Fix About Section background to royal dark teal
css = css.replace(
  /.about-section {\n\s+padding: 80px 64px;\n\s+background: var\(--bg-secondary\);/,
  '.about-section {\n  padding: 80px 64px;\n  background: linear-gradient(135deg, #012a32 0%, #03404c 100%);'
);

// 3. Fix About Title text color
css = css.replace(
  /.about-title {\n\s+font-family: 'Cormorant Garamond', serif;\n\s+font-size: 2.8rem;\n\s+font-weight: 700;\n\s+color: var\(--text-primary\);/,
  '.about-title {\n  font-family: \'Cormorant Garamond\', serif;\n  font-size: 2.8rem;\n  font-weight: 700;\n  color: #FCEDD6;'
);

// 4. Fix About Lead text color
css = css.replace(
  /.about-lead {\n\s+font-size: 1.05rem;\n\s+line-height: 1.7;\n\s+color: var\(--text-secondary\);/,
  '.about-lead {\n  font-size: 1.05rem;\n  line-height: 1.7;\n  color: rgba(255, 255, 255, 0.85);'
);

// 5. Fix About Pillar background and text
css = css.replace(
  /.about-pillar {\n\s+display: flex;\n\s+flex-direction: column;\n\s+align-items: center;\n\s+text-align: center;\n\s+gap: 16px;\n\s+padding: 24px 20px;\n\s+background: #fdfbf7;/,
  '.about-pillar {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  text-align: center;\n  gap: 16px;\n  padding: 24px 20px;\n  background: rgba(255,255,255,0.03);\n  backdrop-filter: blur(8px);'
);

css = css.replace(
  /.about-pillar h3 {\n\s+font-family: var\(--font-heading\), serif;\n\s+font-size: 1.25rem;\n\s+color: var\(--text-primary\);/,
  '.about-pillar h3 {\n  font-family: var(--font-heading), serif;\n  font-size: 1.25rem;\n  color: #FCEDD6;'
);

css = css.replace(
  /.about-pillar p {\n\s+font-family: var\(--font-body\), sans-serif;\n\s+font-size: 0.9rem;\n\s+color: var\(--text-secondary\);/,
  '.about-pillar p {\n  font-family: var(--font-body), sans-serif;\n  font-size: 0.9rem;\n  color: rgba(255,255,255,0.7);'
);

// Also update the section-eyebrow in about section to be gold instead of default
// Since .section-eyebrow is generic, we can just add a specific rule for .about-section .section-eyebrow
if (!css.includes('.about-section .section-eyebrow {')) {
  css = css.replace(
    /.about-text-col {/,
    '.about-section .section-eyebrow { color: var(--gold); }\n.about-text-col {'
  );
}

fs.writeFileSync(cssPath, css);
console.log('Mobile Hero and About section CSS updated successfully!');
