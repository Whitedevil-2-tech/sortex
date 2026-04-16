import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Trash2, Edit2, Check, X, Clock, Cpu, Target } from 'lucide-react';
import type { Process } from '../types';

// ── Sortable row ──────────────────────────────────────────────────────────────

function ProcessRow({
  proc,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: {
  proc: Process;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updated: Process) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: proc.id });

  const [arrival, setArrival] = useState(String(proc.arrivalTime));
  const [burst, setBurst] = useState(String(proc.burstTime));
  const [prio, setPrio] = useState(String(proc.priority));

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <motion.div
        layout
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
          isDragging
            ? 'border-accent-blue/50 bg-dark-600 shadow-glow-blue'
            : 'border-white/5 bg-dark-700/50 hover:border-white/10'
        }`}
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Color badge */}
        <div
          className="w-3 h-3 rounded-full shrink-0 ring-2 ring-offset-1 ring-offset-dark-700"
          style={{ backgroundColor: proc.color, ringColor: proc.color }}
        />

        {/* ID */}
        <span className="font-mono text-sm font-semibold text-white w-10">{proc.id}</span>

        {isEditing ? (
          // Inline edit
          <div className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-500" />
              <input
                type="number" min="0"
                value={arrival} onChange={e => setArrival(e.target.value)}
                className="w-14 px-1.5 py-0.5 rounded bg-dark-800 border border-white/10 text-white text-xs font-mono outline-none focus:border-accent-blue/50"
              />
            </div>
            <div className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-gray-500" />
              <input
                type="number" min="1"
                value={burst} onChange={e => setBurst(e.target.value)}
                className="w-14 px-1.5 py-0.5 rounded bg-dark-800 border border-white/10 text-white text-xs font-mono outline-none focus:border-accent-blue/50"
              />
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 text-gray-500" />
              <input
                type="number" min="1"
                value={prio} onChange={e => setPrio(e.target.value)}
                className="w-14 px-1.5 py-0.5 rounded bg-dark-800 border border-white/10 text-white text-xs font-mono outline-none focus:border-accent-blue/50"
              />
            </div>
            <div className="flex gap-1 ml-auto">
              <button
                onClick={() => onSave({ ...proc, arrivalTime: +arrival, burstTime: +burst, priority: +prio, remainingTime: +burst })}
                className="p-1 rounded bg-accent-green/20 text-accent-green hover:bg-accent-green/30 transition-colors"
              >
                <Check className="w-3 h-3" />
              </button>
              <button onClick={onCancel} className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          // Display mode
          <div className="flex items-center gap-3 flex-1 text-xs text-gray-400 font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-600" /> {proc.arrivalTime}
            </span>
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-gray-600" /> {proc.burstTime}
            </span>
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3 text-gray-600" /> {proc.priority}
            </span>
            <div className="flex gap-1 ml-auto">
              <button onClick={onEdit} className="p-1 rounded text-gray-600 hover:text-accent-blue hover:bg-accent-blue/10 transition-colors">
                <Edit2 className="w-3 h-3" />
              </button>
              <button onClick={onDelete} className="p-1 rounded text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── Main list ──────────────────────────────────────────────────────────────────

interface Props {
  processes: Process[];
  onReorder: (ordered: Process[]) => void;
  onUpdate: (p: Process) => void;
  onDelete: (id: string) => void;
}

export default function ProcessList({ processes, onReorder, onUpdate, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = processes.findIndex(p => p.id === active.id);
      const newIdx = processes.findIndex(p => p.id === over.id);
      onReorder(arrayMove(processes, oldIdx, newIdx));
    }
  };

  if (processes.length === 0) {
    return (
      <div className="glass-card p-8 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-dark-600 flex items-center justify-center">
          <Cpu className="w-6 h-6 text-gray-600" />
        </div>
        <p className="text-sm text-gray-600">No processes added yet</p>
        <p className="text-xs text-gray-700">Add processes using the form above</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-3 space-y-1">
      {/* Header */}
      <div className="flex items-center gap-3 px-2 py-1 mb-2">
        <span className="w-4" />
        <span className="w-3" />
        <span className="w-10 text-xs text-gray-600 uppercase tracking-wider">ID</span>
        <div className="flex gap-3 text-xs text-gray-600 uppercase tracking-wider flex-1">
          <span className="w-16">Arrival</span>
          <span className="w-16">Burst</span>
          <span className="w-16">Priority</span>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={processes.map(p => p.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {processes.map(proc => (
              <motion.div
                key={proc.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ProcessRow
                  proc={proc}
                  isEditing={editingId === proc.id}
                  onEdit={() => setEditingId(proc.id)}
                  onSave={(updated) => { onUpdate(updated); setEditingId(null); }}
                  onCancel={() => setEditingId(null)}
                  onDelete={() => onDelete(proc.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </SortableContext>
      </DndContext>
    </div>
  );
}
