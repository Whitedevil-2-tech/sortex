// ── Shared TypeScript types for the CPU Scheduler Visualizer ──────────────────

export type Algorithm = 'FCFS' | 'SJF' | 'Priority' | 'RoundRobin';

export interface Process {
  id: string;          // unique key, e.g. "P1"
  name: string;        // display name
  arrivalTime: number;
  burstTime: number;
  priority: number;    // lower number = higher priority
  color: string;       // hex color, auto-assigned
  remainingTime: number; // used during simulation
}

export interface GanttEntry {
  processId: string;   // 'IDLE' for idle periods
  startTime: number;
  endTime: number;
}

export interface ProcessMetrics {
  processId: string;
  completionTime: number;
  turnaroundTime: number;
  waitingTime: number;
}

/** A single snapshot in time the stepper can jump to. */
export interface SimulationStep {
  time: number;                    // current clock
  readyQueue: string[];            // ordered list of process IDs
  cpuProcess: string | null;       // process currently running (null = idle)
  ganttSoFar: GanttEntry[];        // full timeline built up to this point
  completedMetrics: ProcessMetrics[]; // metrics for processes that have finished
  remainingTimes: Record<string, number>; // snapshot of remaining burst for each proc
  isFinished: boolean;             // true when all processes complete
}

export interface SchedulerState {
  processes: Process[];
  algorithm: Algorithm;
  timeQuantum: number;             // only used by RoundRobin
  steps: SimulationStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  playSpeed: number;               // ms between auto-steps
}
