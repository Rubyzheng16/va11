
import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
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

  const [shakingStage, setShakingStage] = useState<'none' | 'soft' | 'violent'>('none');
  const [log, setLog] = useState<string>('终端状态：系统就绪');

  const playSound = (url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.35;
    audio.play().catch(() => {});
  };

  const handleAddUnit = (type: IngredientType) => {
    if (shakingStage !== 'none') return;
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

    setShakingStage('soft');
    setLog('初始化：分子键共振中...');
    playSound(MIX_SOUND_URL);

    // 5秒后进入剧烈阶段
    setTimeout(() => {
      setShakingStage('violent');
      setLog('警告：核心反应加速中！');
      // 剧烈阶段持续 3 秒
      setTimeout(() => {
        setShakingStage('none');
        onFinish(mix);
      }, 3000);
    }, 5000);
  };

  const totalUnits = (Object.values(mix.ingredients) as number[]).reduce((a, b) => a + b, 0);

  // Fix: Explicitly type shakerVariants as Variants and cast ease as const to satisfy Framer Motion types
  const shakerVariants: Variants = {
    none: { x: 0, y: 0, rotate: 0 },
    soft: { 
      x: [-1, 1, -1], 
      y: [-1, 1, -1],
      transition: { repeat: Infinity, duration: 0.1 }
    },
    violent: { 
      x: [-15, 15, -12, 12, -15], 
      y: [-10, 10, -5, 5, -10],
      rotate: [-8, 8, -5, 5, -8],
      transition: { repeat: Infinity, duration: 0.08, ease: "linear" as const }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-6xl h-[85vh] grid grid-cols-12 gap-6 scale-95">
        
        {/* Left: Recipe Menu */}
        <div className="col-span-4 pixel-box flex flex-col p-8 bg-black/80 border-[#1a1a1f] overflow-y-auto">
          <div className="flex justify-between items-start mb-8 border-b border-[#333] pb-6">
             <div>
                <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">{targetRecipe.name}</h2>
                <p className="text-[#ff007f] font-bold text-2xl mt-2">$180</p>
             </div>
             <div className="text-xs text-[#444] font-black uppercase tracking-widest font-mono">CODE_{Math.floor(Math.random()*9999)}</div>
          </div>
          
          <div className="space-y-6 text-base leading-relaxed">
            <p className="text-[#00f2ff]/90 font-mono">
              需使用
              {Object.entries(targetRecipe.ingredients).map(([name, val], i, arr) => (
                val > 0 && <span key={name}>
                  <span style={{ color: INGREDIENTS_CONFIG[name as IngredientType].color }}> {val}u {INGREDIENTS_CHINESE[name as IngredientType]}</span>
                  {i < arr.length - 1 ? '、' : ''}
                </span>
              ))}
              {targetRecipe.iced ? ' [加冰]' : ''}{targetRecipe.aged ? ' [陈化]' : ''} 合成。
            </p>

            <p className="text-white border-l-4 border-[#ff007f] pl-6 py-4 bg-[#ff007f]/5 text-lg italic">
              “{targetRecipe.description}”
            </p>

            <div className="text-[#00f2ff] font-bold text-xl uppercase tracking-tighter">
              口感：{targetRecipe.flavorProfile}
            </div>
          </div>

          <div className="mt-auto pt-8 flex justify-between items-center opacity-30">
             <div className="text-[10px] font-mono">BTC CALIBRATION // VA-11</div>
          </div>
        </div>

        {/* Right: Mixing UI */}
        <div className="col-span-8 grid grid-rows-6 gap-6">
          {/* Status Row */}
          <div className="row-span-1 pixel-box flex items-center justify-between px-8 bg-black/80 overflow-hidden">
             <div className="text-xs text-[#444] font-black uppercase tracking-widest font-mono">System_Monitor</div>
             <div className={`text-xl font-mono tracking-tighter ${shakingStage === 'violent' ? 'text-red-500 animate-pulse' : 'text-[#00f2ff] flicker'}`}>
                {log}
             </div>
          </div>

          {/* Controls Area */}
          <div className="row-span-4 grid grid-cols-2 gap-6">
            
            <div className="grid grid-cols-2 grid-rows-3 gap-3 p-3 bg-black/40 pixel-box border-[#1a1a1f]">
              {(['Adelhyde', 'Bronson Ext', 'Pwd Delta', 'Flanergide', 'Karmotrine'] as IngredientType[]).map(type => (
                <div 
                  key={type} 
                  onClick={() => handleAddUnit(type)}
                  className={`relative group cursor-pointer flex flex-col items-center justify-center border-2 border-[#1a1a1f] transition-all p-3 bg-black/60 overflow-hidden ${shakingStage !== 'none' ? 'opacity-20 cursor-not-allowed' : ''}`}
                  style={{ borderColor: mix.ingredients[type] > 0 ? INGREDIENTS_CONFIG[type].color + '66' : '#1a1a1f' }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" style={{ backgroundColor: INGREDIENTS_CONFIG[type].color }} />
                  
                  <div className="w-8 h-12 relative flex flex-col justify-end overflow-hidden mb-2 border border-white/5">
                    <div 
                      className="w-full transition-all duration-300" 
                      style={{ 
                        height: `${(mix.ingredients[type]/10)*100}%`, 
                        backgroundColor: INGREDIENTS_CONFIG[type].color,
                        boxShadow: `0 0 10px ${INGREDIENTS_CONFIG[type].color}88`
                      }} 
                    />
                  </div>
                  <div className="text-[10px] font-black uppercase truncate w-full text-center mb-1" style={{ color: mix.ingredients[type] > 0 ? INGREDIENTS_CONFIG[type].color : '#555' }}>
                    {INGREDIENTS_CHINESE[type]}
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({length: 5}).map((_, i) => (
                      <div key={i} className={`w-1 h-1 rounded-full ${mix.ingredients[type] > i ? '' : 'bg-[#1a1a1f]'}`} style={{ backgroundColor: mix.ingredients[type] > i ? INGREDIENTS_CONFIG[type].color : '' }} />
                    ))}
                  </div>
                </div>
              ))}
              <div className="border-2 border-[#1a1a1f] opacity-10 flex flex-col items-center justify-center text-[8px] font-black bg-black/40">
                LOCKED_MODULE
              </div>
            </div>

            <div className="pixel-box relative flex items-center justify-center bg-black/40 overflow-hidden">
               <motion.div 
                animate={shakingStage}
                variants={shakerVariants}
                className="w-48 h-72 relative z-20"
              >
                <div className={`w-full h-full transition-all ${shakingStage === 'violent' ? 'text-[#ff007f]' : 'text-white/5'}`}>
                  <ShakerIcon />
                </div>
                <div className="absolute inset-x-[45px] bottom-[28px] top-[28px] flex flex-col-reverse overflow-hidden rounded-b-xl shadow-[0_0_50px_rgba(255,0,127,0.1)]">
                  {(Object.entries(mix.ingredients) as [IngredientType, number][]).map(([type, count]) => (
                    <div 
                      key={type}
                      style={{ height: `${count * 5}%`, backgroundColor: INGREDIENTS_CONFIG[type as IngredientType].color }}
                      className="w-full transition-all duration-500 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] border-t border-white/10"
                    />
                  ))}
                </div>
              </motion.div>
              
              <div className="absolute bottom-4 right-6 text-right">
                <div className="text-[10px] text-[#444] font-black tracking-widest mb-1">TOTAL_UNITS</div>
                <div className={`text-5xl font-mono font-black italic ${totalUnits > 20 ? 'text-red-600 flicker' : 'text-[#00f2ff]'}`}>
                  {totalUnits.toString().padStart(2, '0')}
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="row-span-1 grid grid-cols-4 gap-4">
            <button 
              disabled={shakingStage !== 'none'}
              onClick={() => { setMix(p => ({...p, iced: !p.iced})); setLog(mix.iced ? '已取消：冰镇' : '已设定：冰镇'); }}
              className={`pixel-box border-2 font-black text-xs uppercase tracking-widest transition-all ${mix.iced ? 'border-[#00f2ff] text-[#00f2ff] bg-[#00f2ff]/20' : 'border-[#1a1a1f] text-gray-700'}`}
            >
              [ Iced ]
            </button>
            <button 
              disabled={shakingStage !== 'none'}
              onClick={() => { setMix(p => ({...p, aged: !p.aged})); setLog(mix.aged ? '已取消：陈年' : '已设定：陈年'); }}
              className={`pixel-box border-2 font-black text-xs uppercase tracking-widest transition-all ${mix.aged ? 'border-[#ff007f] text-[#ff007f] bg-[#ff007f]/20' : 'border-[#1a1a1f] text-gray-700'}`}
            >
              [ Aged ]
            </button>
            <button 
              disabled={shakingStage !== 'none'}
              onClick={() => setMix({ ingredients: { 'Adelhyde': 0, 'Bronson Ext': 0, 'Pwd Delta': 0, 'Flanergide': 0, 'Karmotrine': 0 }, iced: false, aged: false })}
              className="pixel-box border-2 border-orange-500/30 text-orange-500 font-black text-xs uppercase tracking-widest hover:bg-orange-500/10"
            >
              Reset
            </button>
            <button 
              onClick={handleMix}
              disabled={shakingStage !== 'none' || totalUnits === 0}
              className={`pixel-box bg-[#ff007f] text-white font-black text-xl uppercase tracking-widest shadow-[0_0_30px_#ff007f66] hover:brightness-110 active:scale-95 disabled:opacity-30 transition-all ${shakingStage !== 'none' ? 'animate-pulse' : ''}`}
            >
              {shakingStage === 'none' ? 'Mix' : 'Mixing...'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MixingConsole;
