import type { Process, SimulationStep, GanttEntry, ProcessMetrics } from '../types';

/**
 * Build the full array of simulation steps for a given algorithm.
 * Each step represents ONE time unit.
 */

// ── Shared helpers ─────────────────────────────────────────────────────────────

function deepCloneMetrics(m: ProcessMetrics[]): ProcessMetrics[] {
  return m.map(x => ({ ...x }));
}

function buildSnapshot(
  time: number,
  readyQueue: string[],
  cpuProcess: string | null,
  gantt: GanttEntry[],
  completedMetrics: ProcessMetrics[],
  remainingTimes: Record<string, number>,
  isFinished: boolean
): SimulationStep {
  return {
    time,
    readyQueue: [...readyQueue],
    cpuProcess,
    ganttSoFar: gantt.map(e => ({ ...e })),
    completedMetrics: deepCloneMetrics(completedMetrics),
    remainingTimes: { ...remainingTimes },
    isFinished,
  };
}

// ── FCFS ───────────────────────────────────────────────────────────────────────

export function computeFCFS(processes: Process[]): SimulationStep[] {
  const steps: SimulationStep[] = [];
  const sorted = [...processes].sort((a, b) =>
    a.arrivalTime !== b.arrivalTime ? a.arrivalTime - b.arrivalTime : a.id.localeCompare(b.id)
  );

  const remaining: Record<string, number> = {};
  sorted.forEach(p => (remaining[p.id] = p.burstTime));

  const completed: ProcessMetrics[] = [];
  const gantt: GanttEntry[] = [];
  let time = 0;
  let queueSeen = new Set<string>();
  const queue: string[] = [];

  const totalBurst = sorted.reduce((s, p) => s + p.burstTime, 0);
  const maxTime = sorted.reduce((m, p) => Math.max(m, p.arrivalTime), 0) + totalBurst + 2;

  while (time <= maxTime) {
    // Admit newly arrived processes
    sorted.forEach(p => {
      if (p.arrivalTime === time && !queueSeen.has(p.id)) {
        queue.push(p.id);
        queueSeen.add(p.id);
      }
    });

    const allDone = sorted.every(p => remaining[p.id] === 0);
    if (allDone) {
      steps.push(buildSnapshot(time, [...queue], null, gantt, completed, remaining, true));
      break;
    }

    if (queue.length === 0) {
      // CPU idle
      steps.push(buildSnapshot(time, [], null, gantt, completed, remaining, false));
      if (gantt.length === 0 || gantt[gantt.length - 1].processId !== 'IDLE') {
        gantt.push({ processId: 'IDLE', startTime: time, endTime: time + 1 });
      } else {
        gantt[gantt.length - 1].endTime = time + 1;
      }
      time++;
      continue;
    }

    const currentId = queue[0];
    const proc = sorted.find(p => p.id === currentId)!;

    // Run until queue front finishes
    const startTime = time;
    const runFor = remaining[currentId];

    for (let t = 0; t < runFor; t++) {
      // Admit arrivals during this slice
      sorted.forEach(p => {
        if (p.arrivalTime === time + t + 1 && !queueSeen.has(p.id)) {
          queue.push(p.id);
          queueSeen.add(p.id);
        }
      });

      remaining[currentId]--;
      gantt.push({ processId: currentId, startTime: time + t, endTime: time + t + 1 });

      const queueSnapshot = queue.slice(1); // current is running, not in "waiting" queue
      steps.push(buildSnapshot(time + t, queueSnapshot, currentId, gantt.map(g => ({ ...g })), deepCloneMetrics(completed), { ...remaining }, false));
    }

    time += runFor;
    queue.shift();

    const ct = time;
    completed.push({
      processId: currentId,
      completionTime: ct,
      turnaroundTime: ct - proc.arrivalTime,
      waitingTime: ct - proc.arrivalTime - proc.burstTime,
    });
  }

  return steps;
}

// ── SJF (Non-Preemptive) ───────────────────────────────────────────────────────

