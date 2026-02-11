
import React, { useState, useEffect } from 'react';
import { LogEntry, UserStats } from './types';
import { analyzeHealthInput, getHealthAdvice } from './services/geminiService';
import StatsCard from './components/StatsCard';
import LogList from './components/LogList';

declare const confetti: any;

const FitKangaMascot: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative flex flex-col items-center w-full max-w-[280px]">
        {/* Speech Bubble Above Character */}
        <div className="mb-6 relative w-full bg-white p-4 rounded-3xl shadow-xl border border-indigo-50 animate-bounce-slow z-10">
          <p className="text-[11px] md:text-sm font-bold text-slate-700 leading-tight italic text-center">
            {message}
          </p>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-indigo-50 rotate-45"></div>
        </div>

        {/* Cuter Winged Kangaroo SVG */}
        <div className="w-40 h-40 relative flex items-center justify-center">
           <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
             {/* Flappy Wings */}
             <path className="animate-flap-left" d="M15 45 Q 0 20 25 30 Q 10 5 40 35" fill="#EEF2FF" stroke="#818CF8" strokeWidth="1.5" />
             <path className="animate-flap-right" d="M85 45 Q 100 20 75 30 Q 90 5 60 35" fill="#EEF2FF" stroke="#818CF8" strokeWidth="1.5" />
             
             {/* Body */}
             <path d="M40 35 Q 50 20 60 35 L 68 65 Q 68 85 50 95 Q 32 85 32 65 Z" fill="#F59E0B" />
             <path d="M32 60 L 68 60 L 68 85 Q 68 95 50 95 Q 32 95 32 85 Z" fill="#701a75" />
             <circle cx="50" cy="80" r="2" fill="white" opacity="0.4" />
             
             {/* Head with Cuter Eyes */}
             <circle cx="50" cy="30" r="14" fill="#F59E0B" />
             <circle cx="45" cy="28" r="2.5" fill="black" />
             <circle cx="44.5" cy="27" r="1" fill="white" />
             <circle cx="55" cy="28" r="2.5" fill="black" />
             <circle cx="54.5" cy="27" r="1" fill="white" />
             <circle cx="42" cy="32" r="2" fill="#FDA4AF" opacity="0.6" />
             <circle cx="58" cy="32" r="2" fill="#FDA4AF" opacity="0.6" />
             <path d="M47 34 Q 50 37 53 34" stroke="black" strokeWidth="1" fill="none" strokeLinecap="round" />
             
             {/* Ears */}
             <path d="M40 22 Q 35 5 45 18 Z" fill="#F59E0B" />
             <path d="M60 22 Q 65 5 55 18 Z" fill="#F59E0B" />

             {/* Stanley Cup */}
             <g transform="translate(68, 50)">
                <rect x="0" y="0" width="10" height="18" rx="2" fill="#94A3B8" />
                <rect x="-2" y="-2" width="14" height="4" rx="1" fill="#64748B" />
                <path d="M5 -2 L 5 -8" stroke="#334155" strokeWidth="1.5" />
             </g>
           </svg>
        </div>
      </div>
      <h3 className="text-xs font-black text-indigo-900 uppercase tracking-widest mt-2">Coach Kanga</h3>
    </div>
  );
};

