const fs = require('fs');
let code = fs.readFileSync('src/components/studio/StudioBottomDock.tsx', 'utf8');

// Replace icon size classes: w-6 h-6 sm:w-11 sm:h-11 -> w-5 h-5 sm:w-8 sm:h-8
code = code.replace(/w-6 h-6 sm:w-11 sm:h-11/g, 'w-5 h-5 sm:w-9 sm:h-9');

// Change margins below icons slightly for perfect centering
code = code.replace(/mb-1 sm:mb-2\.5/g, 'mb-1 sm:mb-2.5'); // Keep as is to be safe

// Adjust padding to preserve exact height
code = code.replace(/py-4 sm:py-8/g, 'py-[18px] sm:py-[36px]'); 

fs.writeFileSync('src/components/studio/StudioBottomDock.tsx', code);
