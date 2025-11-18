import React from 'react';
import { ResourceType } from '../types';

interface OfflineModalProps {
  gains: Record<ResourceType, number>;
  onClose: () => void;
}

const OfflineModal: React.FC<OfflineModalProps> = ({ gains, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-950 border-2 border-green-500 p-8 max-w-md w-full shadow-[0_0_50px_rgba(34,197,94,0.2)] relative">
        <h2 className="text-2xl text-green-500 font-bold mb-4 font-mono uppercase tracking-widest border-b border-slate-800 pb-2">
          Session Restored
        </h2>
        <p className="text-slate-400 mb-6 text-sm">
          Autonomous protocols continued execution during operator absence. Resources assimilated:
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          {Object.entries(gains).map(([type, amount]) => (
             (amount as number) > 0 && (
                <div key={type} className="border border-slate-800 p-3 bg-slate-900">
                  <div className="text-xs text-slate-500 uppercase">{type}</div>
                  <div className="text-xl text-green-400 font-mono">+{Math.floor(amount as number)}</div>
                </div>
             )
          ))}
          {Object.keys(gains).length === 0 && <div className="text-slate-500 italic">No significant resource changes.</div>}
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-green-900/20 border border-green-500 text-green-400 py-3 hover:bg-green-500 hover:text-black transition-colors font-bold tracking-widest uppercase"
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
};

export default OfflineModal;