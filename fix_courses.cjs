const fs = require('fs');
let code = fs.readFileSync('src/components/studio/StudioView.tsx', 'utf8');

const targetStr = `                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="px-3 py-1 rounded-xl text-xs font-mono font-bold border shadow-sm"
                        style={{
                          backgroundColor: \`\${course.color}25\`,
                          borderColor: \`\${course.color}50\`,
                          color: course.color,
                        }}
                      >
                        {course.number}
                      </span>
                      <span className="text-xs text-slate-300 font-medium">
                        {course.noteCount} {course.noteCount === 1 ? 'note' : 'notes'}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-white group-hover:text-cyan-200 transition-colors line-clamp-1">
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed min-h-[2rem]">
                      {course.description}
                    </p>

                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{course.instructor}</span>
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                    <div className="flex-1 space-y-1.5">
                      <div className="flex justify-between text-[10px] text-slate-300 font-mono">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: \`\${course.progress}%\`,
                            backgroundColor: course.color,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider group-hover:text-white transition-colors">
                        Open
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>`;

const newStr = `                  {/* Top Content */}
                  <div className="space-y-4">
                    {/* Header: Number & Notes */}
                    <div className="flex items-center gap-3">
                      <span
                        className="px-3 py-1 rounded-[14px] text-xs font-mono font-extrabold border shadow-sm"
                        style={{
                          backgroundColor: \`\${course.color}20\`,
                          borderColor: \`\${course.color}40\`,
                          color: course.color,
                        }}
                      >
                        {course.number}
                      </span>
                      <span className="text-xs text-slate-300 font-medium">
                        {course.noteCount} {course.noteCount === 1 ? 'note' : 'notes'}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-xl sm:text-2xl text-white group-hover:text-white/90 transition-colors line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed min-h-[40px]">
                        {course.description}
                      </p>
                    </div>

                    {/* Instructor */}
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400/80 flex-shrink-0" />
                      <span className="truncate">{course.instructor}</span>
                    </p>
                  </div>

                  {/* Bottom Baseline Content */}
                  <div className="mt-6 pt-5 border-t border-white/10 flex items-end justify-between gap-5">
                    {/* Progress Bar Container */}
                    <div className="flex-1 space-y-2 mb-0.5">
                      <div className="flex justify-between items-center text-[10px] text-slate-300 font-mono tracking-wide">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden shadow-inner">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: \`\${course.progress}%\`,
                            backgroundColor: course.color,
                          }}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-1 cursor-pointer">
                      <span className="text-[13px] font-extrabold text-white group-hover:text-blue-200 transition-colors">
                        Open
                      </span>
                      <ChevronRight className="w-4 h-4 text-white group-hover:text-blue-200 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>`;

code = code.replace(targetStr, newStr);

// Let's also make sure the container grid is correctly aligned and cards have `overflow-hidden`.
// Replace `className="group relative rounded-[32px] sm:rounded-[38px] p-7 flex flex-col justify-between transition-all duration-300 hover:scale-[1.015] border`
// with `className="group relative overflow-hidden rounded-[32px] sm:rounded-[38px] p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:scale-[1.015] border`
code = code.replace(/className={\`group relative rounded-\[32px\] sm:rounded-\[38px\] p-7 flex flex-col justify-between/g, 'className={`group relative overflow-hidden rounded-[32px] sm:rounded-[38px] p-6 sm:p-8 flex flex-col justify-between min-h-[280px]');

fs.writeFileSync('src/components/studio/StudioView.tsx', code);
