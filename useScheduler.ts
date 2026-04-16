import { useState, useEffect, useCallback, useRef } from 'react';
import type { Process, Algorithm, SimulationStep } from '../types';
import { computeFCFS, computeSJF, computePriority, computeRoundRobin } from '../algorithms/scheduler';

const PLAY_SPEEDS = [2000, 1000, 500, 250]; // ms per step

export function useScheduler() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [algorithm, setAlgorithm] = useState<Algorithm>('FCFS');
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [steps, setSteps] = useState<SimulationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1); // index into PLAY_SPEEDS
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Current visible snapshot ──────────────────────────────────────────────
  const currentStep = steps[currentStepIndex] ?? null;
  const isSimulationReady = steps.length > 0;
  const isFinished = currentStep?.isFinished ?? false;

  // ── Build steps from processes ─────────────────────────────────────────────
  const runSimulation = useCallback(() => {
    if (processes.length === 0) return;

    let computed: SimulationStep[] = [];
    switch (algorithm) {
      case 'FCFS':      computed = computeFCFS(processes); break;
      case 'SJF':       computed = computeSJF(processes); break;
      case 'Priority':  computed = computePriority(processes); break;
      case 'RoundRobin': computed = computeRoundRobin(processes, timeQuantum); break;
    }

    setSteps(computed);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [processes, algorithm, timeQuantum]);

  // ── Stepper controls ────────────────────────────────────────────────────────
  const nextStep = useCallback(() => {
    setCurrentStepIndex(prev => {
      if (prev >= steps.length - 1) return prev;
      return prev + 1;
    });
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setCurrentStepIndex(prev => Math.max(0, prev - 1));
  }, []);

  const reset = useCallback(() => {
    setSteps([]);
    setCurrentStepIndex(-1);
    setIsPlaying(false);
  }, []);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);

  // ── Auto-play interval ─────────────────────────────────────────────────────
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (isPlaying && steps.length > 0 && !isFinished) {
      intervalRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          const next = prev + 1;
          if (next >= steps.length) {
            setIsPlaying(false);
            return prev;
          }
          // Auto-pause when finished
          if (steps[next]?.isFinished) {
            setIsPlaying(false);
          }
          return next;
        });
      }, PLAY_SPEEDS[playSpeed]);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, steps, playSpeed, isFinished]);

  // ── Process management ─────────────────────────────────────────────────────
  const addProcess = useCallback((proc: Process) => {
    setProcesses(prev => [...prev, proc]);
    reset();
  }, [reset]);

  const removeProcess = useCallback((id: string) => {
    setProcesses(prev => prev.filter(p => p.id !== id));
    reset();
  }, [reset]);

  const updateProcess = useCallback((updated: Process) => {
    setProcesses(prev => prev.map(p => p.id === updated.id ? updated : p));
    reset();
  }, [reset]);

  const reorderProcesses = useCallback((ordered: Process[]) => {
    setProcesses(ordered);
  }, []);

  const clearAll = useCallback(() => {
    setProcesses([]);
    reset();
  }, [reset]);

  return {
    processes, algorithm, timeQuantum, steps, currentStepIndex,
    currentStep, isPlaying, playSpeed, isSimulationReady, isFinished,
    // actions
    setAlgorithm, setTimeQuantum, runSimulation,
    nextStep, prevStep, reset, play, pause,
    setPlaySpeed,
    addProcess, removeProcess, updateProcess, reorderProcesses, clearAll,
  };
}
