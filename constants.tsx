
import React from 'react';
import { IngredientType } from './types';

export const INGREDIENTS_CONFIG: Record<IngredientType, { color: string; label: string }> = {
  'Adelhyde': { color: '#ff2d55', label: 'Adelhyde' },
  'Bronson Ext': { color: '#ff9500', label: 'Bronson Ext' },
  'Pwd Delta': { color: '#007aff', label: 'Pwd Delta' },
  'Flanergide': { color: '#4cd964', label: 'Flanergide' },
  'Karmotrine': { color: '#ffffff', label: 'Karmotrine' }
};

export const POUR_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3';
export const MIX_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';
export const DONE_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3';

export const ShakerIcon = () => (
  <svg viewBox="0 0 100 160" className="w-full h-full drop-shadow-[0_0_15px_rgba(0,242,255,0.3)]">
    <defs>
      <linearGradient id="shakerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#1a1a1f', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#050508', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Lid */}
    <rect x="35" y="5" width="30" height="15" fill="#222" stroke="currentColor" strokeWidth="2" rx="2" />
    {/* Neck */}
    <path d="M30 20 L70 20 L75 35 L25 35 Z" fill="#111" stroke="currentColor" strokeWidth="2" />
    {/* Body */}
    <path d="M25 35 L75 35 L85 140 C85 150, 15 150, 15 140 Z" fill="url(#shakerGrad)" stroke="currentColor" strokeWidth="2" />
    {/* Glass texture */}
    <path d="M30 40 Q50 45 70 40" stroke="currentColor" strokeWidth="1" opacity="0.2" fill="none" />
    <path d="M25 100 Q50 105 75 100" stroke="currentColor" strokeWidth="1" opacity="0.1" fill="none" />
  </svg>
);
