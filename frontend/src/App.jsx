import React, { useState } from 'react';
import { Play, FastForward, Trash2, Code2, AlertTriangle, Cpu, TerminalSquare, CheckCircle, Download, FileText, Zap } from 'lucide-react';
import Editor from './components/Editor';
import DataTable from './components/DataTable';

const DEFAULT_CODE = `MACRO
INCR &A, &B, &REG
MOVER &REG, &A
ADD &REG, &B
MOVEM &REG, &A
MEND

MACRO
DECR &A, &B, &REG
MOVER &REG, &A
SUB &REG, &B
MOVEM &REG, &A
MEND

START 100
READ N1
READ N2
INCR N1, N2, AREG
DECR N1, N2, BREG
PRINT N1
PRINT N2
STOP
N1 DS 1
N2 DS 1
END`;

function App() {
  const [sourceCode, setSourceCode] = useState(DEFAULT_CODE);
  const [intermediateCode, setIntermediateCode] = useState('');
  const [expandedCode, setExpandedCode] = useState('');
  const [mnt, setMnt] = useState([]);
  const [mdt, setMdt] = useState([]);
  const [ala, setAla] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('intermediate'); // 'intermediate' | 'expanded'

  const handleClear = (clearSource = true) => {
    if (clearSource) setSourceCode('');
    setIntermediateCode('');
    setExpandedCode('');
    setMnt([]);
    setMdt([]);
    setAla([]);
    setError(null);
  };

  const handleLoadExample = (type) => {
    if (type === 'simple') {
      setSourceCode("MACRO\nSWAP &ARG1,&ARG2\nMOV R0,&ARG1\nMOV &ARG1,&ARG2\nMOV &ARG2,R0\nMEND\n\nSTART 100\nREAD N1\nREAD N2\nSWAP N1,N2\nPRINT N1\nEND");
    } else {
      setSourceCode(DEFAULT_CODE);
    }
    handleClear(false);
  };

  const handleDownload = () => {
    if (!expandedCode) {
      setError("No expanded code to download. Please run Pass 2 or Run All first.");
      return;
    }
    const element = document.createElement("a");
    const file = new Blob([expandedCode], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "expanded.asm";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePass1 = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/pass1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_code: sourceCode })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error.error + (data.error.line ? ` (Line ${data.error.line})` : ''));
      }
      
      setMnt(data.data.mnt);
      setMdt(data.data.mdt);
      setAla(data.data.ala || []);
      setIntermediateCode(data.data.intermediate_code);
      setExpandedCode(''); // Clear expanded code
      setActiveTab('intermediate');
    } catch (err) {
      setError(err.message || 'Failed to connect to server. Is the Flask app running?');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAll = async () => {
    if (!sourceCode) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/process_all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_code: sourceCode })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error.error + (data.error.line ? ` (Line ${data.error.line})` : ''));
      }
      
      setMnt(data.data.mnt);
      setMdt(data.data.mdt);
      setAla(data.data.ala || []);
      setIntermediateCode(data.data.intermediate_code);
      setExpandedCode(data.data.expanded_code);
      setActiveTab('expanded');
    } catch (err) {
      setError(err.message || 'Failed to connect to server. Check your syntax.');
    } finally {
      setLoading(false);
    }
  };

  const handlePass2 = async () => {
    if (!intermediateCode || mnt.length === 0 || mdt.length === 0) {
      setError('Please run Pass 1 first.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/pass2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intermediate_code: intermediateCode,
          mnt,
          mdt
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error.error + (data.error.line ? ` (Line ${data.error.line})` : ''));
      }
      
      setExpandedCode(data.data.expanded_code);
      setActiveTab('expanded');
    } catch (err) {
      setError(err.message || 'Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const mntColumns = [
    { header: 'Index', accessor: 'index' },
    { header: 'Macro Name', accessor: 'name' },
    { header: '# Params (PP)', accessor: 'pp' },
    { header: 'MDT Pointer (MDTp)', accessor: 'mdtp' }
  ];

  const mdtColumns = [
    { header: 'Index', accessor: 'index' },
    { header: 'Instruction', accessor: 'instruction' }
  ];

  const alaColumns = [
    { header: 'Macro', accessor: 'macro' },
    { header: 'Index', accessor: 'index' },
    { header: 'Argument', accessor: 'argument' }
  ];

  return (
    <div className="min-h-screen bg-background text-textMain p-4 md:p-6 lg:p-8 flex flex-col gap-6 font-sans">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface border border-border rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg text-primary">
            <Cpu size={28} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              MiniMacro Processor
            </h1>
            <p className="text-xs text-textMuted">Two-Pass Macro Simulation</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <button 
            onClick={handleRunAll} 
            disabled={loading || !sourceCode}
            className="btn-primary bg-indigo-600 hover:bg-indigo-700 hover:shadow-[0_0_15px_rgba(79,70,229,0.4)] flex items-center gap-2"
            title="Run Pass 1 and Pass 2 simultaneously"
          >
            <Zap size={16} />
            <span>Run All</span>
          </button>
          <button 
            onClick={handlePass1} 
            disabled={loading || !sourceCode}
            className="btn-primary flex items-center gap-2"
          >
            <Play size={16} />
            <span>Pass 1</span>
          </button>
          <button 
            onClick={handlePass2} 
            disabled={loading || !intermediateCode}
            className="btn-primary bg-purple-600 hover:bg-purple-700 hover:shadow-[0_0_15px_rgba(147,51,234,0.4)] flex items-center gap-2"
          >
            <FastForward size={16} />
            <span>Pass 2</span>
          </button>
          <button 
            onClick={() => handleClear(true)} 
            className="btn-secondary flex items-center gap-2"
          >
            <Trash2 size={16} />
            <span>Clear</span>
          </button>
        </div>
      </header>

      {/* Error Notification */}
      {error && (
        <div className="bg-error/10 border border-error/30 text-error p-4 rounded-xl flex items-start gap-3 shadow-lg animate-pulse-once">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <div className="font-medium text-sm">{error}</div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[75vh] min-h-[600px]">
        
        {/* Left Column: Input Source Code */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Code2 size={18} className="text-primary" />
              <h2 className="font-semibold text-lg text-textMain">Source Program</h2>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleLoadExample('simple')}
                className="px-2 py-1 bg-surfaceHover border border-border rounded text-xs text-textMuted hover:text-textMain transition-colors"
              >
                Simple Example
              </button>
              <button 
                onClick={() => handleLoadExample('advanced')}
                className="px-2 py-1 bg-surfaceHover border border-border rounded text-xs text-textMuted hover:text-textMain transition-colors"
              >
                Advanced Example
              </button>
            </div>
          </div>
          <div className="flex-1 shadow-2xl rounded-xl overflow-hidden ring-1 ring-border/50 transition-all hover:ring-border">
            <Editor 
              value={sourceCode}
              onChange={setSourceCode}
              title="main.asm"
              placeholder="Enter MiniMacro assembly code here..."
            />
          </div>
        </div>

        {/* Right Column: Output & Tables */}
        <div className="flex flex-col h-full gap-6">
          
          {/* Top Half: Output Code */}
          <div className="flex flex-col flex-1 h-1/2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TerminalSquare size={18} className="text-purple-400" />
                <h2 className="font-semibold text-lg text-textMain">Generated Output</h2>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleDownload}
                  disabled={!expandedCode}
                  className="flex items-center gap-1 px-2 py-1 bg-surfaceHover border border-border rounded text-xs text-textMuted hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Download Expanded Code"
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>
                <div className="flex gap-1 bg-surfaceHover rounded-lg p-1 border border-border">
                  <button 
                    onClick={() => setActiveTab('intermediate')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'intermediate' ? 'bg-surface shadow-sm text-primary' : 'text-textMuted hover:text-textMain'}`}
                  >
                    Intermediate Code
                  </button>
                  <button 
                    onClick={() => setActiveTab('expanded')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'expanded' ? 'bg-surface shadow-sm text-purple-400' : 'text-textMuted hover:text-textMain'}`}
                  >
                    Expanded Code
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 shadow-xl rounded-xl overflow-hidden ring-1 ring-border/50">
              {activeTab === 'intermediate' ? (
                <Editor 
                  value={intermediateCode} 
                  readOnly 
                  title="intermediate.obj (Pass 1 Output)"
                  placeholder="Intermediate code will appear here after Pass 1..."
                />
              ) : (
                <Editor 
                  value={expandedCode} 
                  readOnly 
                  title="expanded.asm (Pass 2 Output)"
                  placeholder="Expanded macro code will appear here after Pass 2..."
                />
              )}
            </div>
          </div>

          {/* Bottom Half: Tables */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-1/2 overflow-y-auto">
            <DataTable 
              title="MNT" 
              columns={mntColumns} 
              data={mnt}
              emptyMessage="MNT is empty."
            />
            <DataTable 
              title="MDT" 
              columns={mdtColumns} 
              data={mdt}
              emptyMessage="MDT is empty."
            />
            <DataTable 
              title="ALA (Dummy Args)" 
              columns={alaColumns} 
              data={ala}
              emptyMessage="ALA is empty."
            />
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default App;
