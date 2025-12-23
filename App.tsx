
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

  // 背景样式定义
  const backgroundStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(rgba(5, 5, 8, 0.4), rgba(5, 5, 8, 0.6)), url('./background.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat'
  };

  return (
    <div 
      className="min-h-screen relative font-mono selection:bg-[#ff007f] selection:text-white overflow-hidden"
      style={backgroundStyle}
    >
      <AnimatePresence mode="wait">
        
        {stage === GameStage.MOOD_INPUT && (
          <motion.div 
            key="input" 
            initial={{ opacity: 0, scale: 1.1 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            className="flex flex-col items-center justify-center min-h-screen p-8 text-center"
          >
            <div className="mb-10 space-y-4">
              <motion.h1 
                initial={{ letterSpacing: '1.5em', opacity: 0 }} 
                animate={{ letterSpacing: '0.4em', opacity: 1 }} 
                className="text-6xl md:text-8xl font-black text-[#ff007f] uppercase italic flicker drop-shadow-[0_0_30px_#ff007f88]"
              >
                VA-11 MOOD-A
              </motion.h1>
              <p className="text-[#00f2ff] uppercase tracking-[0.8em] text-base font-bold opacity-80">告诉我，现在感觉如何？</p>
            </div>
            
            <div className="w-full max-w-lg space-y-8">
              <div className="relative pixel-box p-1 group border-2 border-[#00f2ff]/20 bg-black/60">
                <textarea 
                  value={moodInput} 
                  onChange={(e) => setMoodInput(e.target.value)} 
                  placeholder="请输入您的心境描述..." 
                  className="w-full h-40 bg-transparent border-none p-8 text-2xl text-[#00f2ff] placeholder-[#00f2ff]/10 outline-none resize-none leading-relaxed" 
                />
                <div className="absolute top-3 right-5 text-[10px] text-[#333] font-black uppercase tracking-widest">终端协议：已就绪</div>
              </div>
              <button 
                onClick={handleStartAnalysis} 
                className="w-full py-8 bg-[#00f2ff] text-black font-black uppercase tracking-[1em] hover:scale-[1.02] active:scale-[0.98] transition-all italic text-xl shadow-[0_0_50px_rgba(0,242,255,0.3)]"
              >
                启动情感同步
              </button>
              {error && <p className="text-[#ff007f] text-sm uppercase font-black animate-pulse tracking-widest">{error}</p>}
            </div>
            <div className="mt-12 text-[10px] text-white/10 uppercase tracking-[2em] font-black">GLITCH CITY // VA-11</div>
          </motion.div>
        )}

        {stage === GameStage.ANALYZING && (
          <motion.div key="analyzing" className="flex flex-col items-center justify-center min-h-screen space-y-12">
            <div className="w-72 h-[3px] bg-[#1a1a1f] relative overflow-hidden">
              <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }} className="absolute inset-0 bg-[#00f2ff] shadow-[0_0_15px_#00f2ff]" />
            </div>
            <div className="text-3xl text-[#ff007f] font-black uppercase italic tracking-[0.6em] flicker">正在解构心境...</div>
          </motion.div>
        )}

        {stage === GameStage.MENU_SELECT && (
          <motion.div key="menu" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-screen p-12">
            <h2 className="text-lg text-[#ff007f] uppercase tracking-[1.2em] font-black mb-12 border-b-2 border-[#ff007f]/20 pb-4">情感合成兼容匹配</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
              {menu.map((drink, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -15, borderColor: '#ff007f', boxShadow: '0 30px 60px -10px rgba(255,0,127,0.4)' }} 
                  onClick={() => { setTargetRecipe(drink); setStage(GameStage.MIXING); }} 
                  className="pixel-box p-10 cursor-pointer group bg-[#0a0a0f]/90 transition-all border-2"
                >
                  <div className="text-[10px] text-[#ff007f] mb-8 font-black uppercase tracking-[0.3em] border-b border-[#1a1a1f] pb-3">识别码: 0x0{i+1}</div>
                  <h3 className="text-4xl font-black text-[#00f2ff] uppercase mb-6 group-hover:text-[#ff007f] transition-colors italic tracking-tighter leading-tight">{drink.name}</h3>
                  <p className="text-xs text-[#00f2ff]/40 uppercase tracking-[0.5em] mb-10">“{drink.tagline}”</p>
                  <div className="text-base italic text-[#555] leading-relaxed font-mono line-clamp-3">“{drink.description}”</div>
                  <div className="mt-10 text-[10px] text-[#222] font-black group-hover:text-[#ff007f]/70 transition-colors uppercase tracking-[0.6em]">点击开始调制</div>
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
