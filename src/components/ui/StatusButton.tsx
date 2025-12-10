
import React from 'react';
import { InspectionStatus } from '../../types';

const StatusButton: React.FC<{label: string, status: InspectionStatus, current: any, onClick: () => void, colorClass: 'green' | 'red' | 'yellow' | 'gray'}> = ({label, status, current, onClick, colorClass}) => {
  const isSelected = status === current;
  const colors = {
    green: isSelected ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-700 border-green-200 hover:bg-green-50',
    red: isSelected ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-700 border-red-200 hover:bg-red-50',
    yellow: isSelected ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-amber-600 border-amber-200 hover:bg-amber-50',
    gray: isSelected ? 'bg-slate-600 text-white border-slate-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50',
  };

  return (
    <button onClick={onClick} className={`relative py-2.5 px-1 rounded-lg border font-bold text-[10px] sm:text-xs transition-all flex flex-col items-center gap-1 ${colors[colorClass]} ${isSelected ? 'shadow-md z-10' : 'shadow-sm'}`}>
      {status === InspectionStatus.GOOD && <span className="text-base leading-none">✓</span>}
      {status === InspectionStatus.BAD && <span className="text-base leading-none">✕</span>}
      {status === InspectionStatus.ATTENTION && <span className="text-base leading-none">!</span>}
      {status === InspectionStatus.NIL && <span className="text-base leading-none">Ø</span>}
      <span className="uppercase tracking-tight">{label}</span>
    </button>
  );
};

export default StatusButton;