export function computeSJF(processes: Process[]): SimulationStep[] {
  const steps: SimulationStep[] = [];
  const procs = [...processes];
  const remaining: Record<string, number> = {};
  procs.forEach(p => (remaining[p.id] = p.burstTime));

  const completed: ProcessMetrics[] = [];
  const gantt: GanttEntry[] = [];
  let time = 0;
  const admitted = new Set<string>();
  const readyQueue: string[] = [];
  const done = new Set<string>();

  const maxTime = procs.reduce((m, p) => Math.max(m, p.arrivalTime), 0) +
    procs.reduce((s, p) => s + p.burstTime, 0) + 2;

  while (time <= maxTime) {
    procs.forEach(p => {
      if (p.arrivalTime <= time && !admitted.has(p.id) && !done.has(p.id)) {
        readyQueue.push(p.id);
        admitted.add(p.id);
      }
    });

    const allDone = procs.every(p => done.has(p.id));
    if (allDone) {
      steps.push(buildSnapshot(time, [], null, gantt, completed, remaining, true));
      break;
    }

    if (readyQueue.length === 0) {
      steps.push(buildSnapshot(time, [], null, gantt, completed, remaining, false));
      if (gantt.length === 0 || gantt[gantt.length - 1].processId !== 'IDLE') {
        gantt.push({ processId: 'IDLE', startTime: time, endTime: time + 1 });
      } else {
        gantt[gantt.length - 1].endTime++;
      }
      time++;
      continue;
    }

    // Pick shortest burst
    readyQueue.sort((a, b) => {
      const remA = remaining[a];
      const remB = remaining[b];
      return remA !== remB ? remA - remB : a.localeCompare(b);
    });

    const currentId = readyQueue.shift()!;
    const proc = procs.find(p => p.id === currentId)!;
    const burst = remaining[currentId];

    for (let t = 0; t < burst; t++) {
      // Admit during this slice
      procs.forEach(p => {
        if (p.arrivalTime <= time + t + 1 && !admitted.has(p.id) && !done.has(p.id)) {
          readyQueue.push(p.id);
          admitted.add(p.id);
        }
      });

      remaining[currentId]--;
      if (gantt.length === 0 || gantt[gantt.length - 1].processId !== currentId) {
        gantt.push({ processId: currentId, startTime: time + t, endTime: time + t + 1 });
      } else {
        gantt[gantt.length - 1].endTime++;
      }

      steps.push(buildSnapshot(time + t, [...readyQueue], currentId, gantt.map(g => ({ ...g })), deepCloneMetrics(completed), { ...remaining }, false));
    }

    time += burst;
    done.add(currentId);
    remaining[currentId] = 0;

    completed.push({
      processId: currentId,
      completionTime: time,
      turnaroundTime: time - proc.arrivalTime,
      waitingTime: time - proc.arrivalTime - proc.burstTime,
    });
  }

  return steps;
}

// ── Priority (Non-Preemptive) ─────────────────────────────────────────────────

export function computePriority(processes: Process[]): SimulationStep[] {
  const steps: SimulationStep[] = [];
  const procs = [...processes];
  const remaining: Record<string, number> = {};
  procs.forEach(p => (remaining[p.id] = p.burstTime));

  const completed: ProcessMetrics[] = [];
  const gantt: GanttEntry[] = [];
  let time = 0;
  const admitted = new Set<string>();
  const readyQueue: string[] = [];
  const done = new Set<string>();

  const maxTime = procs.reduce((m, p) => Math.max(m, p.arrivalTime), 0) +
    procs.reduce((s, p) => s + p.burstTime, 0) + 2;

  while (time <= maxTime) {
    procs.forEach(p => {
      if (p.arrivalTime <= time && !admitted.has(p.id) && !done.has(p.id)) {
        readyQueue.push(p.id);
        admitted.add(p.id);
      }
    });

    if (procs.every(p => done.has(p.id))) {
      steps.push(buildSnapshot(time, [], null, gantt, completed, remaining, true));
      break;
    }

    if (readyQueue.length === 0) {
      steps.push(buildSnapshot(time, [], null, gantt, completed, remaining, false));
      if (gantt.length === 0 || gantt[gantt.length - 1].processId !== 'IDLE') {
        gantt.push({ processId: 'IDLE', startTime: time, endTime: time + 1 });
      } else {
        gantt[gantt.length - 1].endTime++;
      }
      time++;
      continue;
    }

    // Pick highest priority (lowest number)
    readyQueue.sort((a, b) => {
      const pa = procs.find(p => p.id === a)!.priority;
      const pb = procs.find(p => p.id === b)!.priority;
      return pa !== pb ? pa - pb : a.localeCompare(b);
    });

    const currentId = readyQueue.shift()!;
    const proc = procs.find(p => p.id === currentId)!;
    const burst = remaining[currentId];

    for (let t = 0; t < burst; t++) {
      procs.forEach(p => {
        if (p.arrivalTime <= time + t + 1 && !admitted.has(p.id) && !done.has(p.id)) {
          readyQueue.push(p.id);
          admitted.add(p.id);
        }
      });

      remaining[currentId]--;
      if (gantt.length === 0 || gantt[gantt.length - 1].processId !== currentId) {
        gantt.push({ processId: currentId, startTime: time + t, endTime: time + t + 1 });
      } else {
        gantt[gantt.length - 1].endTime++;
      }

      steps.push(buildSnapshot(time + t, [...readyQueue], currentId, gantt.map(g => ({ ...g })), deepCloneMetrics(completed), { ...remaining }, false));
    }

    time += burst;
    done.add(currentId);
    remaining[currentId] = 0;

    completed.push({
      processId: currentId,
      completionTime: time,
      turnaroundTime: time - proc.arrivalTime,
      waitingTime: time - proc.arrivalTime - proc.burstTime,
    });
  }

  return steps;
}

