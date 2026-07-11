const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'frontend/src/styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

const newFooterCSS = `/* ===== FOOTER ===== */
.footer {
  background: linear-gradient(135deg, #012a32 0%, #03404c 100%);
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  padding: 0;
  font-size: 0.95rem;
  border-top: 1px solid rgba(201, 168, 76, 0.3);
  position: relative;
  overflow: hidden;
}

.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
  opacity: 0.8;
}

.footer a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  display: inline-block;
}

.footer a:hover {
  color: var(--gold);
  transform: translateX(4px);
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 70px 24px 30px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 50px;
  text-align: left;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 24px;
}

.footer-logo-img {
  width: 68px;
  height: 68px;
  object-fit: cover;
  border-radius: var(--radius-full);
  box-shadow: 0 4px 15px rgba(0,0,0,0.4);
  border: 2px solid rgba(201, 168, 76, 0.5);
  background: #fff;
}

.footer-brand-name {
  font-family: var(--font-heading);
  font-size: 1.8rem;
  color: var(--gold);
  letter-spacing: 1px;
}

.footer-brand-tag {
  font-size: 0.85rem;
  color: #fff;
  opacity: 0.9;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  margin-top: 4px;
}

.footer-brand-desc {
  line-height: 1.8;
  opacity: 0.8;
  font-size: 0.95rem;
  max-width: 90%;
}

.footer-col-title {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  color: #fff;
  margin-bottom: 28px;
  position: relative;
  display: inline-block;
  padding-bottom: 10px;
  letter-spacing: 0.5px;
}

.footer-col-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 45px;
  height: 2px;
  background: var(--gold);
}

.footer-links-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-contact-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.footer-contact-item svg {
  margin-top: 4px;
  flex-shrink: 0;
}

.footer-contact-item a {
  color: rgba(255, 255, 255, 0.8);
}
.footer-contact-item a:hover {
  color: var(--gold);
  transform: none;
}

.footer-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
  margin: 60px 0 24px;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  opacity: 0.85;
}

.footer-bottom-tagline {
  color: var(--gold);
  font-weight: 600;
  letter-spacing: 1px;
}
`;

const startIndex = css.indexOf('/* ===== FOOTER ===== */');
const endIndex = css.indexOf('/* ===== PRODUCT DETAIL MODAL ===== */');

if (startIndex !== -1 && endIndex !== -1) {
  css = css.substring(0, startIndex) + newFooterCSS + '\n' + css.substring(endIndex);
  fs.writeFileSync(cssPath, css);
  console.log("Footer CSS updated successfully");
} else {
  console.log("Could not find footer block");
}
