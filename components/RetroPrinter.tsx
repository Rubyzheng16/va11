
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DrinkRecipe, MixState, IngredientType } from '../types';
import { INGREDIENTS_CHINESE } from '../constants';

interface Props {
  targetRecipe: DrinkRecipe;
  finalMix: MixState;
  onReset: () => void;
}

interface Memo {
  id: number;
  // Use React.ReactElement instead of JSX.Element to resolve namespace errors in some environments
  content: React.ReactElement;
  color: string;
  rotation: number;
}

const RetroPrinter: React.FC<Props> = ({ targetRecipe, finalMix, onReset }) => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const colors = ['#fdf0d5', '#ff99c8', '#fcf6bd', '#d0f4de', '#a9def9'];

  const calculateAccuracy = () => {
    let score = 0;
    let params = 0;
    (Object.keys(targetRecipe.ingredients) as IngredientType[]).forEach(k => {
      const target = targetRecipe.ingredients[k];
      const actual = finalMix.ingredients[k];
      score += Math.max(0, 1 - Math.abs(target - actual) / 5);
      params++;
    });
    if (targetRecipe.iced === finalMix.iced) score += 1;
    if (targetRecipe.aged === finalMix.aged) score += 1;
    return Math.round((score / (params + 2)) * 100);
  };

  const handlePrint = () => {
    if (isPrinting) return;
    setIsPrinting(true);
    
    setTimeout(() => {
      const newMemo: Memo = {
        id: Date.now(),
        rotation: (Math.random() - 0.5) * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        content: (
          <div className="space-y-2 p-2 w-full text-black">
            <div className="border-b-2 border-dashed border-black/20 pb-1 mb-1 text-center font-bold uppercase text-lg">
              VA-11 HALL-A RECEIPT
            </div>
            <div className="flex justify-between text-xl font-black italic">
              <span>{targetRecipe.name}</span>
              <span>$180</span>
            </div>
            <div className="text-sm opacity-70">
              ACCURACY: {calculateAccuracy()}%
            </div>
            <div className="text-sm border-t border-black/10 pt-2 italic">
              “{targetRecipe.description}”
            </div>
            <div className="text-[10px] mt-4 opacity-50 text-center uppercase tracking-widest">
              Thanks for the drink.
            </div>
          </div>
        )
      };
      setMemos(prev => [...prev, newMemo]);
      setIsPrinting(false);
    }, 1200);
  };

  // Initial print on load
  useEffect(() => {
    handlePrint();
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-end pb-12 overflow-hidden" style={{ backgroundColor: 'transparent', backdropFilter: 'blur(0.5px)' }}>
      
      {/* Background/Stack of Memos */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence>
          {memos.map((memo, idx) => (
            <motion.div
              key={memo.id}
              initial={{ y: 500, opacity: 0, scale: 0.5, rotate: 0 }}
              animate={{ y: -150 - (idx * 5), opacity: 1, scale: 1, rotate: memo.rotation }}
              transition={{ type: "spring", damping: 15, stiffness: 100 }}
              className="absolute w-72 min-h-40 receipt-paper"
              style={{ backgroundColor: memo.color, zIndex: idx }}
            >
              {memo.content}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* The Red Retro Printer Device */}
      <div className="relative z-50 w-full max-w-md bg-[#e63946] p-4 rounded-t-3xl shadow-[0_-10px_30px_rgba(230,57,70,0.3)] border-x-4 border-t-4 border-black/20">
        
        {/* Paper Exit Slot */}
        <div className="w-full h-4 bg-black/60 rounded-full mb-6 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
        </div>

        {/* Device UI */}
        <div className="grid grid-cols-4 gap-4">
           {/* LCD Screen Display */}
           <div 
            onClick={() => inputRef.current?.focus()}
            className="col-span-3 h-24 bg-[#a5b18a] border-4 border-black/40 rounded-lg p-2 flex flex-col relative overflow-hidden"
           >
              <div className="text-[10px] text-black/40 font-bold mb-1 uppercase tracking-tight">System Status: SERVED</div>
              <div className="flex-1 text-black font-mono text-lg flex items-center justify-center text-center animate-pulse italic">
                {isPrinting ? 'PRINTING...' : `MATCH: ${calculateAccuracy()}%`}
              </div>
              <div className="absolute bottom-1 right-2 text-[8px] text-black/30">CALICOMP v1.1</div>
           </div>

           {/* Buttons Area */}
           <div className="col-span-1 flex flex-col gap-2">
              <button 
                onClick={handlePrint}
                className="flex-1 bg-black/20 hover:bg-black/30 border-2 border-black/40 rounded-lg text-white font-black text-[10px] uppercase tracking-tighter"
              >
                PRINT
              </button>
              <button 
                onClick={onReset}
                className="flex-1 bg-[#ff007f] hover:bg-[#ff007f]/80 border-2 border-black/40 rounded-lg text-white font-black text-[10px] uppercase tracking-tighter shadow-lg"
              >
                PURGE
              </button>
           </div>
        </div>

        <div className="flex justify-center mt-6 gap-8">
           <div className="w-3 h-3 rounded-full bg-black/20" />
           <div className="w-12 h-2 rounded-full bg-black/10" />
           <div className="w-3 h-3 rounded-full bg-black/20" />
        </div>
      </div>

      <div className="mt-8 text-[10px] text-white/20 font-black tracking-[1em] uppercase z-50">
        Retro Memo Printer // Served
      </div>
    </div>
  );
};

export default RetroPrinter;
