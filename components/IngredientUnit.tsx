
import React from 'react';
import { IngredientType } from '../types';
import { INGREDIENTS_CONFIG } from '../constants';

interface Props {
  type: IngredientType;
  currentCount: number;
  onAdd: () => void;
  onRemove: () => void;
}

const IngredientUnit: React.FC<Props> = ({ type, currentCount, onAdd, onRemove }) => {
  const config = INGREDIENTS_CONFIG[type];
  
  return (
    <div className="flex flex-col gap-1 p-2 bg-[#111] pixel-border border-[#333] hover:border-[#ff007f] transition-colors">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold uppercase tracking-wider">{type}</span>
        <span className="text-xs text-[#ff007f]">{currentCount}/10</span>
      </div>
      
      <div className="grid grid-cols-5 gap-1 h-12 mb-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div 
            key={i} 
            className="border border-[#444]"
            style={{ 
              backgroundColor: i < currentCount ? config.color : 'transparent',
              boxShadow: i < currentCount ? `0 0 5px ${config.color}` : 'none'
            }}
          />
        ))}
      </div>

      <div className="flex gap-1 mt-auto">
        <button 
          onClick={onAdd}
          className="flex-1 bg-[#222] hover:bg-[#333] active:scale-95 text-xs py-1 transition-all border border-[#444]"
        >
          ADD
        </button>
        <button 
          onClick={onRemove}
          className="flex-1 bg-[#222] hover:bg-red-900/20 active:scale-95 text-xs py-1 transition-all border border-[#444]"
        >
          DEL
        </button>
      </div>
    </div>
  );
};

export default IngredientUnit;
