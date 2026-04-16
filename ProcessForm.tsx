import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Cpu, Hash, Clock, Zap, Target } from 'lucide-react';
import type { Process } from '../types';

const PROCESS_COLORS = [
  '#4f9cf9', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#06b6d4', '#ec4899', '#84cc16',
  '#f97316', '#a78bfa', '#34d399', '#fbbf24',
];

interface Props {
  onAdd: (p: Process) => void;
  existingIds: string[];
  existingCount: number;
}

export default function ProcessForm({ onAdd, existingIds, existingCount }: Props) {
  const nextNum = existingCount + 1;
  const [name, setName] = useState(`P${nextNum}`);
  const [arrival, setArrival] = useState('0');
  const [burst, setBurst] = useState('5');
  const [priority, setPriority] = useState('1');
  const [color, setColor] = useState(PROCESS_COLORS[existingCount % PROCESS_COLORS.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const id = name.trim() || `P${nextNum}`;
    if (existingIds.includes(id)) {
      alert(`Process "${id}" already exists. Use a unique name.`);
      return;
    }
    if (parseInt(burst) <= 0) {
      alert('Burst time must be > 0');
      return;
    }

    const proc: Process = {
      id,
      name: id,
      arrivalTime: Math.max(0, parseInt(arrival) || 0),
      burstTime: Math.max(1, parseInt(burst) || 1),
      priority: Math.max(1, parseInt(priority) || 1),
      color,
      remainingTime: Math.max(1, parseInt(burst) || 1),
    };

    onAdd(proc);

    // Reset form for next process
    const nextColor = PROCESS_COLORS[(existingCount + 1) % PROCESS_COLORS.length];
    setName(`P${nextNum + 1}`);
    setArrival('0');
    setBurst('5');
    setPriority('1');
    setColor(nextColor);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="glass-card p-5 space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-accent-blue/20 flex items-center justify-center">
          <Plus className="w-4 h-4 text-accent-blue" />
        </div>
        <h2 className="text-sm font-semibold text-white">Add Process</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Process ID */}
        <div className="col-span-2">
          <label className="label flex items-center gap-1">
            <Hash className="w-3 h-3" /> Process ID
          </label>
          <input
            className="input-field font-mono"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="P1"
            maxLength={8}
          />
        </div>

        {/* Arrival Time */}
        <div>
          <label className="label flex items-center gap-1">
            <Clock className="w-3 h-3" /> Arrival
          </label>
          <input
            type="number"
            min="0"
            className="input-field"
            value={arrival}
            onChange={e => setArrival(e.target.value)}
          />
        </div>

        {/* Burst Time */}
        <div>
          <label className="label flex items-center gap-1">
            <Cpu className="w-3 h-3" /> Burst
          </label>
          <input
            type="number"
            min="1"
            className="input-field"
            value={burst}
            onChange={e => setBurst(e.target.value)}
          />
        </div>

        {/* Priority */}
        <div>
          <label className="label flex items-center gap-1">
            <Target className="w-3 h-3" /> Priority
          </label>
          <input
            type="number"
            min="1"
            className="input-field"
            value={priority}
            onChange={e => setPriority(e.target.value)}
          />
        </div>

        {/* Color */}
        <div>
          <label className="label flex items-center gap-1">
            <Zap className="w-3 h-3" /> Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
            />
            <div className="flex flex-wrap gap-1">
              {PROCESS_COLORS.slice(0, 6).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? 'white' : 'transparent',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <button type="submit" className="btn-primary w-full justify-center py-2.5">
        <Plus className="w-4 h-4" />
        Add Process
      </button>
    </motion.form>
  );
}
