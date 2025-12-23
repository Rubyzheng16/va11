
import React, { useState } from 'react';
import { GameStage, DrinkRecipe, MixState, IngredientType } from './types';
import { generateMoodMenu } from './services/gemini';
import MixingConsole from './components/MixingConsole';
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
      setError("NEURAL_SYNC_FAILED: Signal corruption. Try again.");
      setStage(GameStage.MOOD_INPUT);
    }
  };

  const calculateAccuracy = () => {
    if (!targetRecipe || !finalMix) return 0;
    let score = 0;
    let params = 0;
    (Object.keys(targetRecipe.ingredients) as IngredientType[]).forEach(k => {
      const target = targetRecipe.ingredients[k];
      const actual = finalMix.ingredients[k];
      // Reward exact matches, heavily penalize deviations
      score += Math.max(0, 1 - Math.abs(target - actual) / 5);
      params++;
    });
    if (targetRecipe.iced === finalMix.iced) score += 1;
    if (targetRecipe.aged === finalMix.aged) score += 1;
    return Math.round((score / (params + 2)) * 100);
  };

  return (
    <div className="min-h-screen bg-[#050508] relative font-mono selection:bg-[#ff007f] selection:text-white">
      <AnimatePresence mode="wait">
        
        {stage === GameStage.MOOD_INPUT && (
          <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
            <div className="mb-20 space-y-4">
              <motion.h1 initial={{ letterSpacing: '2.5em', opacity: 0 }} animate={{ letterSpacing: '0.8em', opacity: 1 }} className="text-6xl md:text-8xl font-black text-[#ff007f] uppercase italic flicker drop-shadow-[0_0_25px_#ff007f]">VA-11 MOOD-A</motion.h1>
              <p className="text-[#00f2ff]/30 uppercase tracking-[1.5em] text-[11px] animate-pulse">Neural Sentiment Mapping Interface</p>
            </div>
            
            <div className="w-full max-w-2xl space-y-10">
              <div className="relative pixel-box p-1 group">
                <textarea value={moodInput} onChange={(e) => setMoodInput(e.target.value)} placeholder="LOG_SENTIMENT: Describe your current neural variance..." className="w-full h-56 bg-black border-none p-8 text-2xl text-[#00f2ff] placeholder-[#00f2ff]/5 outline-none resize-none" />
                <div className="absolute top-4 right-6 text-[8px] text-[#222] font-black uppercase tracking-widest">Protocol: READY</div>
              </div>
              <button onClick={handleStartAnalysis} className="w-full py-8 bg-[#00f2ff] text-black font-black uppercase tracking-[1em] hover:scale-[1.02] active:scale-[0.98] transition-all italic shadow-[0_0_50px_rgba(0,242,255,0.3)]">Initiate Psych-Sync</button>
              {error && <p className="text-[#ff007f] text-[11px] uppercase font-black animate-pulse tracking-widest">{error}</p>}
            </div>
          </motion.div>
        )}

        {stage === GameStage.ANALYZING && (
          <motion.div key="analyzing" className="flex flex-col items-center justify-center min-h-screen space-y-12">
            <div className="w-96 h-[3px] bg-[#1a1a1f] relative overflow-hidden">
              <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="absolute inset-0 bg-[#00f2ff] shadow-[0_0_15px_#00f2ff]" />
            </div>
            <div className="text-3xl text-[#ff007f] font-black uppercase italic tracking-[1em] flicker">Decrypting Psyche...</div>
          </motion.div>
        )}

        {stage === GameStage.MENU_SELECT && (
          <motion.div key="menu" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center min-h-screen p-12">
            <h2 className="text-[12px] text-[#ff007f] uppercase tracking-[2em] font-black mb-16 border-b-2 border-[#ff007f]/20 pb-4">Synthesis Compatibility Match</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-7xl">
              {menu.map((drink, i) => (
                <motion.div key={i} whileHover={{ y: -15, borderColor: '#ff007f', boxShadow: '0 30px 60px -15px rgba(255,0,127,0.4)' }} onClick={() => { setTargetRecipe(drink); setStage(GameStage.MIXING); }} className="pixel-box p-12 cursor-pointer group bg-[#0a0a0f] transition-all">
                  <div className="text-[10px] text-[#ff007f] mb-8 font-black uppercase tracking-[0.4em] border-b border-[#1a1a1f] pb-3">Synth_ID_0{i+1}</div>
                  <h3 className="text-4xl font-black text-[#00f2ff] uppercase mb-6 group-hover:text-[#ff007f] transition-colors italic tracking-tighter">{drink.name}</h3>
                  <p className="text-[11px] text-[#00f2ff]/40 uppercase tracking-[0.6em] mb-12">{drink.tagline}</p>
                  <div className="text-sm italic text-[#444] leading-relaxed font-mono line-clamp-5">"{drink.description}"</div>
                  <div className="mt-12 text-[10px] text-[#111] font-black group-hover:text-[#ff007f]/50 transition-colors uppercase tracking-[0.8em]">Start Synthesis</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {stage === GameStage.MIXING && targetRecipe && (
          <motion.div key="mixing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <MixingConsole targetRecipe={targetRecipe} onFinish={(mix) => { setFinalMix(mix); new Audio(DONE_SOUND_URL).play().catch(() => {}); setStage(GameStage.RESULT); }} />
          </motion.div>
        )}

        {stage === GameStage.RESULT && targetRecipe && finalMix && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-screen p-8">
            <div className="max-w-3xl w-full pixel-box p-16 bg-[#0d0d14] relative border-t-[14px] border-[#ff007f] shadow-[0_0_150px_rgba(0,0,0,1)]">
              <div className="absolute top-6 right-10 text-[12px] text-[#1a1a1f] font-black uppercase tracking-widest">Protocol: SERVED_OK</div>
              
              <div className="text-center space-y-16">
                <div className="space-y-6">
                  <div className="text-[13px] font-black uppercase tracking-[1em] text-[#333]">Fidelity Match: <span className="text-[#00f2ff] neon-text">{calculateAccuracy()}%</span></div>
                  <h2 className="text-8xl font-black text-[#ff007f] italic uppercase tracking-tighter flicker neon-pink-text">{targetRecipe.name}</h2>
                </div>
                <p className="text-3xl text-[#00f2ff]/80 italic font-mono leading-relaxed px-16 border-x border-[#1a1a1f]">"{targetRecipe.description}"</p>
                <div className="grid grid-cols-2 gap-16 border-y border-[#1a1a1f] py-12 text-left">
                  <div>
                    <div className="text-[12px] text-[#222] uppercase tracking-[0.5em] font-black">Profile</div>
                    <div className="text-sm text-[#00f2ff] font-mono leading-relaxed">{targetRecipe.flavorProfile}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[12px] text-[#222] uppercase tracking-[0.5em] font-black">Synthesis Mods</div>
                    <div className="flex justify-end gap-4 mt-4">
                      {finalMix.iced && <span className="text-[11px] px-6 py-3 border-2 border-[#00f2ff] text-[#00f2ff] font-black uppercase shadow-[0_0_15px_#00f2ff44]">Cryo</span>}
                      {finalMix.aged && <span className="text-[11px] px-6 py-3 border-2 border-[#ff007f] text-[#ff007f] font-black uppercase shadow-[0_0_15px_#ff007f44]">Aged</span>}
                    </div>
                  </div>
                </div>
                <button onClick={() => setStage(GameStage.MOOD_INPUT)} className="w-full py-12 border-4 border-[#00f2ff] text-[#00f2ff] font-black uppercase tracking-[1.5em] hover:bg-[#00f2ff] hover:text-black transition-all hover:scale-[1.05] italic">Purge Memory</button>
              </div>
            </div>
            <div className="mt-16 text-[11px] text-[#111] uppercase tracking-[2.5em] font-black opacity-30">Time to mix drinks and change lives.</div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default App;
