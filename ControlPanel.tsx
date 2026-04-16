import { motion } from 'framer-motion';
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw,
  Zap, ChevronRight, Settings2, RefreshCw
} from 'lucide-react';
import type { Algorithm } from '../types';

const ALGORITHMS: { value: Algorithm; label: string; shortLabel: string; description: string }[] = [
  { value: 'FCFS', label: 'First Come First Serve', shortLabel: 'FCFS', description: 'Non-preemptive' },
  { value: 'SJF', label: 'Shortest Job First', shortLabel: 'SJF', description: 'Non-preemptive' },
  { value: 'Priority', label: 'Priority Scheduling', shortLabel: 'Priority', description: 'Non-preemptive' },
  { value: 'RoundRobin', label: 'Round Robin', shortLabel: 'RR', description: 'Preemptive' },
];

const SPEED_LABELS = ['0.5×', '1×', '2×', '4×'];

interface Props {
  algorithm: Algorithm;
  timeQuantum: number;
  isPlaying: boolean;
  isSimulationReady: boolean;
  isFinished: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  playSpeed: number;
  onAlgorithmChange: (a: Algorithm) => void;
  onQuantumChange: (q: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onRun: () => void;
  onReset: () => void;
  onSpeedChange: (s: number) => void;
}

export default function ControlPanel({
  algorithm, timeQuantum, isPlaying, isSimulationReady, isFinished,
  canGoBack, canGoForward, playSpeed,
  onAlgorithmChange, onQuantumChange,
  onPlay, onPause, onNext, onPrev, onRun, onReset, onSpeedChange,
}: Props) {
  return (
    <div className="glass-card p-4 space-y-4">
      {/* Algorithm Selector */}
      <div>
        <label className="label flex items-center gap-1">
          <Settings2 className="w-3 h-3" /> Algorithm
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ALGORITHMS.map(algo => (
            <button
              key={algo.value}
              onClick={() => onAlgorithmChange(algo.value)}
              className={`p-2.5 rounded-lg border text-left transition-all duration-200 ${
                algorithm === algo.value
                  ? 'border-accent-blue/60 bg-accent-blue/10 text-white shadow-glow-blue'
                  : 'border-white/5 bg-dark-800/50 text-gray-400 hover:border-white/15 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold">{algo.shortLabel}</span>
                {algorithm === algo.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-1.5 h-1.5 rounded-full bg-accent-blue"
                  />
                )}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{algo.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Time Quantum (RR only) */}
      {algorithm === 'RoundRobin' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <label className="label flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Time Quantum
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range" min="1" max="10" value={timeQuantum}
              onChange={e => onQuantumChange(+e.target.value)}
              className="flex-1 accent-accent-purple h-1.5"
            />
            <span className="font-mono text-accent-purple font-bold text-lg w-8 text-center">
              {timeQuantum}
            </span>
          </div>
        </motion.div>
      )}

      {/* Run Button */}
      {!isSimulationReady && (
        <button onClick={onRun} className="btn-primary w-full justify-center py-3 text-base">
          <Zap className="w-4 h-4" />
          Run Simulation
        </button>
      )}

      {/* Playback Controls */}
      {isSimulationReady && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            {/* Prev */}
            <button
              onClick={onPrev}
              disabled={!canGoBack}
              className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-gray-400
                         hover:border-white/20 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play / Pause */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={isPlaying ? onPause : onPlay}
              disabled={isFinished && !isPlaying}
              className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200
                ${isPlaying
                  ? 'bg-accent-orange text-white hover:bg-orange-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                  : 'bg-accent-blue text-white hover:bg-blue-400 shadow-glow-blue'
                } disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 translate-x-0.5" />}
            </motion.button>

            {/* Next */}
            <button
              onClick={onNext}
              disabled={!canGoForward}
              className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-gray-400
                         hover:border-white/20 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Speed selector */}
          <div className="flex items-center gap-1 justify-center">
            <span className="text-xs text-gray-600 mr-1">Speed</span>
            {SPEED_LABELS.map((label, i) => (
              <button
                key={i}
                onClick={() => onSpeedChange(i)}
                className={`px-2 py-0.5 rounded text-xs font-mono transition-all ${
                  playSpeed === i
                    ? 'bg-accent-purple/30 text-accent-purple border border-accent-purple/40'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Finish badge */}
          {isFinished && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 py-2 rounded-lg bg-accent-green/10 border border-accent-green/20 text-accent-green text-sm font-medium"
            >
              <ChevronRight className="w-4 h-4" />
              Simulation Complete
            </motion.div>
          )}

          {/* Reset */}
          <button onClick={onReset} className="btn-secondary w-full justify-center">
            <RotateCcw className="w-3.5 h-3.5" /> Reset Simulation
          </button>
        </div>
      )}
    </div>
  );
}
