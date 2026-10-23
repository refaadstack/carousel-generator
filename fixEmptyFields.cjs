const fs = require('fs');
let code = fs.readFileSync('src/components/SlideViewer.tsx', 'utf8');

// 1. subtitle empty check
code = code.replace(/if \(!slide.subtitle\) return null;/g, "if (!slide.subtitle || slide.subtitle.trim() === '') return null;");

// 2. renderFormattedText empty check
code = code.replace(/if \(!text\) return null;/g, "if (!text || text.trim() === '') return null;");

// 3. title checks
code = code.replace(/\{currentSlide\.title && \(/g, "{currentSlide.title && currentSlide.title.trim() !== '' && (");
code = code.replace(/\{slide\.title && \(/g, "{slide.title && slide.title.trim() !== '' && (");

// 4. body array checks
// For preview: (currentSlide.body || []).length > 0 => (currentSlide.body || []).filter(i=>i&&i.trim()!=='').length > 0
code = code.replace(/currentSlide\.body && currentSlide\.body\.length > 0/g, "currentSlide.body && currentSlide.body.filter(i=>i&&i.trim()!=='').length > 0");
code = code.replace(/currentSlide\.body\.map\(/g, "currentSlide.body.filter(i=>i&&i.trim()!=='').map(");

code = code.replace(/slide\.body && slide\.body\.length > 0/g, "slide.body && slide.body.filter(i=>i&&i.trim()!=='').length > 0");
code = code.replace(/slide\.body\.map\(/g, "slide.body.filter(i=>i&&i.trim()!=='').map(");

// 5. Comparison array checks
code = code.replace(/\(currentSlide\.comparisonLeftItems \|\| \[\]\)\.length > 0/g, "(currentSlide.comparisonLeftItems || []).filter(i=>i&&i.trim()!=='').length > 0");
code = code.replace(/\(currentSlide\.comparisonLeftItems \|\| \[\]\)\.map\(/g, "(currentSlide.comparisonLeftItems || []).filter(i=>i&&i.trim()!=='').map(");

code = code.replace(/\(currentSlide\.comparisonRightItems \|\| \[\]\)\.length > 0/g, "(currentSlide.comparisonRightItems || []).filter(i=>i&&i.trim()!=='').length > 0");
code = code.replace(/\(currentSlide\.comparisonRightItems \|\| \[\]\)\.map\(/g, "(currentSlide.comparisonRightItems || []).filter(i=>i&&i.trim()!=='').map(");

code = code.replace(/\(slide\.comparisonLeftItems \|\| \[\]\)\.length > 0/g, "(slide.comparisonLeftItems || []).filter(i=>i&&i.trim()!=='').length > 0");
code = code.replace(/\(slide\.comparisonLeftItems \|\| \[\]\)\.map\(/g, "(slide.comparisonLeftItems || []).filter(i=>i&&i.trim()!=='').map(");

code = code.replace(/\(slide\.comparisonRightItems \|\| \[\]\)\.length > 0/g, "(slide.comparisonRightItems || []).filter(i=>i&&i.trim()!=='').length > 0");
code = code.replace(/\(slide\.comparisonRightItems \|\| \[\]\)\.map\(/g, "(slide.comparisonRightItems || []).filter(i=>i&&i.trim()!=='').map(");


fs.writeFileSync('src/components/SlideViewer.tsx', code);
console.log('Fixed empty field checks.');
