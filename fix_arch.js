const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'frontend/src/styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

const archCSS = `
/* ===== DESKTOP ARCH COLLECTIONS ===== */
.arch-collections-section {
  padding: 80px 20px 60px;
  background-color: #FCF7EB; /* Light warm beige */
  text-align: center;
  overflow: hidden;
}

.arch-collections-section .section-eyebrow {
  color: #C08D46;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.arch-collections-section .section-eyebrow::before,
.arch-collections-section .section-eyebrow::after {
  content: '✦';
  font-size: 0.7rem;
  opacity: 0.5;
}

.arch-collections-section .section-main-title {
  font-size: 2.4rem;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 60px;
}
.arch-collections-section .section-main-title .gold-text {
  color: #6FA6FF; /* Vibrant light blue */
}

.arch-collections-row {
  display: flex;
  justify-content: center;
  align-items: flex-end; /* Align to the bottom of the tallest card */
  max-width: 1200px;
  margin: 0 auto;
}

.arch-col-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: -50px; /* Overlapping */
  transition: transform 0.3s ease;
  position: relative;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.arch-col-item:last-child {
  margin-right: 0;
}

.arch-col-frame {
  width: 220px;
  border-radius: 110px 110px 24px 24px;
  border: 4px solid #FCF7EB; /* Matches background to create gap */
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  transition: all 0.3s ease;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arch-col-item:nth-child(1) .arch-col-frame { height: 220px; }
.arch-col-item:nth-child(2) .arch-col-frame { height: 280px; }
.arch-col-item:nth-child(3) .arch-col-frame { height: 360px; }
.arch-col-item:nth-child(4) .arch-col-frame { height: 280px; }
.arch-col-item:nth-child(5) .arch-col-frame { height: 220px; }

/* Z-index mountain */
.arch-col-item:nth-child(1) { z-index: 1; }
.arch-col-item:nth-child(2) { z-index: 2; }
.arch-col-item:nth-child(3) { z-index: 3; }
.arch-col-item:nth-child(4) { z-index: 2; }
.arch-col-item:nth-child(5) { z-index: 1; }

.arch-col-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.arch-col-item:hover .arch-col-img {
  transform: scale(1.08);
}
.arch-col-item:hover {
  transform: translateY(-5px);
}

.arch-col-label {
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: 0.1em;
  margin-top: 24px;
  color: #111;
  text-transform: uppercase;
  max-width: 180px;
  text-align: center;
  line-height: 1.3;
}
.arch-col-item.active .arch-col-label {
  color: #C08D46;
}

/* Adjustments for smaller screens */
@media (max-width: 1100px) {
  .arch-col-frame { width: 180px; border-radius: 90px 90px 20px 20px; }
  .arch-col-item:nth-child(1) .arch-col-frame { height: 180px; }
  .arch-col-item:nth-child(2) .arch-col-frame { height: 240px; }
  .arch-col-item:nth-child(3) .arch-col-frame { height: 300px; }
  .arch-col-item:nth-child(4) .arch-col-frame { height: 240px; }
  .arch-col-item:nth-child(5) .arch-col-frame { height: 180px; }
  .arch-col-item { margin-right: -40px; }
}
`;

// Only add it if it's not already there
if (!css.includes('/* ===== DESKTOP ARCH COLLECTIONS ===== */')) {
  // We'll insert it right before the mobile collections fix block to override old rules but still allow the mobile media query to apply
  const insertIndex = css.indexOf('/* ===== MOBILE COLLECTIONS FIX ===== */');
  if (insertIndex !== -1) {
    css = css.substring(0, insertIndex) + archCSS + '\\n' + css.substring(insertIndex);
    fs.writeFileSync(cssPath, css);
    console.log("Desktop Arch CSS added successfully!");
  } else {
    // just append if the mobile block is somehow missing
    fs.writeFileSync(cssPath, css + '\\n' + archCSS);
    console.log("Desktop Arch CSS appended at the end!");
  }
} else {
  console.log("Already exists.");
}
