import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface LogTerminalProps {
  logs: LogEntry[];
}

const LogTerminal: React.FC<LogTerminalProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  return (
    <div className="h-64 md:h-full flex flex-col bg-black border-2 border-slate-800 p-2 font-mono text-xs relative overflow-hidden">
      {/* Header decoration */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-slate-900 border-b border-slate-800 flex items-center px-2 justify-between z-10">
        <span className="text-green-500 font-bold">>> SYSTEM_LOGS</span>
        <div className="flex gap-1">
           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
           <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
           <div className="w-2 h-2 rounded-full bg-green-500"></div>
        </div>
      </div>

      <div className="mt-8 overflow-y-auto flex-1 pr-1 space-y-1 scroll-smooth">
        {logs.map((log) => (
          <div key={log.id} className="border-l-2 border-slate-800 pl-2 py-0.5 animate-in fade-in slide-in-from-left-2 duration-300">
            <span className="text-slate-600 mr-2">[{new Date(log.timestamp).toLocaleTimeString().split(' ')[0]}]</span>
            <span className={`
              ${log.type === 'alert' ? 'text-red-400 font-bold' : ''}
              ${log.type === 'info' ? 'text-cyan-300' : ''}
              ${log.type === 'system' ? 'text-yellow-300' : ''}
              ${log.type === 'ai' ? 'text-fuchsia-400 italic' : ''}
            `}>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default LogTerminal;