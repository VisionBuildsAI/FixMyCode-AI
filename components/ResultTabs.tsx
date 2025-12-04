import React from 'react';
import { AnalysisMode, Tab } from '../types';
import { 
  Bug, ShieldAlert, Zap, Code, Activity, 
  Unlock, Flame, ShieldCheck, FileLock, ClipboardCheck,
  BarChart, AlertOctagon, GitPullRequest, TrendingUp, ClipboardList
} from 'lucide-react';

interface ResultTabsProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  bugCount: number;
  securityCount: number;
  mode: AnalysisMode;
}

const ResultTabs: React.FC<ResultTabsProps> = ({ activeTab, setActiveTab, bugCount, securityCount, mode }) => {
  let tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number; colorClass?: string }[] = [];

  // Define tabs based on mode
  if (mode === AnalysisMode.HACK_DEFEND) {
    tabs = [
      { id: 'hack_simulation', label: 'Exploit', icon: <Unlock size={14} />, colorClass: 'text-neon-red' },
      { id: 'attack_impact', label: 'Impact', icon: <Flame size={14} />, colorClass: 'text-orange-500' },
      { id: 'protection_patch', label: 'Defense', icon: <ShieldCheck size={14} />, colorClass: 'text-neon-green' },
      { id: 'secure_code', label: 'Patched', icon: <FileLock size={14} /> },
      { id: 'safety_checklist', label: 'Checklist', icon: <ClipboardCheck size={14} />, colorClass: 'text-blue-400' },
    ];
  } else if (mode === AnalysisMode.TECH_DEBT) {
    tabs = [
      { id: 'debt_scores', label: 'Scores', icon: <BarChart size={14} />, colorClass: 'text-neon-purple' },
      { id: 'debt_sources', label: 'Sources', icon: <AlertOctagon size={14} />, colorClass: 'text-pink-400' },
      { id: 'refactored_code', label: 'Refactored', icon: <GitPullRequest size={14} /> },
      { id: 'future_risk', label: 'Risks', icon: <TrendingUp size={14} />, colorClass: 'text-yellow-400' },
      { id: 'engineering_checklist', label: 'Standards', icon: <ClipboardList size={14} />, colorClass: 'text-blue-400' },
    ];
  } else {
    tabs = [
      { id: 'bugs', label: 'Bugs', icon: <Bug size={14} />, badge: bugCount, colorClass: 'text-neon-red' },
      { id: 'fixed', label: 'Fixed', icon: <Code size={14} /> },
      { id: 'optimized', label: 'Speed', icon: <Zap size={14} />, colorClass: 'text-yellow-400' },
      { id: 'security', label: 'Security', icon: <ShieldAlert size={14} />, badge: securityCount, colorClass: 'text-orange-400' },
      { id: 'complexity', label: 'Complexity', icon: <Activity size={14} /> },
    ];
  }

  return (
    <div className="flex items-center space-x-2 border-b border-white/5 bg-surface/30 px-4 py-3 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              relative flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-full transition-all duration-300 ease-out whitespace-nowrap
              ${isActive 
                ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10' 
                : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }
            `}
          >
            <span className={`${isActive ? (tab.colorClass || 'text-neon-cyan') : 'opacity-70'} transition-colors`}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={`
                ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-bold
                ${isActive 
                  ? 'bg-neon-red text-black' 
                  : 'bg-white/10 text-slate-400'
                }
              `}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ResultTabs;
