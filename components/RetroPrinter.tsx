
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DrinkRecipe, MixState, IngredientType } from '../types';

interface Props {
  targetRecipe: DrinkRecipe;
  finalMix: MixState;
  onReset: () => void;
}

interface Memo {
  id: number;
  content: React.ReactElement;
  color: string;
  rotation: number;
}

const RetroPrinter: React.FC<Props> = ({ targetRecipe, finalMix, onReset }) => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [isPrinting, setIsPrinting] = useState(false);

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
        rotation: (Math.random() - 0.5) * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        content: (
          <div className="space-y-2 p-4 w-full text-black">
            <div className="border-b-2 border-dashed border-black/30 pb-1 mb-2 text-center font-bold uppercase text-[10px] tracking-tighter">
              VA-11 HALL-A // DATA_RECIEPT
            </div>
            <div className="flex justify-between text-lg font-black italic">
              <span>{targetRecipe.name}</span>
              <span>$180</span>
            </div>
            <div className="text-[11px] font-bold border-y border-black/10 py-1 font-mono">
              ACCURACY_RATING: {calculateAccuracy()}%
            </div>
            <div className="text-xs italic leading-snug mt-2 text-gray-700">
              “{targetRecipe.description}”
            </div>
            <div className="text-[8px] mt-4 opacity-40 text-center uppercase tracking-widest font-bold">
              * TRANSACTION_ID: {Math.random().toString(36).substr(2, 9).toUpperCase()} *
            </div>
          </div>
        )
      };
      setMemos(prev => [...prev, newMemo]);
      setIsPrinting(false);
    }, 1500);
  };

  useEffect(() => {
    handlePrint();
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-end pb-8 overflow-hidden bg-black/60 backdrop-blur-md">
      
      {/* Printer Wrapper: 进一步缩小整体比例并防止溢出 */}
      <div className="relative w-full flex flex-col items-center scale-[0.65] md:scale-[0.55] lg:scale-[0.6] translate-y-12">
        
        {/* Paper Track Area: 限制高度并居中 */}
        <div className="relative w-80 h-[45vh] flex flex-col items-center justify-end overflow-hidden pointer-events-none mb-[-20px]">
          <AnimatePresence>
            {memos.map((memo, idx) => {
              return (
                <motion.div
                  key={memo.id}
                  initial={{ y: 200, height: 0, opacity: 0 }}
                  animate={{ 
                    y: - (memos.length - 1 - idx) * 35,
                    height: 'auto',
                    opacity: 1, 
                    rotate: memo.rotation 
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute bottom-0 w-72 receipt-paper shadow-2xl origin-bottom border-x border-black/5"
                  style={{ backgroundColor: memo.color, zIndex: idx }}
                >
                  {memo.content}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Machine Body: 增强赛博红色外观 */}
        <div className="relative z-50 w-full max-w-lg bg-[#e63946] p-8 rounded-t-[50px] shadow-[0_-25px_80px_rgba(0,0,0,0.9),inset_0_4px_2px_rgba(255,255,255,0.2)] border-x-8 border-t-8 border-black/20">
          
          {/* Output Slot: 机械出纸口 */}
          <div className="w-full h-10 bg-black rounded-full mb-8 relative flex items-center justify-center shadow-[inset_0_4px_15px_rgba(0,0,0,1)] border-b-2 border-white/10">
             <div className="w-[85%] h-1 bg-white/5 rounded-full" />
             <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
          </div>

          {/* Controls: 控制面板 */}
          <div className="grid grid-cols-5 gap-6">
             <div className="col-span-3 h-28 bg-[#9ba781] border-[6px] border-black/40 rounded-2xl p-4 flex flex-col relative overflow-hidden shadow-[inset_0_6px_12px_rgba(0,0,0,0.6)]">
                <div className="text-[10px] text-black/60 font-black mb-1 uppercase tracking-tighter">TERMINAL_LOG // VER 2.1</div>
                <div className="flex-1 text-black font-mono text-lg flex items-center justify-center text-center italic font-black uppercase">
                  {isPrinting ? (
                    <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
                      >>> PRINTING_DATA
                    </motion.div>
                  ) : `SCORE: ${calculateAccuracy()}%`}
                </div>
                <div className="absolute bottom-1 right-3 text-[8px] text-black/30 font-bold tracking-[0.2em]">CALICOMP_CORE</div>
             </div>

             <div className="col-span-2 flex flex-col gap-3">
                <button 
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className={`flex-1 border-4 border-black/30 rounded-2xl font-black text-xs uppercase transition-all shadow-xl active:translate-y-1 ${isPrinting ? 'bg-black/20 text-black/40' : 'bg-black/40 hover:bg-black/60 text-white'}`}
                >
                  [ PRINT ]
                </button>
                <button 
                  onClick={onReset}
                  className="flex-1 bg-[#ff007f] hover:brightness-110 border-4 border-black/30 rounded-2xl text-white font-black text-xs uppercase shadow-xl active:translate-y-1"
                >
                  [ NEXT ]
                </button>
             </div>
          </div>

          {/* Decorative Feet: 底部装饰 */}
          <div className="flex justify-between px-10 mt-8 opacity-40">
             <div className="w-4 h-4 rounded-full bg-black" />
             <div className="w-20 h-3 bg-black rounded-full" />
             <div className="w-4 h-4 rounded-full bg-black" />
          </div>
        </div>
      </div>

      <div className="mt-2 text-[10px] text-white/30 font-black tracking-[2em] uppercase z-50 pointer-events-none text-center">
        VA-11 HALL-A // ATMOSPHERIC_MIXER
      </div>
    </div>
  );
};

export default RetroPrinter;
