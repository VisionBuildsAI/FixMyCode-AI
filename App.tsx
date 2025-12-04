import React, { useState } from 'react';
import { 
  Play, 
  Copy, 
  CheckCircle, 
  AlertTriangle, 
  Shield, 
  ShieldAlert,
  ShieldCheck,
  Code,
  Clock, 
  Maximize2,
  RefreshCw,
  Eye,
  EyeOff,
  Unlock,
  Terminal,
  Skull,
  FileCheck,
  CheckSquare
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

  const renderContent = () => {
    if (isAnalyzing) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-500" />
          <p className="text-lg font-mono animate-pulse">
            {isHackMode ? "Simulating Cyber Attacks..." : "Analyzing logic..."}
          </p>
          <div className="text-sm opacity-60">
             {isHackMode ? "Identifying exploits, testing payloads, and generating defense strategies." : "Scanning for bugs, security risks, and optimization opportunities."}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-400 space-y-4 p-8 text-center">
          <AlertTriangle className="w-16 h-16" />
          <h3 className="text-xl font-bold">Analysis Failed</h3>
          <p>{error}</p>
        </div>
      );
    }

    if (!result) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-6 p-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 border ${isHackMode ? 'bg-red-900/20 border-red-500/50' : 'bg-gray-800 border-gray-700'}`}>
             {isHackMode ? <Skull className="text-red-500" size={40} /> : <CodeIcon />}
          </div>
          <h3 className="text-2xl font-bold text-gray-300">
            {isHackMode ? "Hack & Defend Mode" : "FixMyCode AI"}
          </h3>
          <p className="text-center max-w-md">
            {isHackMode 
              ? "Paste code to run a full penetration test simulation. The AI will identify attack vectors and generate a secured version."
              : "Paste your code on the left and select a mode. The AI will detect bugs, fix errors, and optimize performance instantly."
            }
          </p>
          <div className="grid grid-cols-3 gap-4 text-xs font-mono opacity-70">
            {isHackMode ? (
              <>
                 <div className="flex items-center space-x-2 text-red-400"><Unlock size={14}/> <span>Exploit Sim</span></div>
                 <div className="flex items-center space-x-2 text-green-400"><Shield size={14}/> <span>Auto-Defense</span></div>
                 <div className="flex items-center space-x-2 text-blue-400"><FileCheck size={14}/> <span>Secure Patch</span></div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2"><CheckCircle size={14}/> <span>Auto-Fix</span></div>
                <div className="flex items-center space-x-2"><Shield size={14}/> <span>Security Scan</span></div>
                <div className="flex items-center space-x-2"><Clock size={14}/> <span>Complexity</span></div>
              </>
            )}
          </div>
        </div>
      );
    }

    // Interview Mode Spoiler Protection
    if (mode === AnalysisMode.INTERVIEW && !interviewRevealed && activeTab !== 'bugs') {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-6 p-8">
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 max-w-lg w-full shadow-2xl">
            <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center">
              <EyeOff className="mr-2" /> Interview Mode Active
            </h3>
            <p className="text-gray-300 mb-6">
              The solution is hidden to encourage debugging. 
              Review the <span className="text-blue-400 font-mono">Root Cause</span> (Bugs tab) for hints first.
            </p>
            <button 
              onClick={() => setInterviewRevealed(true)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors flex items-center justify-center space-x-2"
            >
              <Eye size={18} />
              <span>Reveal Solution</span>
            </button>
          </div>
        </div>
      );
    }

    // --- Hack & Defend Mode Tabs ---
    if (isHackMode && result.hackAnalysis) {
      switch (activeTab) {
        case 'hack_simulation':
          return (
            <div className="p-6 space-y-6 overflow-y-auto h-full">
              {result.hackAnalysis.vulnerabilities.map((vuln, idx) => (
                <div key={idx} className="bg-red-950/20 border border-red-900/50 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-red-400 font-bold flex items-center text-lg">
                      <Unlock size={20} className="mr-2" /> {vuln.name}
                    </h4>
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded uppercase">{vuln.severity}</span>
                  </div>
                  <div className="space-y-4">
                     <div>
                       <span className="text-xs uppercase text-gray-500 font-bold block mb-1">Target Location</span>
                       <span className="font-mono text-sm bg-gray-900 px-2 py-1 rounded text-gray-300">Line {vuln.line}</span>
                     </div>
                     <div>
                       <span className="text-xs uppercase text-gray-500 font-bold block mb-1">Exploit Simulation</span>
                       <p className="text-gray-300 text-sm whitespace-pre-wrap">{vuln.exploitSteps}</p>
                     </div>
                     <div>
                       <span className="text-xs uppercase text-gray-500 font-bold block mb-1">Example Payload</span>
                       <code className="block bg-black p-3 rounded text-red-300 font-mono text-xs overflow-x-auto border border-red-900/30">
                         {vuln.payload}
                       </code>
                     </div>
                  </div>
                </div>
              ))}
              {result.hackAnalysis.vulnerabilities.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-green-500">
                  <ShieldCheck size={64} className="mb-4" />
                  <h3 className="text-xl font-bold">System Secure</h3>
                  <p className="text-gray-400">No critical vulnerabilities detected in simulation.</p>
                </div>
              )}
            </div>
          );
        
        case 'attack_impact':
          return (
            <div className="p-6 space-y-4 overflow-y-auto h-full">
              {result.hackAnalysis.vulnerabilities.map((vuln, idx) => (
                <div key={idx} className="bg-orange-950/20 border border-orange-900/50 rounded-lg p-5 flex items-start space-x-4">
                   <div className="flex-none p-3 bg-orange-900/30 rounded-lg text-orange-400">
                      <Skull size={24} />
                   </div>
                   <div>
                     <h4 className="text-orange-300 font-bold text-lg mb-2">{vuln.name} Impact</h4>
                     <p className="text-gray-300 text-sm leading-relaxed">{vuln.impact}</p>
                   </div>
                </div>
              ))}
            </div>
          );

        case 'protection_patch':
          return (
            <div className="p-6 space-y-6 overflow-y-auto h-full">
               {result.hackAnalysis.vulnerabilities.map((vuln, idx) => (
                <div key={idx} className="bg-green-950/20 border border-green-900/50 rounded-lg p-5">
                   <div className="flex items-center space-x-2 mb-4 border-b border-green-900/30 pb-3">
                     <ShieldCheck className="text-green-500" size={20} />
                     <h4 className="text-green-400 font-bold">{vuln.name} Defense</h4>
                   </div>
                   <div className="grid gap-4">
                     <div>
                       <span className="text-xs uppercase text-green-600/70 font-bold block mb-1">Patch Explanation</span>
                       <p className="text-gray-300 text-sm">{vuln.patchExplanation}</p>
                     </div>
                     <div>
                       <span className="text-xs uppercase text-green-600/70 font-bold block mb-1">Long-term Strategy</span>
                       <p className="text-gray-300 text-sm italic border-l-2 border-green-700 pl-3 py-1 bg-green-900/10">
                         {vuln.defenseStrategy}
                       </p>
                     </div>
                   </div>
                </div>
              ))}
            </div>
          );

        case 'secure_code':
           return (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center px-4 py-2 bg-[#0f172a] border-b border-gray-800">
                <span className="text-xs text-green-400 font-mono font-bold flex items-center">
                   <FileCheck size={14} className="mr-2"/> Secure Patch Diff
                </span>
                <button 
                  onClick={() => copyToClipboard(result.hackAnalysis!.secureCode)}
                  className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Copy size={12} /> <span>Copy Secure Code</span>
                </button>
              </div>
              <div className="flex-1 overflow-hidden relative">
                <DiffViewer original={inputCode} modified={result.hackAnalysis.secureCode} />
              </div>
            </div>
           );

        case 'safety_checklist':
           return (
             <div className="p-8 h-full overflow-y-auto flex flex-col items-center">
                <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                   <svg className="w-full h-full transform -rotate-90">
                     <circle cx="96" cy="96" r="88" className="text-gray-800" strokeWidth="12" fill="none" stroke="currentColor" />
                     <circle 
                        cx="96" cy="96" r="88" 
                        className={`${result.hackAnalysis.securityScore > 80 ? 'text-green-500' : result.hackAnalysis.securityScore > 50 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                        strokeWidth="12" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeDasharray={553} 
                        strokeDashoffset={553 - (553 * result.hackAnalysis.securityScore) / 100}
                        strokeLinecap="round"
                     />
                   </svg>
                   <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-bold text-white">{result.hackAnalysis.securityScore}</span>
                      <span className="text-xs text-gray-400 uppercase tracking-widest">Score</span>
                   </div>
                </div>

                <div className="w-full max-w-2xl bg-[#1e293b] rounded-xl border border-gray-700 overflow-hidden">
                   <div className="bg-gray-800/50 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                      <h4 className="font-bold text-gray-200 flex items-center">
                        <CheckSquare className="mr-2 text-blue-400" size={18} /> Final Safety Checklist
                      </h4>
                      <span className="text-xs text-gray-500">{result.hackAnalysis.safetyChecklist.length} checks</span>
                   </div>
                   <div className="divide-y divide-gray-700/50">
                      {result.hackAnalysis.safetyChecklist.map((item, idx) => (
                        <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors">
                           <span className="text-sm text-gray-300">{item.item}</span>
                           <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                              item.status === 'Secure' ? 'bg-green-900/30 text-green-400 border border-green-900/50' :
                              item.status === 'Patched' ? 'bg-blue-900/30 text-blue-400 border border-blue-900/50' :
                              'bg-red-900/30 text-red-400 border border-red-900/50'
                           }`}>
                             {item.status}
                           </span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           );
      }
    }

    // --- Standard Modes Tabs ---
    switch (activeTab) {
      case 'bugs':
        return (
          <div className="p-6 space-y-6 overflow-y-auto h-full">
            <div className="bg-[#1e293b] p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm uppercase tracking-wider text-gray-400 font-semibold mb-2">Root Cause Analysis</h3>
              <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{result.rootCause}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm uppercase tracking-wider text-gray-400 font-semibold">Detected Issues</h3>
              {result.bugs.length === 0 ? (
                <div className="text-green-400 flex items-center space-x-2 bg-green-900/20 p-4 rounded-lg border border-green-900/50">
                  <CheckCircle size={18} />
                  <span>No obvious bugs detected!</span>
                </div>
              ) : (
                result.bugs.map((bug, idx) => (
                  <div key={idx} className="flex items-start space-x-3 bg-red-900/10 p-4 rounded-lg border border-red-900/30 hover:border-red-500/50 transition-colors">
                    <div className="flex-none mt-1">
                      <AlertTriangle size={18} className={bug.severity === 'Critical' ? 'text-red-500' : 'text-yellow-500'} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-mono bg-gray-800 px-2 py-0.5 rounded text-gray-300">Line {bug.line}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          bug.severity === 'Critical' ? 'bg-red-500 text-white' : 
                          bug.severity === 'Warning' ? 'bg-yellow-600 text-white' : 'bg-blue-600 text-white'
                        }`}>{bug.severity}</span>
                      </div>
                      <p className="text-gray-300 text-sm">{bug.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      
      case 'fixed':
        return (
          <div className="h-full flex flex-col">
             <div className="flex justify-between items-center px-4 py-2 bg-[#0f172a] border-b border-gray-800">
               <span className="text-xs text-gray-400 font-mono">Diff View (Original vs Fixed)</span>
               <button 
                  onClick={() => copyToClipboard(result.fixedCode)}
                  className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
               >
                 <Copy size={12} /> <span>Copy Code</span>
               </button>
             </div>
             <div className="flex-1 overflow-hidden relative">
               <DiffViewer original={inputCode} modified={result.fixedCode} />
             </div>
          </div>
        );

      case 'optimized':
        return (
          <div className="h-full flex flex-col">
            <div className="p-4 bg-[#1e293b] border-b border-gray-700">
               <h3 className="text-sm font-semibold text-yellow-400 mb-1 flex items-center"><Maximize2 size={14} className="mr-2"/> Performance Summary</h3>
               <p className="text-sm text-gray-300">{result.performanceSummary}</p>
            </div>
             <div className="flex-1 overflow-hidden relative flex flex-col">
                <div className="absolute top-2 right-4 z-10">
                   <button 
                      onClick={() => copyToClipboard(result.optimizedCode)}
                      className="bg-gray-800/80 backdrop-blur hover:bg-gray-700 text-gray-300 p-2 rounded-md border border-gray-600 transition-all"
                      title="Copy Optimized Code"
                   >
                     <Copy size={16} />
                   </button>
                </div>
               <CodeEditor value={result.optimizedCode} onChange={() => {}} language={language} readOnly />
             </div>
             <div className="p-4 bg-[#1e293b] border-t border-gray-700 space-y-2">
                <h4 className="text-xs font-semibold text-gray-400 uppercase">Refactoring Suggestions</h4>
                <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                   {result.refactoringSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
             </div>
          </div>
        );

      case 'security':
        return (
          <div className="p-6 space-y-4 overflow-y-auto h-full">
            {result.securityWarnings.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-48 text-green-400 space-y-2 opacity-70">
                  <Shield size={48} />
                  <span className="text-lg">No security vulnerabilities detected.</span>
               </div>
            ) : (
              result.securityWarnings.map((sec, idx) => (
                <div key={idx} className="bg-orange-900/10 border border-orange-900/30 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-orange-200 flex items-center">
                       <ShieldAlert size={16} className="mr-2"/> {sec.vulnerability}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded font-bold ${
                      sec.severity === 'High' ? 'bg-red-500' : 
                      sec.severity === 'Medium' ? 'bg-orange-500' : 'bg-yellow-500'
                    } text-white`}>{sec.severity}</span>
                  </div>
                  <div className="text-sm text-gray-300 mb-2">
                    <span className="font-semibold text-gray-500 uppercase text-xs">Fix:</span> {sec.fix}
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'complexity':
        return (
          <div className="p-8 space-y-8 overflow-y-auto h-full flex flex-col items-center justify-center">
             <div className="grid grid-cols-2 gap-8 w-full max-w-2xl">
                <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-700 flex flex-col items-center text-center hover:border-blue-500 transition-colors">
                   <Clock className="w-10 h-10 text-blue-400 mb-4" />
                   <h3 className="text-gray-400 uppercase text-xs font-bold tracking-wider mb-2">Time Complexity</h3>
                   <span className="text-3xl font-mono font-bold text-white">{result.complexity.time}</span>
                </div>
                <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-700 flex flex-col items-center text-center hover:border-purple-500 transition-colors">
                   <Maximize2 className="w-10 h-10 text-purple-400 mb-4" />
                   <h3 className="text-gray-400 uppercase text-xs font-bold tracking-wider mb-2">Space Complexity</h3>
                   <span className="text-3xl font-mono font-bold text-white">{result.complexity.space}</span>
                </div>
             </div>
             <div className="max-w-2xl text-center">
               <h4 className="text-gray-500 uppercase text-xs font-bold mb-2">Analysis</h4>
               <p className="text-lg text-gray-200 leading-relaxed">{result.complexity.explanation}</p>
             </div>
          </div>
        );
    }
  };

  // Calculate highlighted lines based on mode
  const getHighlightedLines = () => {
    if (!result) return [];
    if (isHackMode && result.hackAnalysis) {
      return result.hackAnalysis.vulnerabilities.map(v => v.line);
    }
    return result.bugs.map(b => b.line);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-white overflow-hidden">
      {/* Header */}
      <header className="flex-none h-16 border-b border-gray-800 bg-[#0f172a] px-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg shadow-lg ${isHackMode ? 'bg-red-600 shadow-red-900/50' : 'bg-blue-600 shadow-blue-900/50'} transition-colors duration-300`}>
             {isHackMode ? <Skull className="text-white" size={24} /> : <CodeIcon />}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
              FixMyCode AI
              {isHackMode && <span className="ml-2 px-2 py-0.5 bg-red-900/50 text-red-200 text-[10px] uppercase rounded border border-red-700">Hack Mode</span>}
            </h1>
            <span className="text-xs text-gray-500 font-mono">v1.1.0 • {mode}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            className="bg-[#1e293b] border border-gray-700 text-gray-200 text-sm rounded-md px-3 py-1.5 outline-none focus:border-blue-500"
          >
            {Object.values(SupportedLanguage).map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>

          <div className="flex bg-[#1e293b] rounded-lg p-1 border border-gray-700">
            {Object.values(AnalysisMode).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  mode === m 
                    ? (m === AnalysisMode.HACK_DEFEND ? 'bg-red-600 text-white shadow-sm' : 'bg-blue-600 text-white shadow-sm')
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || !inputCode.trim()}
            className={`
              flex items-center space-x-2 px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-lg
              ${isAnalyzing || !inputCode.trim() 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : isHackMode
                   ? 'bg-red-600 hover:bg-red-500 text-white hover:shadow-red-500/20 active:scale-95'
                   : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/20 active:scale-95'
              }
            `}
          >
             {isAnalyzing ? <RefreshCw className="animate-spin" size={16} /> : (isHackMode ? <Terminal size={16} /> : <Play size={16} fill="currentColor" />)}
             <span>{isAnalyzing ? 'Processing...' : (isHackMode ? 'Simulate Attack' : 'Run Analysis')}</span>
          </button>
        </div>
      </header>

      {/* Main Split View */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Code Input */}
        <div className="w-1/2 flex flex-col border-r border-gray-800">
           <div className="flex-none px-4 py-2 bg-[#1e293b] border-b border-gray-800 flex justify-between items-center">
             <span className="text-xs font-mono text-gray-400 flex items-center">
                <Code className="w-3 h-3 mr-2" />
                Input Source
             </span>
             <span className="text-xs text-gray-600">
               {inputCode.length} chars
             </span>
           </div>
           <div className="flex-1 relative">
             <CodeEditor 
                value={inputCode} 
                onChange={setInputCode} 
                language={language}
                highlightLines={getHighlightedLines()}
             />
           </div>
        </div>

        {/* Right: Results */}
        <div className="w-1/2 flex flex-col bg-[#0f172a]">
           {hasResult && (
             <ResultTabs 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                bugCount={result?.bugs.length || 0}
                securityCount={result?.securityWarnings.length || 0}
                mode={mode}
             />
           )}
           <div className="flex-1 overflow-auto">
             {renderContent()}
           </div>
        </div>
      </main>
    </div>
  );
};

const CodeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 18L22 12L16 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 6L2 12L8 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default App;