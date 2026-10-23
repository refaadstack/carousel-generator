const fs = require('fs');
let content = fs.readFileSync('src/components/SlideViewer.tsx', 'utf8');

content = content.replace(/        <\/div>\n      <\/div>\n      <\/div>\n      <\/div>/, '        </div>\n      </div>\n      </div>');

fs.writeFileSync('src/components/SlideViewer.tsx', content);
