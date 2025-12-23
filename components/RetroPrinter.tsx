
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
    
    // 模拟打印过程
    setTimeout(() => {
      const newMemo: Memo = {
        id: Date.now(),
        rotation: (Math.random() - 0.5) * 6, // 减小旋转角度使整体更整齐
        color: colors[Math.floor(Math.random() * colors.length)],
        content: (
          <div className="space-y-3 p-5 w-full text-black">
            <div className="border-b-2 border-dashed border-black/30 pb-2 mb-2 text-center font-bold uppercase text-lg tracking-widest">
              VA-11 HALL-A // PROOF
            </div>
            <div className="flex justify-between text-2xl font-black italic">
              <span>{targetRecipe.name}</span>
              <span>$180</span>
            </div>
            <div className="text-sm opacity-80 font-mono">
              MATCH_CONFIDENCE: {calculateAccuracy()}%
            </div>
            <div className="text-base border-t border-black/10 pt-3 italic leading-relaxed">
              “{targetRecipe.description}”
            </div>
            <div className="text-[11px] mt-6 opacity-40 text-center uppercase tracking-[0.3em] font-bold">
              * TRANSACTION_VALIDATED *
            </div>
          </div>
        )
      };
      setMemos(prev => [...prev, newMemo]);
      setIsPrinting(false);
    }, 2500); // 增加打印耗时感
  };

  useEffect(() => {
    handlePrint();
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-end pb-8 overflow-hidden bg-black/60 backdrop-blur-md">
      
      {/* 打印预览裁剪区：确保纸条从槽口匀速“长”出来 */}
      <div className="relative w-full flex flex-col items-center">
        
        {/* 纸条出纸的垂直轨道：高度受限防止超出顶部 */}
        <div className="relative w-80 h-[45vh] flex flex-col items-center justify-end overflow-hidden pointer-events-none mb-[-32px]">
          <AnimatePresence>
            {memos.map((memo, idx) => {
              const isLast = idx === memos.length - 1;
              return (
                <motion.div
                  key={memo.id}
                  // 初始位置在槽口内部，高度为0
                  initial={{ y: 200, height: 0, opacity: 0 }}
                  // 动画：高度展开，向上位移
                  animate={{ 
                    y: - (memos.length - 1 - idx) * 35, // 堆叠位移
                    height: 'auto',
                    opacity: 1, 
                    rotate: memo.rotation 
                  }}
                  transition={{ 
                    duration: 2.5, 
                    ease: "linear", // 线性增加高度模拟打印机吐纸
                  }}
                  className="absolute bottom-0 w-72 receipt-paper shadow-2xl origin-bottom"
                  style={{ 
                    backgroundColor: memo.color, 
                    zIndex: idx,
                  }}
                >
                  {memo.content}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* 红色打印机主体：居中对齐 */}
        <div className="relative z-50 w-full max-w-lg bg-[#e63946] p-8 rounded-t-[50px] shadow-[0_-20px_60px_rgba(0,0,0,0.8)] border-x-8 border-t-8 border-black/20">
          
          {/* 出纸槽口：确保其位置与上方纸条轨道中心对齐 */}
          <div className="w-full h-10 bg-black/90 rounded-full mb-8 relative flex items-center justify-center shadow-[inset_0_4px_15px_rgba(0,0,0,0.9)] border border-white/5">
             <div className="w-[85%] h-1 bg-white/5 rounded-full animate-pulse" />
             {/* 槽口装饰阴影 */}
             <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
          </div>

          {/* 控制面板 */}
          <div className="grid grid-cols-4 gap-6">
             {/* LCD 屏幕 */}
             <div className="col-span-3 h-32 bg-[#9ba781] border-6 border-black/40 rounded-2xl p-4 flex flex-col relative overflow-hidden shadow-[inset_0_6px_12px_rgba(0,0,0,0.5)]">
                <div className="text-[10px] text-black/50 font-black mb-1 uppercase tracking-widest">CALICOMP // TERMINAL</div>
                <div className="flex-1 text-black font-mono text-xl flex items-center justify-center text-center italic font-bold">
                  {isPrinting ? (
                    <motion.div 
                      animate={{ opacity: [1, 0, 1] }} 
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="tracking-tighter"
                    >
                      > PRINTING DATA...
                    </motion.div>
                  ) : `CONFIRM_RATE: ${calculateAccuracy()}%`}
                </div>
                <div className="absolute bottom-2 right-4 text-[9px] text-black/30 font-bold">SERVED_BY_JILL</div>
             </div>

             {/* 实体按钮 */}
             <div className="col-span-1 flex flex-col gap-3">
                <button 
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className={`flex-1 border-4 border-black/30 rounded-2xl font-black text-xs uppercase tracking-tighter transition-all shadow-lg active:translate-y-1 ${isPrinting ? 'bg-black/10 text-black/20' : 'bg-black/20 hover:bg-black/40 text-white active:shadow-inner'}`}
                >
                  PRINT
                </button>
                <button 
                  onClick={onReset}
                  className="flex-1 bg-[#ff007f] hover:bg-[#ff007f]/80 border-4 border-black/30 rounded-2xl text-white font-black text-xs uppercase tracking-tighter shadow-lg active:translate-y-1 active:shadow-inner transition-all"
                >
                  PURGE
                </button>
             </div>
          </div>

          {/* 底部装饰硬件 */}
          <div className="flex justify-center mt-10 gap-16 opacity-30">
             <div className="w-5 h-5 rounded-full bg-black/60 shadow-inner" />
             <div className="w-20 h-4 bg-black/40 rounded-full" />
             <div className="w-5 h-5 rounded-full bg-black/60 shadow-inner" />
          </div>
        </div>
      </div>

      <div className="mt-8 text-[10px] text-white/20 font-black tracking-[2em] uppercase z-50 animate-pulse pointer-events-none">
        Retro Memo Printer // Glitch City
      </div>
    </div>
  );
};

export default RetroPrinter;
