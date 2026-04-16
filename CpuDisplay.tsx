import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Activity } from 'lucide-react';
import type { Process } from '../types';

interface Props {
  cpuProcessId: string | null;
  processes: Process[];
  currentTime: number;
  remainingTimes: Record<string, number>;
}

export default function CpuDisplay({ cpuProcessId, processes, currentTime, remainingTimes }: Props) {
  const proc = cpuProcessId ? processes.find(p => p.id === cpuProcessId) : null;
  const remaining = proc ? (remainingTimes[proc.id] ?? proc.burstTime) : 0;
  const progress = proc ? ((proc.burstTime - remaining) / proc.burstTime) * 100 : 0;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-accent-cyan/20 flex items-center justify-center">
          <Cpu className="w-3.5 h-3.5 text-accent-cyan" />
        </div>
        <h3 className="section-title">CPU Core</h3>

        {/* Status indicator */}
        <div className="ml-auto flex items-center gap-2">
          <motion.div
            animate={proc ? { opacity: [1, 0.3, 1] } : { opacity: 0.3 }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`w-2 h-2 rounded-full ${proc ? 'bg-accent-green' : 'bg-gray-600'}`}
          />
          <span className={`text-xs font-mono ${proc ? 'text-accent-green' : 'text-gray-600'}`}>
            {proc ? 'RUNNING' : 'IDLE'}
          </span>
        </div>
      </div>

      {/* Main CPU box */}
      <div className="relative flex items-center justify-center">
        {/* Outer glow ring */}
        <motion.div
          animate={proc ? {
            boxShadow: [
              `0 0 0 2px ${proc.color}20, 0 0 30px ${proc.color}30`,
              `0 0 0 4px ${proc.color}30, 0 0 50px ${proc.color}20`,
              `0 0 0 2px ${proc.color}20, 0 0 30px ${proc.color}30`,
            ]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-2xl"
        />

        <div
          className="w-full rounded-2xl border-2 p-6 flex flex-col items-center gap-3 transition-all duration-500"
          style={proc ? {
            borderColor: `${proc.color}40`,
            background: `radial-gradient(circle at center, ${proc.color}08 0%, transparent 70%)`,
          } : {
            borderColor: 'rgba(255,255,255,0.05)',
          }}
        >
          <AnimatePresence mode="wait">
            {proc ? (
              <motion.div
                key={proc.id}
                initial={{ opacity: 0, scale: 0.5, rotateX: -90 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotateX: 90 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="flex flex-col items-center gap-2 w-full"
              >
                {/* Process color dot */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold font-mono border-2"
                  style={{
                    backgroundColor: `${proc.color}20`,
                    borderColor: `${proc.color}60`,
                    color: proc.color,
                    boxShadow: `0 0 20px ${proc.color}30`,
                  }}
                >
                  {proc.id}
                </div>

                {/* Burst info */}
                <div className="text-center">
                  <div className="text-xs text-gray-500 font-mono">Remaining Burst</div>
                  <div className="text-2xl font-bold font-mono" style={{ color: proc.color }}>
                    {remaining}
                    <span className="text-sm text-gray-500">/{proc.burstTime}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: proc.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>

                {/* Activity indicator */}
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500 font-mono">Processing @ t={currentTime}</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-gray-700 flex items-center justify-center">
                  <Cpu className="w-7 h-7 text-gray-700" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-mono text-gray-600">IDLE</div>
                  <div className="text-xs text-gray-700">Waiting for process...</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Time display */}
      <div className="mt-3 text-center">
        <span className="font-mono text-xs text-gray-600">t = </span>
        <motion.span
          key={currentTime}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-lg font-bold text-accent-cyan"
        >
          {currentTime}
        </motion.span>
      </div>
    </div>
  );
}
