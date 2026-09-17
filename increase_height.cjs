const fs = require('fs');

let code = fs.readFileSync('src/components/studio/StudioBottomDock.tsx', 'utf8');

// The dock container's height is determined by the content height (padding of buttons).
// We want to increase height by increasing top and bottom padding equally.
// Current padding: py-[20px] sm:py-[40px]
// Let's add 6px to mobile (py-[26px]) and 12px to desktop (py-[52px])

code = code.replace(/py-\[20px\] sm:py-\[40px\]/g, 'py-[26px] sm:py-[52px]');

// We should also ensure the vertical divider height increases proportionally to maintain design integrity.
// Current divider: h-10 sm:h-20
// Let's increase to h-12 sm:h-24
code = code.replace(/h-10 sm:h-20 w-\[1px\]/g, 'h-12 sm:h-24 w-[1px]');

fs.writeFileSync('src/components/studio/StudioBottomDock.tsx', code);
