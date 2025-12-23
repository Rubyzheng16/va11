
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
        // Broad drop detection for the central mixing area
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        if (Math.abs(info.point.x - centerX) < 250 && Math.abs(info.point.y - centerY) < 300) {
          onDrop();
        }
      }}
      whileHover={{ scale: 1.2, zIndex: 100 }}
      whileTap={{ scale: 0.9, cursor: 'grabbing' }}
      className="flex flex-col items-center cursor-grab active:cursor-grabbing p-1 group"
    >
      <div className="w-10 h-20 relative pixel-box flex flex-col items-center justify-end overflow-hidden transition-all group-hover:border-[#00f2ff]" style={{ borderColor: config.color + '44' }}>
        <div className="w-full absolute bottom-0 opacity-40 transition-all group-hover:opacity-100" style={{ height: '65%', backgroundColor: config.color, boxShadow: `0 0 15px ${config.color}88` }} />
        <div className="z-10 text-[7px] font-black text-white bg-black/80 w-full text-center py-1 uppercase tracking-tighter italic border-t border-[#1a1a1f]">{type.split(' ')[0]}</div>
      </div>
      <div className="text-[7px] mt-2 text-[#444] font-black uppercase tracking-widest group-hover:text-[#00f2ff] transition-colors">{type}</div>
    </motion.div>
  );
};

export default DraggableBottle;
