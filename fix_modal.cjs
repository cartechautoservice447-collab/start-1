const fs = require('fs');
let code = fs.readFileSync('src/components/studio/CourseDetailModal.tsx', 'utf8');

code = code.replace(
`        {activeView === 'collections' && (
          <div className="absolute inset-0 z-20 flex flex-col bg-black/40 backdrop-blur-sm rounded-[36px] sm:rounded-[48px] md:rounded-[56px] p-5 sm:p-8 md:p-10 lg:p-12 animate-fade-in">
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">`,
`        {activeView === 'collections' && (
          <>
            {/* Layer behind Collections to blur the underlying interface */}
            <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[4px] rounded-[36px] sm:rounded-[48px] md:rounded-[56px] pointer-events-auto" />
            
            {/* Collections content container */}
            <div className="absolute inset-0 z-20 flex flex-col p-5 sm:p-8 md:p-10 lg:p-12 pointer-events-none">
              <div className="flex-1 flex flex-col h-full overflow-hidden animate-fade-in pointer-events-auto">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">`
);

code = code.replace(
`              )}
            </div>
          </div>
          </div>
        )}`,
`              )}
            </div>
          </div>
          </div>
          </>
        )}`
);

fs.writeFileSync('src/components/studio/CourseDetailModal.tsx', code);
console.log('Fixed sibling structure!');
