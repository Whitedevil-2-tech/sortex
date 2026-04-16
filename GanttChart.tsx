import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import type { GanttEntry, Process } from '../types';

interface Props {
  entries: GanttEntry[];
  processes: Process[];
  currentTime: number;
}

export default function GanttChart({ entries, processes, currentTime }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (entries.length === 0) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-accent-orange/20 flex items-center justify-center">
            <BarChart3 className="w-3.5 h-3.5 text-accent-orange" />
          </div>
          <h3 className="section-title">Gantt Chart</h3>
        </div>
        <div className="h-20 flex items-center justify-center border-2 border-dashed border-dark-500 rounded-xl">
          <span className="text-sm text-gray-700 font-mono italic">Run the simulation to see the timeline...</span>
        </div>
      </div>
    );
  }

  const totalTime = entries[entries.length - 1]?.endTime ?? currentTime;
  const BLOCK_WIDTH = 48; // px per unit time

  const getProcess = (id: string) => processes.find(p => p.id === id);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-accent-orange/20 flex items-center justify-center">
          <BarChart3 className="w-3.5 h-3.5 text-accent-orange" />
        </div>
        <h3 className="section-title">Gantt Chart</h3>
        <span className="ml-auto font-mono text-xs text-gray-500">
          t=0 → t={totalTime}
        </span>
      </div>

      <div ref={scrollRef} className="overflow-x-auto pb-4 scroll-smooth">
        <div style={{ minWidth: `${(totalTime + 1) * BLOCK_WIDTH}px` }}>
          {/* Bars */}
          <div className="relative h-14 flex">
            <AnimatePresence mode="popLayout">
              {entries.map((entry, idx) => {
                const proc = entry.processId === 'IDLE' ? null : getProcess(entry.processId);
                const width = (entry.endTime - entry.startTime) * BLOCK_WIDTH;
                const left = entry.startTime * BLOCK_WIDTH;
                const color = proc?.color ?? '#374151';
                const isIdle = entry.processId === 'IDLE';

                return (
                  <motion.div
                    key={`${entry.processId}-${entry.startTime}`}
                    layout
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 30,
                      delay: idx * 0.05,
                    }}
                    style={{
                      position: 'absolute',
                      left: `${left}px`,
                      width: `${width}px`,
                      transformOrigin: 'left center',
                    }}
                    className="h-full px-1 group"
                    title={`${entry.processId}: t=${entry.startTime} → t=${entry.endTime}`}
                  >
                    <div
                      className="h-full rounded-md flex items-center justify-center relative overflow-hidden border"
                      style={{
                        backgroundColor: isIdle ? 'rgba(55,65,81,0.3)' : `${color}25`,
                        borderColor: isIdle ? 'rgba(55,65,81,0.5)' : `${color}60`,
                      }}
                    >
                      {/* Shimmer effect */}
                      {!isIdle && (
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{
                            background: `linear-gradient(90deg, transparent 0%, ${color}25 50%, transparent 100%)`,
                          }}
                        />
                      )}

                      {/* Label */}
                      {width >= 30 && (
                        <span
                          className="font-mono text-xs font-bold z-10 select-none"
                          style={{ color: isIdle ? '#6b7280' : color }}
                        >
                          {entry.processId}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Time axis */}
          <div className="relative h-6 mt-1">
            {Array.from({ length: totalTime + 1 }, (_, t) => (
              <div
                key={t}
                className="absolute flex flex-col items-center"
                style={{ left: `${t * BLOCK_WIDTH}px`, transform: 'translateX(-50%)' }}
              >
                <div className="w-px h-2 bg-dark-500" />
                <span className="text-xs font-mono text-gray-600">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2 pt-3 border-t border-white/5 flex flex-wrap gap-3">
        {processes.map(proc => (
          <div key={proc.id} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: `${proc.color}60`, border: `1px solid ${proc.color}80` }}
            />
            <span className="text-xs font-mono text-gray-500">{proc.id}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gray-700/30 border border-gray-600/50" />
          <span className="text-xs font-mono text-gray-500">IDLE</span>
        </div>
      </div>
    </div>
  );
}