// ── Round Robin ───────────────────────────────────────────────────────────────

export function computeRoundRobin(processes: Process[], quantum: number): SimulationStep[] {
  const steps: SimulationStep[] = [];
  const procs = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const remaining: Record<string, number> = {};
  procs.forEach(p => (remaining[p.id] = p.burstTime));

  const completed: ProcessMetrics[] = [];
  const gantt: GanttEntry[] = [];
  const done = new Set<string>();
  const queue: string[] = [];
  const admitted = new Set<string>();
  let time = 0;

  // Admit processes at t=0
  procs.forEach(p => {
    if (p.arrivalTime <= 0) {
      queue.push(p.id);
      admitted.add(p.id);
    }
  });

  const maxTime = procs.reduce((s, p) => s + p.burstTime, 0) + 
    procs.reduce((m, p) => Math.max(m, p.arrivalTime), 0) + 2;

  while (time <= maxTime) {
    if (procs.every(p => done.has(p.id))) {
      steps.push(buildSnapshot(time, [], null, gantt, completed, remaining, true));
      break;
    }

    if (queue.length === 0) {
      steps.push(buildSnapshot(time, [], null, gantt, completed, remaining, false));
      if (gantt.length === 0 || gantt[gantt.length - 1].processId !== 'IDLE') {
        gantt.push({ processId: 'IDLE', startTime: time, endTime: time + 1 });
      } else {
        gantt[gantt.length - 1].endTime++;
      }
      time++;
      // Admit newly arrived
      procs.forEach(p => {
        if (p.arrivalTime <= time && !admitted.has(p.id) && !done.has(p.id)) {
          queue.push(p.id);
          admitted.add(p.id);
        }
      });
      continue;
    }

    const currentId = queue.shift()!;
    const proc = procs.find(p => p.id === currentId)!;
    const runFor = Math.min(quantum, remaining[currentId]);

    for (let t = 0; t < runFor; t++) {
      remaining[currentId]--;
      if (gantt.length === 0 || gantt[gantt.length - 1].processId !== currentId) {
        gantt.push({ processId: currentId, startTime: time + t, endTime: time + t + 1 });
      } else {
        gantt[gantt.length - 1].endTime++;
      }

      // Admit during this slice
      procs.forEach(p => {
        if (p.arrivalTime <= time + t + 1 && !admitted.has(p.id) && !done.has(p.id)) {
          queue.push(p.id);
          admitted.add(p.id);
        }
      });

      steps.push(buildSnapshot(time + t, [...queue], currentId, gantt.map(g => ({ ...g })), deepCloneMetrics(completed), { ...remaining }, false));
    }

    time += runFor;

    if (remaining[currentId] === 0) {
      done.add(currentId);
      completed.push({
        processId: currentId,
        completionTime: time,
        turnaroundTime: time - proc.arrivalTime,
        waitingTime: time - proc.arrivalTime - proc.burstTime,
      });
    } else {
      // Re-queue
      queue.push(currentId);
    }
  }

  return steps;
}
