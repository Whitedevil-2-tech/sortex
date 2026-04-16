import { motion } from 'framer-motion';
import { Timer, TrendingUp, CheckCircle2, Clock3 } from 'lucide-react';
import type { ProcessMetrics, Process } from '../types';

interface Props {
  currentTime: number;
  completedMetrics: ProcessMetrics[];
  processes: Process[];
  totalProcesses: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="metric-card"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-3 h-3" style={{ color }} />
        </div>
      </div>
      <div className="flex items-baseline gap-1 mt-1">
        <motion.span
          key={String(value)}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold font-mono"
          style={{ color }}
        >
          {value}
        </motion.span>
        {unit && <span className="text-xs text-gray-600">{unit}</span>}
      </div>
    </motion.div>
  );
}

export default function MetricsDashboard({ currentTime, completedMetrics, processes, totalProcesses }: Props) {
  const avgWT = completedMetrics.length > 0
    ? (completedMetrics.reduce((s, m) => s + m.waitingTime, 0) / completedMetrics.length).toFixed(2)
    : '—';

  const avgTAT = completedMetrics.length > 0
    ? (completedMetrics.reduce((s, m) => s + m.turnaroundTime, 0) / completedMetrics.length).toFixed(2)
    : '—';

  const getProcess = (id: string) => processes.find(p => p.id === id);

  return (
    <div className="space-y-3">
      {/* Top stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Timer}
          label="Current Time"
          value={currentTime}
          unit="units"
          color="#06b6d4"
          delay={0}
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={`${completedMetrics.length}/${totalProcesses}`}
          color="#10b981"
          delay={0.05}
        />
        <StatCard
          icon={Clock3}
          label="Avg Waiting Time"
          value={avgWT}
          unit="units"
          color="#f59e0b"
          delay={0.1}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Turnaround"
          value={avgTAT}
          unit="units"
          color="#8b5cf6"
          delay={0.15}
        />
      </div>

      {/* Per-process table */}
      {completedMetrics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-white/5">
            <h3 className="section-title text-xs">Process Metrics</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-white/5">
                  {['PID', 'CT', 'TAT', 'WT'].map(h => (
                    <th key={h} className="px-4 py-2 text-left text-gray-600 uppercase tracking-wider font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {completedMetrics.map((m, i) => {
                  const proc = getProcess(m.processId);
                  return (
                    <motion.tr
                      key={m.processId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/3 transition-colors"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: proc?.color ?? '#gray' }}
                          />
                          <span className="font-semibold" style={{ color: proc?.color ?? 'white' }}>
                            {m.processId}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-accent-cyan">{m.completionTime}</td>
                      <td className="px-4 py-2.5 text-accent-purple">{m.turnaroundTime}</td>
                      <td className="px-4 py-2.5 text-accent-orange">{m.waitingTime}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
