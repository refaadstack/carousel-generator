const fs = require('fs');
let content = fs.readFileSync('src/components/SlideViewer.tsx', 'utf8');

content = content.replace(/      \{\/\* MAIN CONTENT AREA \*\/\}\n      <div className="flex flex-col xl:flex-row gap-5 flex-1 min-h-0">\n        \{\/\* MAIN CONTENT AREA \*\/\}\n      <div className="flex flex-col xl:flex-row gap-5 flex-1 min-h-0 overflow-hidden">\n        \{\/\* MOCKUP CONTAINER \*\/\}/g, '      {/* MAIN CONTENT AREA */}\n      <div className="flex flex-col xl:flex-row gap-5 flex-1 min-h-0 overflow-hidden">\n        {/* MOCKUP CONTAINER */}');

fs.writeFileSync('src/components/SlideViewer.tsx', content);
