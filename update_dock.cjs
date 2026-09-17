const fs = require('fs');

let code = fs.readFileSync('src/components/studio/StudioBottomDock.tsx', 'utf8');

// Increase icon size from w-7 h-7 to w-9 h-9
code = code.replace(/w-7 h-7/g, 'w-10 h-10');

// Increase vertical padding in buttons
code = code.replace(/py-4 sm:py-5/g, 'py-5 sm:py-7');

// Increase container padding
code = code.replace(/p-4 sm:p-5 px-8/g, 'p-5 sm:p-7 px-8');

// Increase height of divider to match new height
code = code.replace(/h-12 w-\[1px\]/g, 'h-16 w-[1px]');

fs.writeFileSync('src/components/studio/StudioBottomDock.tsx', code);
