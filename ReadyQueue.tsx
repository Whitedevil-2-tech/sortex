import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, RefreshCw, Layers } from 'lucide-react';
import type { Process } from '../types';

interface Props {
  queueIds: string[];
  processes: Process[];
  algorithm: string;
}

function getProcess(id: string, processes: Process[]) {
  return processes.find(p => p.id === id);
}

export default function ReadyQueue({ queueIds, processes, algorithm }: Props) {
  const isRR = algorithm === 'RoundRobin';

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent-purple/20 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 text-accent-purple" />
          </div>
          <h3 className="section-title">Ready Queue</h3>
          {isRR && (
            <span className="tag bg-accent-purple/15 text-accent-purple border border-accent-purple/20">
              <RefreshCw className="w-2.5 h-2.5 mr-1" /> Circular
            </span>
          )}
        </div>
        <span className="font-mono text-xs text-gray-500">
          {queueIds.length} process{queueIds.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {/* Queue visual */}
      <div className="relative min-h-[72px] flex items-center">
        {/* Queue bracket left */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between py-1">
          <div className="w-3 h-3 border-t-2 border-l-2 border-accent-purple/30 rounded-tl" />
          <div className="w-3 h-3 border-b-2 border-l-2 border-accent-purple/30 rounded-bl" />
        </div>

        <div className="flex-1 flex items-center gap-2 px-5 overflow-x-auto py-2 no-scrollbar">
          <AnimatePresence mode="popLayout">
            {queueIds.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center"
              >
                <span className="text-xs text-gray-700 font-mono italic">— empty —</span>
              </motion.div>
            ) : (
              queueIds.map((id, idx) => {
                const proc = getProcess(id, processes);
                if (!proc) return null;
                return (
                  <motion.div
                    key={`${id}-${idx}`}
                    layout
                    initial={{ opacity: 0, scale: 0.6, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.6, x: 20 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="relative shrink-0"
                  >
                    {/* Process chip */}
                    <div
                      className="relative w-14 h-14 rounded-xl flex flex-col items-center justify-center
                                 border-2 font-mono text-sm font-bold shadow-lg"
                      style={{
                        backgroundColor: `${proc.color}15`,
                        borderColor: `${proc.color}60`,
                        color: proc.color,
                        boxShadow: `0 0 12px ${proc.color}20`,
                      }}
                    >
                      <span className="text-base font-bold">{proc.id}</span>
                      <span className="text-xs opacity-60">bt:{proc.burstTime}</span>
                    </div>

                    {/* Arrow between chips */}
                    {idx < queueIds.length - 1 && (
                      <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                        <ArrowRight className="w-3 h-3 text-gray-600" />
                      </div>
                    )}

                    {/* Position label */}
                    <div className="absolute -bottom-5 left-0 right-0 text-center text-xs text-gray-700 font-mono">
                      {idx + 1}
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>

          {/* Circular arrow for RR */}
          {isRR && queueIds.length > 0 && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="shrink-0 ml-2 text-accent-purple/40"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.div>
          )}
        </div>

        {/* Queue bracket right */}
        <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between py-1">
          <div className="w-3 h-3 border-t-2 border-r-2 border-accent-purple/30 rounded-tr" />
          <div className="w-3 h-3 border-b-2 border-r-2 border-accent-purple/30 rounded-br" />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-3 border-t border-white/5 flex items-center gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1"><ArrowRight className="w-3 h-3" /> FIFO order (front → rear)</span>
        {isRR && <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Cyclic re-queue</span>}
      </div>
    </div>
  );
}
