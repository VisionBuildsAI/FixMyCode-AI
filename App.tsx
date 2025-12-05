import React, { useState, useEffect } from 'react';
import { 
  Play, Copy, CheckCircle, AlertTriangle, Shield, ShieldAlert, ShieldCheck,
  Code as CodeIcon, Clock, Maximize2, RefreshCw, Eye, EyeOff, Unlock,
  Terminal, Skull, FileCheck, CheckSquare, Activity, AlertOctagon, GitPullRequest,
  Zap, Command, ChevronRight, BarChart, Flame, Wifi, WifiOff, Target, Swords
} from 'lucide-react';
import CodeEditor from './components/CodeEditor';
import ResultTabs from './components/ResultTabs';
import DiffViewer from './components/DiffViewer';
import { analyzeCode } from './services/geminiService';
import { AnalysisMode, AnalysisResult, SupportedLanguage, Tab } from './types';

const App: React.FC = () => {
  // State
  const [inputCode, setInputCode] = useState<string>('');
  const [language, setLanguage] = useState<SupportedLanguage>(SupportedLanguage.JAVASCRIPT);
  const [mode, setMode] = useState<AnalysisMode>(AnalysisMode.PRO);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('bugs');
  const [error, setError] = useState<string | null>(null);
  const [interviewRevealed, setInterviewRevealed] = useState<boolean>(false);

  // Derived state
  const hasResult = !!result;
  const isHackMode = mode === AnalysisMode.HACK_DEFEND;
  const isDebtMode = mode === AnalysisMode.TECH_DEBT;

  // Effects
  useEffect(() => {
    // Reset result when mode changes to encourage re-analysis
    if (result) {
        // Optional: clear result if switching modes drastically, or keep it.
        // Keeping it for now but resetting tab order
    }
  }, [mode]);

  const handleAnalyze = async () => {
    if (!inputCode.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setInterviewRevealed(false);

    try {
      const data = await analyzeCode(inputCode, language, mode);
      setResult(data);
      
      // Default tab selection
      if (mode === AnalysisMode.HACK_DEFEND) {
        setActiveTab('hack_simulation');
      } else if (mode === AnalysisMode.TECH_DEBT) {
        setActiveTab('debt_scores');
      } else if (data.bugs.length > 0) {
        setActiveTab('bugs');
      } else {
        setActiveTab('fixed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please check your API Key and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getHighlights = () => {
    if (!result) return [];
    if (isHackMode && result.hackAnalysis) return result.hackAnalysis.vulnerabilities.map(v => v.line);
    if (isDebtMode && result.techDebtAnalysis) return result.techDebtAnalysis.issues.map(i => i.line);
    return result.bugs.map(b => b.line);
  };

  // --- Render Helpers ---

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-8 p-12 animate-in fade-in duration-700">
      <div className={`
        relative w-24 h-24 rounded-full flex items-center justify-center 
        border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl
        ${isHackMode ? 'shadow-neon-red/20' : isDebtMode ? 'shadow-neon-purple/20' : 'shadow-neon-cyan/20'}
      `}>
         {isHackMode ? <Skull className="text-neon-red" size={40} /> : 
          isDebtMode ? <Activity className="text-neon-purple" size={40} /> : 
          <CodeIcon className="text-neon-cyan" size={40} />}
         
         {/* Animated ring */}
         <div className={`absolute inset-0 rounded-full border border-white/5 animate-ping opacity-20 ${isHackMode ? 'bg-neon-red' : 'bg-neon-cyan'}`}></div>
      </div>
      
      <div className="text-center space-y-3 max-w-lg">
        <h3 className="text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
          Paste your crime scene.
        </h3>
        <p className="text-slate-400 font-light text-lg">
          {isHackMode 
            ? "We'll find the vulnerabilities before they do."
            : "We'll judge your code. Brutally."
          }
        </p>
      </div>

      <div className="flex gap-3 text-xs font-mono text-slate-600 uppercase tracking-widest opacity-60">
        <span className="flex items-center"><Command size={12} className="mr-1"/> Analyze</span>
        <span className="flex items-center"><ChevronRight size={12} className="mr-1"/> Fix</span>
        <span className="flex items-center"><Shield size={12} className="mr-1"/> Secure</span>
      </div>
    </div>
  );

  const renderAnalyzing = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      <div className="relative">
        <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin ${isHackMode ? 'border-neon-red' : 'border-neon-cyan'}`}></div>
        <div className={`absolute inset-0 flex items-center justify-center ${isHackMode ? 'text-neon-red' : 'text-neon-cyan'}`}>
          <Zap size={24} className="animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-mono text-slate-200 animate-pulse">
          {isHackMode ? "SIMULATING ATTACK VECTORS..." : "ANALYZING LOGIC..."}
        </p>
        <p className="text-sm text-slate-500 mt-2">Running heuristics engine v1.2</p>
      </div>
    </div>
  );

  const renderTechDebtScore = (scores: any) => {
    const getScoreColor = (s: number) => s >= 90 ? 'text-neon-cyan' : s >= 70 ? 'text-neon-green' : s >= 50 ? 'text-yellow-400' : 'text-neon-red';
    const getRingColor = (s: number) => s >= 90 ? 'text-cyan-500' : s >= 70 ? 'text-emerald-500' : s >= 50 ? 'text-yellow-500' : 'text-rose-600';

    return (
      <div className="p-10 h-full overflow-y-auto">
        <div className="flex flex-col items-center mb-12">
          {/* Circular Progress */}
          <div className="relative w-48 h-48 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="80" className="text-white/5" strokeWidth="12" fill="none" stroke="currentColor" />
              <circle 
                 cx="96" cy="96" r="80" 
                 className={`${getRingColor(scores.overall)} drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-all duration-1000 ease-out`}
                 strokeWidth="12" 
                 fill="none" 
                 stroke="currentColor" 
                 strokeDasharray={502} 
                 strokeDashoffset={502 - (502 * scores.overall) / 100}
                 strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
               <span className={`text-6xl font-bold tracking-tighter ${getScoreColor(scores.overall)} drop-shadow-md`}>{scores.overall}</span>
               <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mt-2 font-semibold">Debt Score</span>
            </div>
          </div>
          
          <div className={`px-4 py-1 rounded-full border border-white/10 bg-white/5 text-lg font-medium tracking-tight ${getScoreColor(scores.overall)}`}>
            {scores.overall >= 90 ? 'Clean Architecture' : scores.overall >= 70 ? 'Acceptable Engineering' : scores.overall >= 50 ? 'Risky Codebase' : 'Technical Bankruptcy'}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 max-w-xl mx-auto">
          {Object.entries(scores).filter(([key]) => key !== 'overall').map(([key, val]) => (
            <div key={key} className="group">
              <div className="flex justify-between mb-2 items-end">
                <span className="text-slate-500 uppercase text-[10px] font-bold tracking-widest group-hover:text-slate-300 transition-colors">{key}</span>
                <span className={`font-mono text-sm font-bold ${getScoreColor(val as number)}`}>{val as number}</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                   className={`h-full ${getRingColor(val as number).replace('text-', 'bg-')} shadow-[0_0_10px_currentColor] rounded-full transition-all duration-1000`} 
                   style={{ width: `${val}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (isAnalyzing) return renderAnalyzing();
    if (error) return (
      <div className="flex flex-col items-center justify-center h-full text-neon-red space-y-4 p-12 text-center animate-in zoom-in-95">
        <AlertTriangle className="w-16 h-16 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
        <h3 className="text-2xl font-bold">Analysis Failed</h3>
        <p className="text-slate-400 max-w-xs">{error}</p>
      </div>
    );
    if (!result) return renderEmptyState();

    if (mode === AnalysisMode.INTERVIEW && !interviewRevealed && activeTab !== 'bugs') {
       return (
        <div className="flex flex-col items-center justify-center h-full space-y-8 p-12">
          <div className="bg-surface border border-yellow-500/20 p-8 rounded-2xl max-w-md w-full shadow-2xl shadow-yellow-900/10 text-center">
            <EyeOff className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-yellow-400 mb-2">Interview Mode Active</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              We've hidden the solution. Study the root cause hints first. Do not reveal until you have a hypothesis.
            </p>
            <button 
              onClick={() => setInterviewRevealed(true)}
              className="w-full py-3 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/50 text-yellow-500 rounded-lg font-bold transition-all flex items-center justify-center space-x-2"
            >
              <Eye size={18} />
              <span>Reveal Solution</span>
            </button>
          </div>
        </div>
      );
    }

    // --- Content Routing based on Tab ---
    
    // Tech Debt Special Render
    if (isDebtMode && activeTab === 'debt_scores' && result.techDebtAnalysis) {
      return renderTechDebtScore(result.techDebtAnalysis.scores);
    }

    // Default renderings for text/list based tabs
    return (
      <div className="h-full overflow-y-auto">
        {/* Bugs / Vulns List */}
        {(activeTab === 'bugs' || activeTab === 'hack_simulation' || activeTab === 'debt_sources') && (
           <div className="p-6 space-y-4">
              {/* Root Cause Card (Only for Bugs) */}
              {activeTab === 'bugs' && (
                <div className="bg-surface border border-white/10 p-5 rounded-xl mb-6 shadow-lg">
                  <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3 flex items-center">
                    <Activity size={14} className="mr-2" /> Root Cause Analysis
                  </h3>
                  <p className="text-slate-300 leading-relaxed font-light">{result.rootCause}</p>
                </div>
              )}

              {/* Hack & Defend Summary Dashboard */}
              {activeTab === 'hack_simulation' && result.hackAnalysis && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* System Risk Card */}
                  <div className={`bg-surface border p-4 rounded-xl flex items-center justify-between ${
                    result.hackAnalysis.systemRiskRating === 'High' ? 'border-neon-red/30 bg-neon-red/5' : 
                    result.hackAnalysis.systemRiskRating === 'Medium' ? 'border-orange-500/30 bg-orange-500/5' : 'border-neon-green/30 bg-neon-green/5'
                  }`}>
                    <div>
                      <h4 className="text-xs uppercase font-bold text-slate-500 mb-1">System Risk Rating</h4>
                      <span className={`text-2xl font-bold ${
                        result.hackAnalysis.systemRiskRating === 'High' ? 'text-neon-red' : 
                        result.hackAnalysis.systemRiskRating === 'Medium' ? 'text-orange-500' : 'text-neon-green'
                      }`}>{result.hackAnalysis.systemRiskRating}</span>
                    </div>
                    <Target size={32} className={`opacity-80 ${
                        result.hackAnalysis.systemRiskRating === 'High' ? 'text-neon-red' : 
                        result.hackAnalysis.systemRiskRating === 'Medium' ? 'text-orange-500' : 'text-neon-green'
                      }`} />
                  </div>

                   {/* Defense Score Card */}
                   <div className="bg-surface border border-white/10 p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs uppercase font-bold text-slate-500">Defense Readiness</span>
                        <span className="text-xl font-mono font-bold text-neon-cyan">{result.hackAnalysis.defenseReadinessScore}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-neon-cyan h-full rounded-full transition-all duration-1000" style={{width: `${result.hackAnalysis.defenseReadinessScore}%`}}></div>
                      </div>
                   </div>
                   
                   {/* Exploit Score Card */}
                   <div className="bg-surface border border-white/10 p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs uppercase font-bold text-slate-500">Exploit Readiness</span>
                        <span className="text-xl font-mono font-bold text-neon-red">{result.hackAnalysis.exploitReadinessScore}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-neon-red h-full rounded-full transition-all duration-1000" style={{width: `${result.hackAnalysis.exploitReadinessScore}%`}}></div>
                      </div>
                   </div>

                   {/* Surface Summary */}
                   <div className="bg-surface border border-white/10 p-4 rounded-xl flex flex-col justify-center">
                      <h4 className="text-xs uppercase font-bold text-slate-500 mb-1">Weakest Link</h4>
                      <span className="text-sm font-bold text-slate-300">{result.hackAnalysis.attackSurfaceSummary}</span>
                   </div>
                </div>
              )}

              {/* Dynamic List Items */}
              {(isHackMode ? result.hackAnalysis?.vulnerabilities : isDebtMode ? result.techDebtAnalysis?.issues : result.bugs)?.map((item: any, idx: number) => (
                 <div key={idx} className={`
                    p-5 rounded-xl border transition-all hover:bg-white/5 group
                    ${isHackMode 
                       ? 'bg-neon-red/5 border-neon-red/20 hover:border-neon-red/40' 
                       : isDebtMode 
                         ? 'bg-neon-purple/5 border-neon-purple/20 hover:border-neon-purple/40'
                         : 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'}
                 `}>
                    <div className="flex justify-between items-start mb-2">
                       <h4 className={`font-bold text-sm flex items-center ${isHackMode ? 'text-neon-red' : isDebtMode ? 'text-neon-purple' : 'text-red-400'}`}>
                         {isHackMode && <Swords size={16} className="mr-2" />}
                         {item.name || item.issue || "Bug Detected"}
                       </h4>
                       <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                         item.severity === 'Critical' ? 'bg-red-500/10 border-red-500 text-red-500' :
                         item.severity === 'High' ? 'bg-orange-500/10 border-orange-500 text-orange-500' :
                         item.severity === 'Medium' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' :
                         'bg-blue-500/10 border-blue-500 text-blue-500'
                       }`}>
                         {item.severity}
                       </span>
                    </div>

                    {/* Offline/Online Badges for Hack Mode */}
                    {isHackMode && (
                      <div className="flex gap-2 mb-3">
                         {item.isOnlineExploitable && (
                           <span className="flex items-center text-[10px] bg-black/40 border border-white/10 px-2 py-0.5 rounded text-neon-cyan">
                             <Wifi size={10} className="mr-1" /> Online
                           </span>
                         )}
                         {item.isOfflineExploitable && (
                           <span className="flex items-center text-[10px] bg-black/40 border border-white/10 px-2 py-0.5 rounded text-orange-400">
                             <WifiOff size={10} className="mr-1" /> Offline
                           </span>
                         )}
                      </div>
                    )}

                    {item.exploitSteps && (
                      <div className="mb-3 bg-black/30 p-3 rounded border border-white/5">
                        <h5 className="text-[10px] uppercase font-bold text-slate-500 mb-1">Exploit Flow</h5>
                        <p className="text-xs text-slate-400 font-mono whitespace-pre-wrap">{item.exploitSteps}</p>
                      </div>
                    )}
                    <p className="text-slate-400 text-sm mb-3">{item.description || item.impact}</p>
                    <div className="flex items-center text-xs font-mono text-slate-600">
                      <span className="bg-white/5 px-2 py-1 rounded mr-2 text-slate-400">Line {item.line}</span>
                      {item.category && <span>{item.category}</span>}
                    </div>
                 </div>
              ))}
              
              {/* Empty States for lists */}
              {((isHackMode && result.hackAnalysis?.vulnerabilities.length === 0) || (!isHackMode && !isDebtMode && result.bugs.length === 0)) && (
                 <div className="flex flex-col items-center justify-center h-40 text-neon-green/50">
                    <CheckCircle size={48} className="mb-2" />
                    <span className="text-neon-green">System Secure</span>
                 </div>
              )}
           </div>
        )}

        {/* Code Views (Fixed / Secure / Refactored) */}
        {(activeTab === 'fixed' || activeTab === 'secure_code' || activeTab === 'refactored_code' || activeTab === 'optimized') && (
           <div className="h-full flex flex-col">
              <div className="flex justify-between items-center px-6 py-3 border-b border-white/5 bg-surface/50 backdrop-blur">
                <span className="text-xs font-mono text-slate-500 flex items-center">
                   <GitPullRequest size={14} className="mr-2"/> 
                   {activeTab === 'fixed' ? 'Bug Fixes' : activeTab === 'secure_code' ? 'Security Patch' : activeTab === 'optimized' ? 'Optimized' : 'Architecture Refactor'}
                </span>
                <button 
                  onClick={() => copyToClipboard(
                    activeTab === 'fixed' ? result.fixedCode : 
                    activeTab === 'secure_code' ? result.hackAnalysis!.secureCode : 
                    activeTab === 'optimized' ? result.optimizedCode :
                    result.techDebtAnalysis!.refactoredCode
                  )}
                  className="flex items-center space-x-2 text-xs font-bold text-neon-cyan hover:text-cyan-300 transition-colors"
                >
                  <Copy size={12} /> <span>COPY</span>
                </button>
              </div>
              <div className="flex-1 relative">
                <DiffViewer 
                  original={inputCode} 
                  modified={
                    activeTab === 'fixed' ? result.fixedCode : 
                    activeTab === 'secure_code' ? result.hackAnalysis!.secureCode : 
                    activeTab === 'optimized' ? result.optimizedCode :
                    result.techDebtAnalysis!.refactoredCode
                  } 
                />
              </div>
           </div>
        )}

        {/* Checklists & Impact & Risks */}
        {(activeTab === 'safety_checklist' || activeTab === 'engineering_checklist' || activeTab === 'attack_impact' || activeTab === 'future_risk' || activeTab === 'protection_patch') && (
           <div className="p-6 space-y-3">
              {(
                 activeTab === 'safety_checklist' ? result.hackAnalysis?.safetyChecklist :
                 activeTab === 'engineering_checklist' ? result.techDebtAnalysis?.engineeringChecklist :
                 activeTab === 'attack_impact' ? result.hackAnalysis?.vulnerabilities : // Mapping vulns to impact cards
                 activeTab === 'protection_patch' ? result.hackAnalysis?.vulnerabilities : // Mapping vulns to patch cards
                 result.techDebtAnalysis?.risks
              )?.map((item: any, idx: number) => {
                 // Different card styles for different content types
                 if (activeTab === 'future_risk') {
                   return (
                     <div key={idx} className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-xl">
                        <div className="flex justify-between mb-2"><h4 className="text-yellow-500 font-bold text-sm">Risk Prediction</h4><span className="text-[10px] uppercase font-bold text-yellow-600 border border-yellow-600 px-1 rounded">{item.likelihood}</span></div>
                        <p className="text-slate-300 text-sm mb-2">{item.prediction}</p>
                        <div className="flex items-center text-xs text-slate-500"><Clock size={12} className="mr-1"/> {item.timeframe}</div>
                     </div>
                   )
                 }
                 if (activeTab === 'attack_impact') {
                    return (
                      <div key={idx} className="bg-orange-500/5 border border-orange-500/20 p-4 rounded-xl flex gap-4">
                        <div className="mt-1"><Flame size={18} className="text-orange-500"/></div>
                        <div>
                          <h4 className="text-orange-400 font-bold text-sm mb-1">{item.name}</h4>
                          <p className="text-slate-400 text-xs leading-relaxed">{item.impact}</p>
                        </div>
                      </div>
                    )
                 }
                 if (activeTab === 'protection_patch') {
                    return (
                       <div key={idx} className="bg-neon-green/5 border border-neon-green/20 p-4 rounded-xl">
                          <h4 className="text-neon-green font-bold text-sm mb-2 flex items-center"><ShieldCheck size={16} className="mr-2"/>{item.name} Defense</h4>
                          <div className="space-y-3">
                             <div>
                               <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Patch Logic</span>
                               <p className="text-slate-300 text-xs">{item.patchExplanation}</p>
                             </div>
                             <div>
                               <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Strategic Defense</span>
                               <p className="text-slate-300 text-xs">{item.defenseStrategy}</p>
                             </div>
                          </div>
                       </div>
                    )
                 }
                 // Checklists
                 return (
                   <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <span className="text-sm text-slate-300">{item.item}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${
                        item.status === 'Secure' || item.status === 'Optimized' ? 'bg-neon-green/10 border-neon-green text-neon-green' :
                        item.status === 'Patched' ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan' :
                        'bg-neon-red/10 border-neon-red text-neon-red'
                      }`}>
                        {item.status}
                      </span>
                   </div>
                 )
              })}
           </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background text-slate-200 overflow-hidden font-sans selection:bg-neon-cyan/30 selection:text-white">
      {/* Top Bar - Ultra Minimal */}
      <header className="flex-none h-14 border-b border-white/5 bg-surface/50 backdrop-blur-md px-6 flex items-center justify-between z-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-slate-800 to-black rounded-lg border border-white/10 flex items-center justify-center shadow-lg">
             <div className="w-3 h-3 bg-neon-cyan rounded-full shadow-[0_0_10px_#06b6d4]"></div>
          </div>
          <span className="font-bold tracking-tight text-white">FixMyCode<span className="text-slate-600">.ai</span></span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
            {Object.values(AnalysisMode).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 ${
                  mode === m 
                    ? (m === AnalysisMode.HACK_DEFEND ? 'bg-neon-red text-black shadow-[0_0_15px_#f43f5e]' : 
                       m === AnalysisMode.TECH_DEBT ? 'bg-neon-purple text-white shadow-[0_0_15px_#8b5cf6]' : 
                       'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.5)]')
                    : 'text-slate-500 hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Code Input */}
        <div className="w-1/2 flex flex-col border-r border-white/5 bg-black/20 relative">
           {/* Floating Action Bar */}
           <div className="absolute bottom-6 right-6 z-30 flex space-x-3">
             <button 
               onClick={handleAnalyze}
               disabled={isAnalyzing || !inputCode.trim()}
               className={`
                 group relative flex items-center space-x-2 px-6 py-3 rounded-full font-bold text-sm transition-all shadow-xl
                 disabled:opacity-50 disabled:cursor-not-allowed
                 ${isHackMode 
                    ? 'bg-neon-red text-black hover:shadow-[0_0_20px_#f43f5e]' 
                    : isDebtMode 
                      ? 'bg-neon-purple text-white hover:shadow-[0_0_20px_#8b5cf6]'
                      : 'bg-neon-cyan text-black hover:shadow-[0_0_20px_#06b6d4]'}
               `}
             >
                {isAnalyzing ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} fill="currentColor" />}
                <span>{isAnalyzing ? 'PROCESSING' : isHackMode ? 'SIMULATE ATTACK' : isDebtMode ? 'CALCULATE DEBT' : 'ANALYZE CODE'}</span>
             </button>
           </div>

           <div className="flex-none px-6 py-3 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
             <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
               <Terminal size={12} />
               <span>INPUT SOURCE</span>
             </div>
             <div className="flex items-center space-x-4">
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className="bg-transparent text-xs text-slate-400 focus:text-white outline-none font-mono cursor-pointer uppercase text-right"
                >
                  {Object.values(SupportedLanguage).map(lang => (
                    <option key={lang} value={lang} className="bg-surface">{lang}</option>
                  ))}
                </select>
             </div>
           </div>
           
           <div className="flex-1 p-6 relative">
             <CodeEditor 
                value={inputCode} 
                onChange={setInputCode} 
                language={language}
                highlightLines={getHighlights()}
                mode={mode}
                isAnalyzing={isAnalyzing}
             />
           </div>
        </div>

        {/* Right: Results */}
        <div className="w-1/2 flex flex-col bg-surface/40 backdrop-blur-sm relative">
           {/* Glassmorphic Background Elements */}
           <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-cyan/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
              {isHackMode && <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-red/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>}
           </div>

           {hasResult && (
             <ResultTabs 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                bugCount={result?.bugs.length || 0}
                securityCount={result?.securityWarnings.length || 0}
                mode={mode}
             />
           )}
           
           <div className="flex-1 overflow-hidden relative z-10">
             {renderContent()}
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;
