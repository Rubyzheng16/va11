
import React from 'react';
import { motion } from 'framer-motion';
import { IngredientType } from '../types';
import { INGREDIENTS_CONFIG } from '../constants';

interface Props {
  type: IngredientType;
  onDrop: () => void;
}

const DraggableBottle: React.FC<Props> = ({ type, onDrop }) => {
  const config = INGREDIENTS_CONFIG[type];

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      onDragEnd={(event, info) => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        // Central interaction zone check
        if (Math.abs(info.point.x - centerX) < 250 && Math.abs(info.point.y - centerY) < 300) {
          onDrop();
        }
      }}
      whileHover={{ scale: 1.1, zIndex: 100 }}
      whileTap={{ scale: 0.95, cursor: 'grabbing' }}
      className="flex flex-col items-center cursor-grab active:cursor-grabbing p-2 group"
    >
      <div className="w-20 h-44 relative pixel-box flex flex-col items-center justify-end overflow-hidden transition-all group-hover:border-[#00f2ff] bg-black/40" style={{ borderColor: config.color + '66' }}>
        <div 
          className="w-full absolute bottom-0 opacity-50 transition-all group-hover:opacity-100" 
          style={{ height: '70%', backgroundColor: config.color, boxShadow: `0 0 25px ${config.color}88` }} 
        />
        <div className="z-10 text-xs font-black text-white bg-black/90 w-full text-center py-3 uppercase tracking-tighter italic border-t border-[#1a1a1f]">
          {config.label}
        </div>
      </div>
      <div className="text-[10px] mt-3 text-[#444] font-black uppercase tracking-widest group-hover:text-[#00f2ff] transition-colors">
        {type}
      </div>
    </motion.div>
  );
};

export default DraggableBottle;