const App: React.FC = () => {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string>("Hop on in! Let's get that Stanley cup filled and the goals crushed!");
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    calorieGoal: 2000,
    proteinGoal: 150,
    weight: 70,
    age: 25,
    gender: 'female',
    height: 165
  });

  // Load state
  useEffect(() => {
    const saved = localStorage.getItem('fitfocus_entries');
    const savedStats = localStorage.getItem('fitfocus_stats');
    if (saved) {
      const parsed = JSON.parse(saved);
      const today = new Date().toDateString();
      setEntries(parsed.filter((e: LogEntry) => new Date(e.timestamp).toDateString() === today));
    }
    if (savedStats) setUserStats(JSON.parse(savedStats));
  }, []);

  // Save state
  useEffect(() => {
    localStorage.setItem('fitfocus_entries', JSON.stringify(entries));
    localStorage.setItem('fitfocus_stats', JSON.stringify(userStats));
  }, [entries, userStats]);

  // Calculations
  const totals = entries.reduce((acc, curr) => {
    if (curr.type === 'MEAL') {
      acc.in += curr.calories;
      acc.protein += curr.protein || 0;
      acc.carbs += curr.carbs || 0;
      acc.fats += curr.fats || 0;
      acc.minerals += curr.minerals || 0;
      acc.count++;
    } else {
      acc.out += curr.calories;
    }
    return acc;
  }, { in: 0, out: 0, protein: 0, carbs: 0, fats: 0, minerals: 0, count: 0 });

  const netCalories = totals.in - totals.out;
  const remainingCalories = userStats.calorieGoal - netCalories;
  
  // Dynamic macro goals
  const carbGoal = (userStats.calorieGoal * 0.5) / 4;
  const fatGoal = (userStats.calorieGoal * 0.3) / 9;
  const mineralGoal = 100;

  const getPercentage = (val: number, goal: number) => Math.round((val / (goal || 1)) * 100);

  const getIndicatorColor = (pct: number) => {
    if (pct >= 90 && pct <= 110) return 'text-emerald-500 font-black'; // Green (Perfect)
    if (pct < 50 || pct > 130) return 'text-rose-500 font-black'; // Red (Bad)
    return 'text-amber-500 font-black'; // In between
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    const result = await analyzeHealthInput(inputText);
    if (result) {
      const newEntry: LogEntry = {
        ...result,
        id: crypto.randomUUID(),
        timestamp: Date.now()
      };
      setEntries(prev => [...prev, newEntry]);
      setInputText('');
      
      const advice = await getHealthAdvice(`The user just logged ${result.name}. They are at ${getPercentage(totals.protein + (result.protein || 0), userStats.proteinGoal)}% of their protein goal. Suggest more plants/minerals if needed or tell a kangaroo/legging joke.`);
      setAiAdvice(advice);
    }
    setIsAnalyzing(false);
  };

  const handleUpdateEntry = (id: string, updates: Partial<LogEntry>) => {
    setEntries(prev => prev.map(entry => entry.id === id ? { ...entry, ...updates } : entry));
  };

  const copyDailySummaryToClipboard = () => {
    const today = new Date().toLocaleDateString();
    const avgMinerals = totals.count > 0 ? Math.round(totals.minerals / totals.count) : 0;
    
    // Create a tab-separated overall info string
    const header = "Date\tGoal kcal\tIn kcal\tOut kcal\tNet kcal\tProtein(g)\tCarbs(g)\tFats(g)\tAvg Mineral Score";
    const data = `${today}\t${userStats.calorieGoal}\t${totals.in}\t${totals.out}\t${netCalories}\t${totals.protein.toFixed(1)}\t${totals.carbs.toFixed(1)}\t${totals.fats.toFixed(1)}\t${avgMinerals}%`;
    
    const summary = `${header}\n${data}`;
    
    navigator.clipboard.writeText(summary).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
      confetti({
        particleCount: 80,
        spread: 40,
        origin: { y: 0.1 }
      });
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <style>{`
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes flap-left { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-12deg) translateY(-2px); } }
        @keyframes flap-right { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(12deg) translateY(-2px); } }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        .animate-flap-left { transform-origin: 40% 35%; animation: flap-left 1.2s ease-in-out infinite; }
        .animate-flap-right { transform-origin: 60% 35%; animation: flap-right 1.2s ease-in-out infinite; }
      `}</style>

      {/* Header & Main Goals */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 no-print">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg">
            <i className="fas fa-bolt text-2xl"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">FitFocus AI</h1>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Kcal</span>
                <input type="number" value={userStats.calorieGoal} onChange={e => setUserStats({...userStats, calorieGoal: +e.target.value})} className="w-16 bg-transparent border-b border-indigo-200 text-indigo-600 font-bold focus:border-indigo-600 outline-none text-sm px-1" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Protein</span>
                <input type="number" value={userStats.proteinGoal} onChange={e => setUserStats({...userStats, proteinGoal: +e.target.value})} className="w-12 bg-transparent border-b border-indigo-200 text-indigo-600 font-bold focus:border-indigo-600 outline-none text-sm px-1" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={copyDailySummaryToClipboard} 
            className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 border-2 ${copyFeedback ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-600 shadow-sm'}`}
          >
            <i className={`fas ${copyFeedback ? 'fa-check' : 'fa-clipboard-list'}`}></i>
            {copyFeedback ? 'Copied Total Data!' : 'Copy Daily Info (TSV)'}
          </button>
        </div>
      </header>

      {/* Extended User Profile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm no-print">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight (kg)</label>
          <input type="number" value={userStats.weight} onChange={e => setUserStats({...userStats, weight: +e.target.value})} className="w-full bg-slate-50 p-2 rounded-xl text-sm font-bold outline-none border border-transparent focus:border-indigo-500" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Height (cm)</label>
          <input type="number" value={userStats.height} onChange={e => setUserStats({...userStats, height: +e.target.value})} className="w-full bg-slate-50 p-2 rounded-xl text-sm font-bold outline-none border border-transparent focus:border-indigo-500" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</label>
          <input type="number" value={userStats.age} onChange={e => setUserStats({...userStats, age: +e.target.value})} className="w-full bg-slate-50 p-2 rounded-xl text-sm font-bold outline-none border border-transparent focus:border-indigo-500" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</label>
          <select value={userStats.gender} onChange={e => setUserStats({...userStats, gender: e.target.value as any})} className="w-full bg-slate-50 p-2 rounded-xl text-sm font-bold outline-none border border-transparent focus:border-indigo-500">
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          {/* Mascot Section */}
          <section className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-[3rem] border border-indigo-50 flex flex-col items-center justify-center shadow-inner no-print min-h-[420px]">
            <FitKangaMascot message={aiAdvice} />
          </section>

          {/* AI Entry Form */}
          <section className="glass-card p-6 rounded-3xl border border-white no-print">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><i className="fas fa-comment-dots text-indigo-500"></i> AI Health Log</h2>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Log your day... e.g. 'Ate healthy salad and 300kcal of salmon, then did yoga for 40 mins'"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl h-24 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                disabled={isAnalyzing}
              />
              <button type="submit" disabled={isAnalyzing || !inputText.trim()} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                {isAnalyzing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
                {isAnalyzing ? 'Analyzing...' : 'Log Activity'}
              </button>
            </form>
          </section>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* Performance Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard label="Net Calories" value={`${netCalories}`} icon="fa-bolt" color={remainingCalories >= 0 ? "bg-emerald-500" : "bg-rose-500"} goal={userStats.calorieGoal} />
            <StatsCard label="Protein" value={`${totals.protein.toFixed(0)}g`} icon="fa-dna" color="bg-indigo-600" goal={userStats.proteinGoal} />
            <StatsCard label="Active Burn" value={`${totals.out} kcal`} icon="fa-fire" color="bg-orange-500" />
            
            {/* Macro & Mineral Percentages */}
            <div className="glass-card p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Macro Balances</p>
              <div className="mt-2 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Carbs</span>
                  <span className={getIndicatorColor(getPercentage(totals.carbs, carbGoal))}>{getPercentage(totals.carbs, carbGoal)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Fats</span>
                  <span className={getIndicatorColor(getPercentage(totals.fats, fatGoal))}>{getPercentage(totals.fats, fatGoal)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Minerals</span>
                  <span className={getIndicatorColor(totals.count > 0 ? totals.minerals / totals.count : 0)}>{totals.count > 0 ? Math.round(totals.minerals / totals.count) : 0}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <section className="glass-card p-6 md:p-8 rounded-[2.5rem] shadow-sm min-h-[500px] border border-white/50">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Today's Timeline</h2>
                <p className="text-sm text-slate-400 font-medium italic">Double-click numbers to correct AI</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-indigo-600">{entries.length}</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Total entries</p>
              </div>
            </div>
            <LogList 
              entries={entries} 
              onDelete={id => setEntries(prev => prev.filter(e => e.id !== id))} 
              onUpdateEntry={handleUpdateEntry}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default App;
