import React from 'react';
import { ResourceType } from '../types';

interface ResourceDisplayProps {
  resources: Record<ResourceType, number>;
  rates: Record<ResourceType, number>;
}

const ResourceDisplay: React.FC<ResourceDisplayProps> = ({ resources, rates }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return Math.floor(num).toString();
  };

  const getColor = (type: ResourceType) => {
    switch (type) {
      case ResourceType.ENERGY: return 'text-yellow-400 shadow-yellow-500/50';
      case ResourceType.DATA: return 'text-cyan-400 shadow-cyan-500/50';
      case ResourceType.MATS: return 'text-fuchsia-400 shadow-fuchsia-500/50';
      case ResourceType.CREDITS: return 'text-green-400 shadow-green-500/50';
      default: return 'text-white';
    }
  };

  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-900/80 border-b-2 border-slate-700 backdrop-blur-sm sticky top-0 z-40">
      {Object.values(ResourceType).map((type) => (
        <div key={type} className="flex flex-col items-center justify-center border border-slate-800 bg-slate-950 p-2 rounded relative overflow-hidden group">
          <div className={`absolute top-0 left-0 w-1 h-full bg-current opacity-50 ${getColor(type).split(' ')[0]}`}></div>
          <span className="text-xs text-slate-500 uppercase tracking-widest mb-1">{type}</span>
          <span className={`text-2xl font-bold font-mono tracking-tighter ${getColor(type)} drop-shadow-md`}>
            {formatNumber(resources[type])}
          </span>
          <span className={`text-xs ${rates[type] >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {rates[type] >= 0 ? '+' : ''}{rates[type]}/s
          </span>
        </div>
      ))}
    </div>
  );
};

export default ResourceDisplay;