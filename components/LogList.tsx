
import React, { useState } from 'react';
import { LogEntry } from '../types';

interface LogListProps {
  entries: LogEntry[];
  onDelete: (id: string) => void;
  onUpdateEntry: (id: string, updates: Partial<LogEntry>) => void;
}

const LogList: React.FC<LogListProps> = ({ entries, onDelete, onUpdateEntry }) => {
  const [editingField, setEditingField] = useState<{ id: string, field: keyof LogEntry } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const handleStartEdit = (id: string, field: keyof LogEntry, value: any) => {
    setEditingField({ id, field });
    setEditValue(value?.toString() || '0');
  };

  const handleSaveEdit = () => {
    if (editingField) {
      const numValue = parseFloat(editValue);
      if (!isNaN(numValue)) {
        onUpdateEntry(editingField.id, { [editingField.field]: numValue });
      }
      setEditingField(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveEdit();
    if (e.key === 'Escape') setEditingField(null);
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
          <i className="fas fa-utensils text-2xl opacity-30"></i>
        </div>
        <p className="font-medium">No logs for today yet.</p>
        <p className="text-xs">Coach Kanga is ready when you are!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.sort((a, b) => b.timestamp - a.timestamp).map((entry) => (
        <div key={entry.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-100 transition-all shadow-sm group">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${entry.type === 'MEAL' ? 'bg-orange-50 text-orange-500' : 'bg-indigo-50 text-indigo-600'}`}>
              <i className={`fas ${entry.type === 'MEAL' ? 'fa-utensils' : 'fa-running'} text-lg`}></i>
            </div>
            <div>
              <p className="font-bold text-slate-800 capitalize leading-tight">{entry.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 md:gap-8">
            <div className="text-right">
              {/* Calories Edit */}
              <div className="flex items-center justify-end">
                {editingField?.id === entry.id && editingField.field === 'calories' ? (
                  <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={handleSaveEdit} onKeyDown={handleKeyDown} className="w-16 text-right border-2 border-indigo-200 rounded px-1 outline-none font-black text-sm" />
                ) : (
                  <p 
                    onDoubleClick={() => handleStartEdit(entry.id, 'calories', entry.calories)}
                    className={`text-sm font-black cursor-pointer select-none ${entry.type === 'MEAL' ? 'text-slate-800' : 'text-emerald-500'}`}
                  >
                    {entry.type === 'MEAL' ? '+' : '-'}{entry.calories} kcal
                  </p>
                )}
              </div>

              {/* Macros Row */}
              {entry.type === 'MEAL' && (
                <div className="flex gap-3 text-[10px] font-bold text-slate-400 uppercase mt-1">
                  <div className="flex items-center gap-0.5">
                    <span className="opacity-50">P:</span>
                    {editingField?.id === entry.id && editingField.field === 'protein' ? (
                      <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={handleSaveEdit} onKeyDown={handleKeyDown} className="w-8 border border-indigo-200 rounded px-0.5 outline-none" />
                    ) : (
                      <span onDoubleClick={() => handleStartEdit(entry.id, 'protein', entry.protein)} className="cursor-pointer text-indigo-600">{entry.protein || 0}g</span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span className="opacity-50">C:</span>
                    {editingField?.id === entry.id && editingField.field === 'carbs' ? (
                      <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={handleSaveEdit} onKeyDown={handleKeyDown} className="w-8 border border-indigo-200 rounded px-0.5 outline-none" />
                    ) : (
                      <span onDoubleClick={() => handleStartEdit(entry.id, 'carbs', entry.carbs)} className="cursor-pointer text-amber-600">{entry.carbs || 0}g</span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span className="opacity-50">F:</span>
                    {editingField?.id === entry.id && editingField.field === 'fats' ? (
                      <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={handleSaveEdit} onKeyDown={handleKeyDown} className="w-8 border border-indigo-200 rounded px-0.5 outline-none" />
                    ) : (
                      <span onDoubleClick={() => handleStartEdit(entry.id, 'fats', entry.fats)} className="cursor-pointer text-rose-500">{entry.fats || 0}g</span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button onClick={() => onDelete(entry.id)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center">
              <i className="fas fa-trash-alt text-xs"></i>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LogList;
