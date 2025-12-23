
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DrinkRecipe, MixState, IngredientType } from '../types';
import { ShakerIcon, POUR_SOUND_URL, MIX_SOUND_URL, INGREDIENTS_CONFIG, INGREDIENTS_CHINESE } from '../constants';

interface Props {
  targetRecipe: DrinkRecipe;
  onFinish: (finalMix: MixState) => void;
  onReset?: () => void;
}

const MixingConsole: React.FC<Props> = ({ targetRecipe, onFinish, onReset }) => {
  const [mix, setMix] = useState<MixState>({
    ingredients: { 'Adelhyde': 0, 'Bronson Ext': 0, 'Pwd Delta': 0, 'Flanergide': 0, 'Karmotrine': 0 },
    iced: false,
    aged: false
  });

  const [isShaking, setIsShaking] = useState(false);
  const [log, setLog] = useState<string>('终端状态：系统就绪');

  const playSound = (url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.35;
    audio.play().catch(() => {});
  };

  const handleAddUnit = (type: IngredientType) => {
    const total = (Object.values(mix.ingredients) as number[]).reduce((a, b) => a + b, 0);
    if (total >= 20) {
      setLog('错误：容量已达上限');
      return;
    }
    
    setMix(prev => ({
      ...prev,
      ingredients: { ...prev.ingredients, [type]: Math.min(10, prev.ingredients[type] + 1) }
    }));
    setLog(`加注：${INGREDIENTS_CHINESE[type]}`);
    playSound(POUR_SOUND_URL);
  };

  const handleMix = () => {
    const total = (Object.values(mix.ingredients) as number[]).reduce((a, b) => a + b, 0);
    if (total === 0) {
      setLog('错误：调酒壶为空');
      return;
    }
    setIsShaking(true);
    setLog('合成中：分子键结合...');
    playSound(MIX_SOUND_URL);
    setTimeout(() => {
      setIsShaking(false);
      onFinish(mix);
    }, 2500);
  };

  const totalUnits = (Object.values(mix.ingredients) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/95">
      <div className="w-full max-w-6xl h-[80vh] grid grid-cols-12 gap-6 scale-95">
        
        {/* Left: Recipe Menu (Rectangle) */}
        <div className="col-span-4 pixel-box flex flex-col p-8 bg-[#050508] border-[#1a1a1f] overflow-y-auto">
          <div className="flex justify-between items-start mb-8 border-b border-[#333] pb-6">
             <div>
                <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">{targetRecipe.name}</h2>
                <p className="text-[#ff007f] font-bold text-2xl mt-2">$180</p>
             </div>
             <div className="text-xs text-[#444] font-black uppercase tracking-widest">Recipe_0x{Math.floor(Math.random()*256).toString(16)}</div>
          </div>
          
          <div className="space-y-6 text-base leading-relaxed">
            <p className="text-[#00f2ff]/90">
              {targetRecipe.name}是由
              {Object.entries(targetRecipe.ingredients).map(([name, val], i, arr) => (
                val > 0 && <span key={name}>
                  <span style={{ color: INGREDIENTS_CONFIG[name as IngredientType].color }}>{val} {INGREDIENTS_CHINESE[name as IngredientType]}</span>
                  {i < arr.length - 1 ? '、' : ''}
                </span>
              ))}
              {targetRecipe.iced ? '加冰' : ''}{targetRecipe.aged ? '陈化' : ''}，调和而成。
            </p>
            
            <p className="text-gray-500 italic text-sm">
              (点击“调制”按钮后请等待至摇酒壶开始剧烈晃动。)
            </p>

            <p className="text-white border-l-4 border-[#ff007f] pl-6 py-4 bg-[#ff007f]/5 text-lg">
              “{targetRecipe.description}”
            </p>

            <div className="text-[#00f2ff] font-bold text-xl">
              {targetRecipe.flavorProfile}
            </div>
          </div>

          <div className="mt-auto pt-8 flex justify-between items-center opacity-50">
             <div className="w-10 h-10 flex items-center justify-center border border-[#333] cursor-pointer hover:bg-white/5">◀</div>
             <div className="text-sm">16 / 24</div>
             <div className="w-10 h-10 flex items-center justify-center border border-[#333] cursor-pointer hover:bg-white/5">▶</div>
          </div>
        </div>

        {/* Right: Mixing UI */}
        <div className="col-span-8 grid grid-rows-6 gap-6">
          {/* Status Row */}
          <div className="row-span-1 pixel-box flex items-center justify-between px-8 bg-[#0a0a0f]">
             <div className="text-xs text-[#444] font-black uppercase tracking-widest">BTC Terminal Feed</div>
             <div className="text-xl text-[#00f2ff] font-mono flicker tracking-tighter">{log}</div>
          </div>

          {/* Controls Area (Ingredients + Shaker) */}
          <div className="row-span-4 grid grid-cols-2 gap-6">
            
            {/* Ingredients Grid (6 slots) */}
            <div className="grid grid-cols-2 grid-rows-3 gap-3 p-3 bg-[#050508] pixel-box border-[#1a1a1f]">
              {(['Adelhyde', 'Bronson Ext', 'Pwd Delta', 'Flanergide', 'Karmotrine'] as IngredientType[]).map(type => (
                <div 
                  key={type} 
                  onClick={() => handleAddUnit(type)}
                  className="relative group cursor-pointer flex flex-col items-center justify-center border-2 border-[#1a1a1f] transition-all p-3 bg-[#08080c] overflow-hidden"
                  style={{ borderColor: mix.ingredients[type] > 0 ? INGREDIENTS_CONFIG[type].color + '44' : '#1a1a1f' }}
                >
                  {/* Subtle Background Glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" style={{ backgroundColor: INGREDIENTS_CONFIG[type].color }} />
                  
                  <div className="w-10 h-16 relative flex flex-col justify-end overflow-hidden mb-2">
                    <div className="absolute inset-0 border border-white/10"></div>
                    <div 
                      className="w-full transition-all duration-300" 
                      style={{ 
                        height: `${(mix.ingredients[type]/10)*100}%`, 
                        backgroundColor: INGREDIENTS_CONFIG[type].color,
                        boxShadow: `0 0 15px ${INGREDIENTS_CONFIG[type].color}aa`
                      }} 
                    />
                  </div>
                  <div className="text-xs font-black uppercase truncate w-full text-center mb-1 group-hover:scale-110 transition-transform" style={{ color: mix.ingredients[type] > 0 ? INGREDIENTS_CONFIG[type].color : '#555' }}>
                    {INGREDIENTS_CHINESE[type]}
                  </div>
                  <div className="flex gap-1">
                    {Array.from({length: 5}).map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${mix.ingredients[type] > i ? '' : 'bg-[#1a1a1f]'}`} style={{ backgroundColor: mix.ingredients[type] > i ? INGREDIENTS_CONFIG[type].color : '' }} />
                    ))}
                  </div>
                </div>
              ))}
              <div className="border-2 border-[#1a1a1f] opacity-20 flex flex-col items-center justify-center text-[10px] font-black bg-[#08080c]">
                <div className="w-10 h-16 border border-white/5 mb-2 bg-black/40" />
                INV_EMPTY
              </div>
            </div>

            {/* Shaker Area */}
            <div className="pixel-box relative flex items-center justify-center bg-[#08080c] overflow-hidden">
               <motion.div 
                animate={isShaking ? { x: [-12, 12], y: [-6, 6], rotate: [-4, 4] } : {}}
                transition={{ repeat: Infinity, duration: 0.1, ease: "linear" }}
                className="w-56 h-80 relative z-20"
              >
                <div className="w-full h-full text-white/5">
                  <ShakerIcon />
                </div>
                {/* Internal Liquid Visualization */}
                <div className="absolute inset-x-[50px] bottom-[30px] top-[30px] flex flex-col-reverse overflow-hidden rounded-b-2xl">
                  {(Object.entries(mix.ingredients) as [IngredientType, number][]).map(([type, count]) => (
                    <div 
                      key={type}
                      style={{ height: `${count * 5}%`, backgroundColor: INGREDIENTS_CONFIG[type as IngredientType].color }}
                      className="w-full transition-all duration-700 shadow-[inset_0_0_30px_rgba(0,0,0,0.6)] border-t border-white/10"
                    />
                  ))}
                </div>
              </motion.div>
              
              {/* Load Meter */}
              <div className="absolute bottom-6 right-8 text-right">
                <div className="text-xs text-[#444] font-black tracking-widest mb-1">LOAD_LEVEL</div>
                <div className={`text-6xl font-mono font-black italic ${totalUnits > 20 ? 'text-red-600 flicker' : 'text-[#00f2ff]'}`}>
                  {totalUnits.toString().padStart(2, '0')}<span className="text-xl opacity-20">/20</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="row-span-1 grid grid-cols-4 gap-4">
            <button 
              onClick={() => { setMix(p => ({...p, iced: !p.iced})); setLog(mix.iced ? '取消：加冰' : '设定：加冰'); }}
              className={`pixel-box border-4 font-black text-sm uppercase tracking-widest transition-all ${mix.iced ? 'border-[#00f2ff] text-[#00f2ff] bg-[#00f2ff]/10 shadow-[0_0_20px_#00f2ff33]' : 'border-[#1a1a1f] text-gray-700'}`}
            >
              [ 加冰 ]
            </button>
            <button 
              onClick={() => { setMix(p => ({...p, aged: !p.aged})); setLog(mix.aged ? '取消：陈化' : '设定：陈化'); }}
              className={`pixel-box border-4 font-black text-sm uppercase tracking-widest transition-all ${mix.aged ? 'border-[#ff007f] text-[#ff007f] bg-[#ff007f]/10 shadow-[0_0_20px_#ff007f33]' : 'border-[#1a1a1f] text-gray-700'}`}
            >
              [ 陈化 ]
            </button>
            <button 
              onClick={() => { 
                setMix({ ingredients: { 'Adelhyde': 0, 'Bronson Ext': 0, 'Pwd Delta': 0, 'Flanergide': 0, 'Karmotrine': 0 }, iced: false, aged: false }); 
                setLog('系统：重置中');
              }}
              className="pixel-box border-4 border-[#ff9500]/50 text-[#ff9500] bg-[#ff9500]/5 font-black text-sm uppercase tracking-widest hover:bg-[#ff9500]/20 transition-all"
            >
              重做
            </button>
            <button 
              onClick={handleMix}
              disabled={isShaking || totalUnits === 0}
              className="pixel-box bg-[#ff007f] text-white font-black text-2xl uppercase tracking-widest shadow-[0_0_40px_#ff007f66] hover:scale-105 active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all flicker"
            >
              调制
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MixingConsole;
