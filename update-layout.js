const fs = require('fs');
let content = fs.readFileSync('src/components/SlideViewer.tsx', 'utf8');

// Wrap MOCKUP CONTAINER and TIMELINE
content = content.replace('      {/* MOCKUP CONTAINER */}', '      {/* MAIN CONTENT AREA */}\n      <div className="flex flex-col xl:flex-row gap-5 flex-1 min-h-0">\n        {/* MOCKUP CONTAINER */}');

// Adjust the TIMELINE section
const timelineStartIdx = content.indexOf('      {/* HORIZONTAL INTERACTIVE TIMELINE AT BOTTOM */}');
const timelineEndIdx = content.indexOf('      {/* HIDDEN EXPORT RENDER CONTAINER', timelineStartIdx);

let timelineContent = content.substring(timelineStartIdx, timelineEndIdx);
timelineContent = timelineContent.replace('HORIZONTAL INTERACTIVE TIMELINE AT BOTTOM', 'TIMELINE (MOVED TO RIGHT)');
timelineContent = timelineContent.replace('Navigasi Timeline Slide', 'Timeline Slide');
timelineContent = timelineContent.replace('className="space-y-2"', 'className="w-full xl:w-[130px] shrink-0 space-y-3 flex flex-col"');
timelineContent = timelineContent.replace('className="flex items-center gap-2 overflow-x-auto pb-2 pr-1 scrollbar-thin"', 'className="flex xl:flex-col items-center xl:items-stretch gap-2 overflow-auto pb-2 xl:pb-0 pr-1 scrollbar-thin xl:flex-1"');
timelineContent = timelineContent.replace('className={`p-2.5 rounded-xl border shrink-0 text-left transition-all w-[95px] h-[72px] flex flex-col justify-between', 'className={`p-2.5 rounded-xl border shrink-0 text-left transition-all w-[95px] xl:w-full h-[72px] flex flex-col justify-between');

// Close the wrapper
timelineContent = timelineContent + '      </div>\n\n';

content = content.substring(0, timelineStartIdx) + timelineContent + content.substring(timelineEndIdx);

fs.writeFileSync('src/components/SlideViewer.tsx', content);
