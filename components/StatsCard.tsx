
import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  goal?: number;
  icon: string;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, goal, icon, color }) => {
  const percentage = goal ? Math.min(Math.round(((value as number) / goal) * 100), 100) : 0;

  return (
    <div className="glass-card p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} text-white`}>
          <i className={`fas ${icon}`}></i>
        </div>
        {goal && (
          <span className="text-xs font-semibold text-slate-400">
            Goal: {goal}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</h3>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
      {goal && (
        <div className="mt-4">
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full ${color.replace('bg-', 'bg-opacity-80 bg-')} transition-all duration-1000`} 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <p className="text-[10px] mt-1 text-slate-400 text-right">{percentage}% of daily goal</p>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
