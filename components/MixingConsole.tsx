
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DrinkRecipe, MixState, IngredientType } from '../types';
import DraggableBottle from './DraggableBottle';
import { ShakerIcon, POUR_SOUND_URL, MIX_SOUND_URL, INGREDIENTS_CONFIG } from '../constants';

interface Props {
  targetRecipe: DrinkRecipe;
  onFinish: (finalMix: MixState) => void;
}

const MixingConsole: React.FC<Props> = ({ targetRecipe, onFinish }) => {
  const [mix, setMix] = useState<MixState>({
    ingredients: { 'Adelhyde': 0, 'Bronson Ext': 0, 'Pwd Delta': 0, 'Flanergide': 0, 'Karmotrine': 0 },
    iced: false,
    aged: false
  });

  const [isShaking, setIsShaking] = useState(false);
  const [log, setLog] = useState<string>('BTC_IDLE_SYSTEM_READY');
  const [showHint, setShowHint] = useState(true);

  const playSound = (url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.35;
    audio.play().catch(() => {});
  };

  const handleAddUnit = (type: IngredientType) => {
    const total = Object.values(mix.ingredients).reduce((a, b) => a + b, 0);
    if (total >= 20) {
      setLog('ERR_OVERFLOW_CAPACITY_LIMIT');
      return;
    }
    
    setMix(prev => ({
      ...prev,
      ingredients: { ...prev.ingredients, [type]: Math.min(10, prev.ingredients[type] + 1) }
    }));
    setLog(`SEQ_LOAD: ${type.toUpperCase()}`);
    playSound(POUR_SOUND_URL);
    setShowHint(false);
  };

  const handleMix = () => {
    const total = Object.values(mix.ingredients).reduce((a, b) => a + b, 0);
    if (total === 0) {
      setLog('ERR_CHAMBER_EMPTY');
      return;
    }
    setIsShaking(true);
    setLog('SYNTH_PROC: MOLECULAR_BONDING...');
    playSound(MIX_SOUND_URL);
    setTimeout(() => {
      setIsShaking(false);
      onFinish(mix);
    }, 2800);
  };

  const totalUnits = Object.values(mix.ingredients).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#050508] p-4 font-mono overflow-hidden">
      <div className="w-full h-full max-w-7xl max-h-[92vh] grid grid-cols-12 gap-6 p-6 border border-[#1a1a1f] bg-black/40 backdrop-blur-md relative z-10">
        
        {/* Rack Alpha (Left) */}
        <div className="col-span-2 flex flex-col justify-around py-8 bg-[#0a0a0f] border-x border-[#1a1a1f] relative">
          <div className="absolute top-2 left-2 text-[8px] text-[#333] font-black tracking-widest uppercase">Inv_Rack_A</div>
          {(['Adelhyde', 'Bronson Ext', 'Pwd Delta'] as IngredientType[]).map(type => (
            <DraggableBottle key={type} type={type} onDrop={() => handleAddUnit(type)} />
          ))}
        </div>

        {/* Central Workstation */}
        <div className="col-span-8 flex flex-col gap-6">
          {/* Order Header */}
          <div className="h-28 pixel-box flex items-center justify-between px-10 bg-[#0d0d14] border-b-2 border-b-[#1a1a1f]">
            <div className="max-w-[65%]">
              <div className="text-[10px] text-[#ff007f] font-black uppercase tracking-[0.4em] flicker mb-1">Target Analysis</div>
              <h2 className="text-4xl font-black text-[#00f2ff] uppercase italic tracking-tighter neon-text truncate">{targetRecipe.name}</h2>
              <div className="text-[10px] text-[#444] italic opacity-60 truncate">"{targetRecipe.tagline}"</div>
            </div>
            <div className="text-right pl-10 border-l border-[#1a1a1f] h-full flex flex-col justify-center">
              <div className="text-[9px] text-[#444] uppercase mb-1 font-black tracking-widest">BTC Terminal Feed</div>
              <div className="text-xs text-[#00f2ff] h-4 uppercase font-mono flicker leading-tight">{log}</div>
            </div>
          </div>

          {/* Synthesis Chamber */}
          <div className="flex-1 pixel-box relative flex items-center justify-center bg-[#08080c] overflow-hidden group">
            <AnimatePresence>
              {showHint && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute top-12 text-[10px] text-[#ff007f] font-black tracking-[0.6em] animate-pulse z-30">
                  [ DEPLOY UNITS TO CHAMBER ]
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              animate={isShaking ? { x: [-12, 12], y: [0, -6, 6], rotate: [-4, 4] } : {}}
              transition={{ repeat: Infinity, duration: 0.1, ease: "linear" }}
              className="w-56 h-80 relative z-20"
            >
              <div className="w-full h-full text-cyan-500/10">
                <ShakerIcon />
              </div>
              
              <div className="absolute inset-x-[48px] bottom-[28px] top-[26px] flex flex-col-reverse overflow-hidden rounded-b-2xl">
                {Object.entries(mix.ingredients).map(([type, count]) => (
                  <div 
                    key={type}
                    style={{ height: `${count * 5}%`, backgroundColor: INGREDIENTS_CONFIG[type as IngredientType].color }}
                    className="w-full transition-all duration-700 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] border-t border-white/5"
                  />
                ))}
              </div>
            </motion.div>

            {/* Sidebar Recipe HUD */}
            <div className="absolute left-8 top-8 w-48 p-5 border border-[#1a1a1f] bg-black/90 z-30 shadow-2xl">
              <div className="text-[10px] text-[#444] mb-4 uppercase tracking-[0.2em] border-b border-[#1a1a1f] pb-2 font-black">Recipe Data</div>
              <div className="space-y-3">
                {Object.entries(targetRecipe.ingredients).map(([name, val]) => (
                  <div key={name} className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-[#00f2ff]/30 uppercase text-[9px]">{name}</span>
                    <span className={mix.ingredients[name as IngredientType] === val ? 'text-[#00f2ff] font-bold' : 'text-[#ff007f]'}>
                      {mix.ingredients[name as IngredientType]}<span className="opacity-10 mx-1">/</span>{val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Environment Modifiers */}
            <div className="absolute bottom-8 left-8 flex gap-4 z-30">
              <button 
                onClick={() => { setMix(p => ({...p, iced: !p.iced})); setLog(mix.iced ? 'UNSET_ENV: CRYO' : 'SET_ENV: CRYO'); }} 
                className={`px-6 py-3 border-2 text-[10px] font-black transition-all ${mix.iced ? 'border-[#00f2ff] text-[#00f2ff] bg-[#00f2ff]/10 shadow-[0_0_15px_#00f2ff44]' : 'border-[#1a1a1f] text-[#333]'}`}
              >
                [ ICED ]
              </button>
              <button 
                onClick={() => { setMix(p => ({...p, aged: !p.aged})); setLog(mix.aged ? 'UNSET_ENV: CHRONO' : 'SET_ENV: CHRONO'); }} 
                className={`px-6 py-3 border-2 text-[10px] font-black transition-all ${mix.aged ? 'border-[#ff007f] text-[#ff007f] bg-[#ff007f]/10 shadow-[0_0_15px_#ff007f44]' : 'border-[#1a1a1f] text-[#333]'}`}
              >
                [ AGED ]
              </button>
            </div>

            {/* Volume Status */}
            <div className="absolute bottom-8 right-8 text-right z-30">
              <div className="text-[10px] text-[#444] mb-1 font-black uppercase tracking-widest">Load_Level</div>
              <div className={`text-6xl font-mono font-black italic tracking-tighter transition-colors ${totalUnits > 20 ? 'text-red-600 flicker' : 'text-[#00f2ff]'}`}>
                {totalUnits.toString().padStart(2, '0')}<span className="text-xl opacity-20 ml-1">/20</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="h-24 flex gap-4">
            <button 
              onClick={() => { setMix({ ingredients: { 'Adelhyde': 0, 'Bronson Ext': 0, 'Pwd Delta': 0, 'Flanergide': 0, 'Karmotrine': 0 }, iced: false, aged: false }); setLog('SYS_FLUSH: CHAMBER_CLEAR'); }} 
              className="w-1/4 pixel-box text-red-500/50 hover:text-red-500 text-[11px] font-black uppercase tracking-widest"
            >
              Flush
            </button>
            <button 
              onClick={handleMix} 
              disabled={isShaking}
              className="flex-1 bg-[#ff007f] text-white font-black text-2xl uppercase tracking-[0.5em] shadow-[0_0_40px_rgba(255,0,127,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all flicker italic"
            >
              {isShaking ? 'SHAKING...' : 'Mix & Serve'}
            </button>
          </div>
        </div>

        {/* Rack Beta (Right) */}
        <div className="col-span-2 flex flex-col justify-center gap-24 py-8 bg-[#0a0a0f] border-x border-[#1a1a1f] relative">
          <div className="absolute top-2 right-2 text-[8px] text-[#333] font-black tracking-widest uppercase text-right">Inv_Rack_B</div>
          {(['Flanergide', 'Karmotrine'] as IngredientType[]).map(type => (
            <DraggableBottle key={type} type={type} onDrop={() => handleAddUnit(type)} />
          ))}
          <div className="mt-auto text-center opacity-10 text-[8px] font-mono leading-relaxed">
            GLITCH_CITY_BTC<br/>v3.1_LITE
          </div>
        </div>
      </div>
    </div>
  );
};

export default MixingConsole;
