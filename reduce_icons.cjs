const fs = require('fs');

let code = fs.readFileSync('src/components/studio/StudioBottomDock.tsx', 'utf8');

// Reduce icon sizes: w-5 h-5 (20px) -> w-4 h-4 (16px), and sm:w-9 sm:h-9 (36px) -> sm:w-7 sm:h-7 (28px)
code = code.replace(/w-5 h-5 sm:w-9 sm:h-9/g, 'w-4 h-4 sm:w-7 sm:h-7');

// Adjust vertical padding to maintain the exact same bar height
// Mobile: -4px icon size -> +2px padding (18 -> 20)
// Desktop: -8px icon size -> +4px padding (36 -> 40)
code = code.replace(/py-\[18px\] sm:py-\[36px\]/g, 'py-[20px] sm:py-[40px]');

fs.writeFileSync('src/components/studio/StudioBottomDock.tsx', code);
