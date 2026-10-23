const fs = require('fs');
let content = fs.readFileSync('src/components/SlideViewer.tsx', 'utf8');

content = content.replace('        </div>\n      </div>\n\n      </div>\n\n      </div>', '        </div>\n      </div>\n\n      </div>');

fs.writeFileSync('src/components/SlideViewer.tsx', content);
