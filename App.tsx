import { motion } from 'framer-motion';
import { Cpu, BookOpen, Sparkles } from 'lucide-react';
import { useScheduler } from './hooks/useScheduler';
import ProcessForm from './components/ProcessForm';
import ProcessList from './components/ProcessList';
import ControlPanel from './components/ControlPanel';
import ReadyQueue from './components/ReadyQueue';
import CpuDisplay from './components/CpuDisplay';
import GanttChart from './components/GanttChart';
import MetricsDashboard from './components/MetricsDashboard';

const ALGO_DESCRIPTION: Record<string, string> = {
  FCFS: 'Processes are executed in the order they arrive. Simple & fair but can cause the "Convoy Effect".',
  SJF: 'The process with the shortest burst time is chosen next. Optimal average waiting time but may cause starvation.',
  Priority: 'Each process has a priority; the highest-priority (lowest value) process runs next. Can starve low-priority processes.',
  RoundRobin: 'Each process runs for a fixed time slice (quantum) in round-robin order. Preemptive & fair for interactive systems.',
};

export default function App() {
  const scheduler = useScheduler();
  const {
    processes, algorithm, timeQuantum, currentStep, isPlaying,
    isSimulationReady, isFinished, currentStepIndex, steps, playSpeed,
    setAlgorithm, setTimeQuantum, runSimulation,
    nextStep, prevStep, reset, play, pause, setPlaySpeed,
    addProcess, removeProcess, updateProcess, reorderProcesses, clearAll,
  } = scheduler;

  const canGoBack = currentStepIndex > 0;
  const canGoForward = currentStepIndex < steps.length - 1 && !isFinished;

  return (
    <div className="min-h-screen bg-dark-900 bg-grid-pattern bg-grid text-white">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-dark-900/80 backdrop-blur-md">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shadow-glow-blue"
            >
              <Cpu className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold text-gradient leading-none">CPU Scheduler</h1>
              <p className="text-xs text-gray-600">Algorithm Visualizer</p>
            </div>
          </div>

          {/* Algorithm badge */}
          <div className="ml-4 hidden sm:flex items-center gap-2">
            <div className="h-4 w-px bg-white/10" />
            <span className="font-mono text-xs text-gray-500">Active:</span>
            <motion.span
              key={algorithm}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="tag bg-accent-blue/15 text-accent-blue border border-accent-blue/25 font-semibold"
            >
              {algorithm}
            </motion.span>
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            {processes.length > 0 && (
              <button onClick={clearAll} className="btn-danger text-xs py-1.5">
                Clear All
              </button>
            )}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700 border border-white/5 text-xs text-gray-500">
              <Sparkles className="w-3 h-3 text-accent-purple" />
              <span>Step-by-step mode</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Algorithm info bar ──────────────────────────────────────────────── */}
      <motion.div
        key={algorithm}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="border-b border-white/5 bg-dark-800/50"
      >
        <div className="max-w-screen-2xl mx-auto px-4 py-2 flex items-center gap-3">
          <BookOpen className="w-3.5 h-3.5 text-gray-600 shrink-0" />
          <p className="text-xs text-gray-500">{ALGO_DESCRIPTION[algorithm]}</p>
        </div>
      </motion.div>

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <main className="max-w-screen-2xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6">

          {/* ── LEFT SIDEBAR ────────────────────────────────────────────────── */}
          <aside className="space-y-4">
            {/* Process Form */}
            <ProcessForm
              onAdd={addProcess}
              existingIds={processes.map(p => p.id)}
              existingCount={processes.length}
            />

            {/* Process List */}
            {processes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="section-title text-xs">Process Queue</span>
                  <span className="font-mono text-xs text-gray-600">{processes.length} processes</span>
                </div>
                <ProcessList
                  processes={processes}
                  onReorder={reorderProcesses}
                  onUpdate={updateProcess}
                  onDelete={removeProcess}
                />
              </div>
            )}

            {/* Control Panel */}
            <ControlPanel
              algorithm={algorithm}
              timeQuantum={timeQuantum}
              isPlaying={isPlaying}
              isSimulationReady={isSimulationReady}
              isFinished={isFinished}
              canGoBack={canGoBack}
              canGoForward={canGoForward}
              playSpeed={playSpeed}
              onAlgorithmChange={algo => { setAlgorithm(algo); reset(); }}
              onQuantumChange={setTimeQuantum}
              onPlay={play}
              onPause={pause}
              onNext={nextStep}
              onPrev={prevStep}
              onRun={runSimulation}
              onReset={reset}
              onSpeedChange={setPlaySpeed}
            />
          </aside>

          {/* ── RIGHT CONTENT ──────────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Top row: CPU + Ready Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
              {/* CPU Display */}
              <CpuDisplay
                cpuProcessId={currentStep?.cpuProcess ?? null}
                processes={processes}
                currentTime={currentStep?.time ?? 0}
                remainingTimes={currentStep?.remainingTimes ?? {}}
              />
              {/* Ready Queue */}
              <ReadyQueue
                queueIds={currentStep?.readyQueue ?? []}
                processes={processes}
                algorithm={algorithm}
              />
            </div>

            {/* Gantt Chart */}
            <GanttChart
              entries={currentStep?.ganttSoFar ?? []}
              processes={processes}
              currentTime={currentStep?.time ?? 0}
            />

            {/* Metrics Dashboard */}
            <MetricsDashboard
              currentTime={currentStep?.time ?? 0}
              completedMetrics={currentStep?.completedMetrics ?? []}
              processes={processes}
              totalProcesses={processes.length}
            />

            {/* Empty state / intro */}
            {!isSimulationReady && processes.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-12 flex flex-col items-center justify-center gap-6 text-center"
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 0 0px rgba(79,156,249,0.2)',
                      '0 0 0 20px rgba(79,156,249,0)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center"
                >
                  <Cpu className="w-10 h-10 text-white" />
                </motion.div>
                <div className="max-w-md">
                  <h2 className="text-xl font-bold text-white mb-2">
                    CPU Scheduling Visualizer
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Add processes using the form on the left, choose your scheduling algorithm, 
                    then hit <span className="text-accent-blue font-medium">Run Simulation</span> to 
                    watch the execution unfold step-by-step with animated Gantt charts and real-time metrics.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  {['FCFS', 'SJF', 'Priority', 'Round Robin'].map(algo => (
                    <div key={algo} className="tag bg-dark-600 text-gray-400 border border-white/5 text-xs px-3 py-1">
                      {algo}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="mt-12 border-t border-white/5 py-4">
        <div className="max-w-screen-2xl mx-auto px-4 flex items-center justify-between text-xs text-gray-700">
          <span>CPU Scheduling Algorithm Visualizer · University Project</span>
          <div className="flex items-center gap-3">
            <span>Data Structures: Arrays · Queues · Priority Queues · Circular Queues</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
