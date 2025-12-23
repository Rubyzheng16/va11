
import React, { useState } from 'react';
import { GameStage, DrinkRecipe, MixState, IngredientType } from './types';
import { generateMoodMenu } from './services/gemini';
import MixingConsole from './components/MixingConsole';
import RetroPrinter from './components/RetroPrinter';
import { DONE_SOUND_URL } from './constants';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [stage, setStage] = useState<GameStage>(GameStage.MOOD_INPUT);
  const [moodInput, setMoodInput] = useState('');
  const [menu, setMenu] = useState<DrinkRecipe[]>([]);
  const [targetRecipe, setTargetRecipe] = useState<DrinkRecipe | null>(null);
  const [finalMix, setFinalMix] = useState<MixState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartAnalysis = async () => {
    if (!moodInput.trim()) return;
    setStage(GameStage.ANALYZING);
    try {
      const generatedMenu = await generateMoodMenu(moodInput);
      setMenu(generatedMenu);
      setStage(GameStage.MENU_SELECT);
    } catch (err) {
      setError("同步失败：信号干扰。请重试。");
      setStage(GameStage.MOOD_INPUT);
    }
  };

  const resetAll = () => {
    setStage(GameStage.MOOD_INPUT);
    setMoodInput('');
    setMenu([]);
    setTargetRecipe(null);
    setFinalMix(null);
  };

  return (
    <div className="min-h-screen bg-[#050508] relative font-mono selection:bg-[#ff007f] selection:text-white">
      <AnimatePresence mode="wait">
        
        {stage === GameStage.MOOD_INPUT && (
          <motion.div 
            key="input" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="flex flex-col items-center justify-center min-h-screen p-8 text-center"
          >
            <div className="mb-12 space-y-6">
              <motion.h1 
                initial={{ letterSpacing: '2em', opacity: 0 }} 
                animate={{ letterSpacing: '0.6em', opacity: 1 }} 
                className="text-7xl md:text-9xl font-black text-[#ff007f] uppercase italic flicker drop-shadow-[0_0_40px_#ff007f]"
              >
                VA-11 MOOD-A
              </motion.h1>
              <p className="text-[#00f2ff] uppercase tracking-[1em] text-lg font-bold">告诉我，现在感觉如何？</p>
            </div>
            
            <div className="w-full max-w-xl space-y-12">
              <div className="relative pixel-box p-1 group border-2 border-[#00f2ff]/20">
                <textarea 
                  value={moodInput} 
                  onChange={(e) => setMoodInput(e.target.value)} 
                  placeholder="请输入您的心境描述..." 
                  className="w-full h-48 bg-black/60 border-none p-10 text-3xl text-[#00f2ff] placeholder-[#00f2ff]/10 outline-none resize-none" 
                />
                <div className="absolute top-4 right-6 text-xs text-[#222] font-black uppercase tracking-widest">终端协议：已就绪</div>
              </div>
              <button 
                onClick={handleStartAnalysis} 
                className="w-full py-10 bg-[#00f2ff] text-black font-black uppercase tracking-[1.2em] hover:scale-[1.03] active:scale-[0.97] transition-all italic text-2xl shadow-[0_0_60px_rgba(0,242,255,0.4)]"
              >
                启动情感同步
              </button>
              {error && <p className="text-[#ff007f] text-sm uppercase font-black animate-pulse tracking-widest">{error}</p>}
            </div>
          </motion.div>
        )}

        {stage === GameStage.ANALYZING && (
          <motion.div key="analyzing" className="flex flex-col items-center justify-center min-h-screen space-y-12">
            <div className="w-96 h-[4px] bg-[#1a1a1f] relative overflow-hidden">
              <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="absolute inset-0 bg-[#00f2ff] shadow-[0_0_20px_#00f2ff]" />
            </div>
            <div className="text-4xl text-[#ff007f] font-black uppercase italic tracking-[0.8em] flicker">正在解构心境...</div>
          </motion.div>
        )}

        {stage === GameStage.MENU_SELECT && (
          <motion.div key="menu" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-screen p-12">
            <h2 className="text-xl text-[#ff007f] uppercase tracking-[1.5em] font-black mb-16 border-b-2 border-[#ff007f]/20 pb-6">情感合成兼容匹配</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-7xl">
              {menu.map((drink, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -20, borderColor: '#ff007f', boxShadow: '0 40px 80px -15px rgba(255,0,127,0.5)' }} 
                  onClick={() => { setTargetRecipe(drink); setStage(GameStage.MIXING); }} 
                  className="pixel-box p-14 cursor-pointer group bg-[#0a0a0f] transition-all border-2"
                >
                  <div className="text-xs text-[#ff007f] mb-10 font-black uppercase tracking-[0.4em] border-b border-[#1a1a1f] pb-4">识别码: 0x0{i+1}</div>
                  <h3 className="text-5xl font-black text-[#00f2ff] uppercase mb-8 group-hover:text-[#ff007f] transition-colors italic tracking-tighter leading-tight">{drink.name}</h3>
                  <p className="text-sm text-[#00f2ff]/40 uppercase tracking-[0.6em] mb-14">“{drink.tagline}”</p>
                  <div className="text-lg italic text-[#555] leading-relaxed font-mono line-clamp-4">“{drink.description}”</div>
                  <div className="mt-14 text-xs text-[#222] font-black group-hover:text-[#ff007f]/70 transition-colors uppercase tracking-[0.8em]">点击开始调制</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {stage === GameStage.MIXING && targetRecipe && (
          <motion.div key="mixing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <MixingConsole 
              targetRecipe={targetRecipe} 
              onFinish={(mix) => { setFinalMix(mix); new Audio(DONE_SOUND_URL).play().catch(() => {}); setStage(GameStage.RESULT); }} 
            />
          </motion.div>
        )}

        {stage === GameStage.RESULT && targetRecipe && finalMix && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <RetroPrinter 
              targetRecipe={targetRecipe}
              finalMix={finalMix}
              onReset={resetAll}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default App;
