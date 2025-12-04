import React from 'react';
import { AnalysisMode, Tab } from '../types';
import { Bug, ShieldAlert, Zap, Code, Activity, Unlock, Flame, ShieldCheck, FileLock, ClipboardCheck } from 'lucide-react';

interface ResultTabsProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  bugCount: number;
  securityCount: number;
  mode: AnalysisMode;
}

const ResultTabs: React.FC<ResultTabsProps> = ({ activeTab, setActiveTab, bugCount, securityCount, mode }) => {
  let tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number; color?: string }[] = [];

  if (mode === AnalysisMode.HACK_DEFEND) {
    tabs = [
      { id: 'hack_simulation', label: 'Hack Simulation', icon: <Unlock size={16} />, color: 'text-red-500' },
      { id: 'attack_impact', label: 'Attack Impact', icon: <Flame size={16} />, color: 'text-orange-500' },
      { id: 'protection_patch', label: 'Protection Patch', icon: <ShieldCheck size={16} />, color: 'text-green-500' },
      { id: 'secure_code', label: 'Secure Code', icon: <FileLock size={16} /> },
      { id: 'safety_checklist', label: 'Safety Checklist', icon: <ClipboardCheck size={16} />, color: 'text-blue-400' },
    ];
  } else {
    tabs = [
      { id: 'bugs', label: 'Bugs', icon: <Bug size={16} />, badge: bugCount, color: 'text-red-400' },
      { id: 'fixed', label: 'Fixed Code', icon: <Code size={16} /> },
      { id: 'optimized', label: 'Optimized', icon: <Zap size={16} />, color: 'text-yellow-400' },
      { id: 'security', label: 'Security', icon: <ShieldAlert size={16} />, badge: securityCount, color: 'text-orange-400' },
      { id: 'complexity', label: 'Complexity', icon: <Activity size={16} /> },
    ];
  }

  return (
    <div className="flex items-center space-x-1 border-b border-gray-700 bg-[#1e293b] px-2 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
            ${activeTab === tab.id 
              ? 'border-blue-500 text-blue-400 bg-gray-800/50' 
              : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
            }
          `}
        >
          <span className={tab.color || ''}>{tab.icon}</span>
          <span>{tab.label}</span>
          {tab.badge !== undefined && tab.badge > 0 && (
            <span className={`px-1.5 py-0.5 text-xs rounded-full ${tab.id === 'bugs' ? 'bg-red-900/50 text-red-300' : 'bg-orange-900/50 text-orange-300'}`}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default ResultTabs;
