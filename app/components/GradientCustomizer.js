"use client"

import React, { useState } from 'react';

const GradientCustomizer = ({ gradientColors, isReadOnly = false, userId, onGradientChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [localGradient, setLocalGradient] = useState(gradientColors);

  const presetGradients = [
    {
      name: 'Ocean Blue',
      primary: '#1a1a2e',
      secondary: '#16213e',
      accent: '#39FF14'
    },
    {
      name: 'Sunset Orange',
      primary: '#2d1b69',
      secondary: '#11998e',
      accent: '#ff6b6b'
    },
    {
      name: 'Purple Dream',
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#f093fb'
    },
    {
      name: 'Forest Green',
      primary: '#134e5e',
      secondary: '#71b280',
      accent: '#95e1d3'
    },
    {
      name: 'Midnight Black',
      primary: '#0c0c0c',
      secondary: '#1a1a1a',
      accent: '#39FF14'
    },
    {
      name: 'Rose Gold',
      primary: '#f2709c',
      secondary: '#ff9472',
      accent: '#ffd700'
    },
    {
      name: 'Arctic Blue',
      primary: '#2196f3',
      secondary: '#21cbf3',
      accent: '#ffffff'
    }
  ];

  const handleToggle = (e) => {
    if (!isOpen) {
      const rect = e.currentTarget.getBoundingClientRect();
      setButtonPosition({
        top: rect.bottom + 8,
        left: rect.right - 320 // 320px is popup width
      });
    }
    setIsOpen(!isOpen);
  };

  const handlePresetClick = (preset) => {
    if (!isReadOnly) {
      const newGradient = {
        primary: preset.primary,
        secondary: preset.secondary,
        accent: preset.accent
      };
      setLocalGradient(newGradient);
      
      // Call parent callback to update the page gradient temporarily
      if (onGradientChange) {
        onGradientChange(newGradient);
      }
    }
  };

  const handleReset = () => {
    if (!isReadOnly) {
      setLocalGradient(gradientColors);
      if (onGradientChange) {
        onGradientChange(gradientColors);
      }
    }
  };

  const currentGradient = localGradient;

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={handleToggle}
        className="glass-effect p-3 rounded-full text-white hover:text-[#39FF14] transition-all duration-300 hover:scale-110"
        title={isReadOnly ? "View Theme" : "Customize Gradient"}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="popup-overlay"
            onClick={() => setIsOpen(false)}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.1)'
            }}
          />
          
          {/* Panel */}
          <div 
            className="popup-panel w-80 glass-effect-darker backdrop-blur-xl border border-white/20 rounded-2xl p-6"
            style={{
              top: `${buttonPosition.top}px`,
              left: `${buttonPosition.left}px`
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg font-[var(--font-space-grotesk)]">
                {isReadOnly ? 'Current Theme' : 'Theme Preview'}
              </h3>
              {!isReadOnly && (
                <button
                  onClick={handleReset}
                  className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded transition-colors duration-200"
                  title="Reset to original"
                >
                  Reset
                </button>
              )}
            </div>
            
            {/* Current Colors Display */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Primary Color</label>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-8 rounded border-2 border-white/20"
                    style={{ backgroundColor: currentGradient.primary }}
                  />
                  <span className="text-white text-sm font-mono">{currentGradient.primary}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-2">Secondary Color</label>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-8 rounded border-2 border-white/20"
                    style={{ backgroundColor: currentGradient.secondary }}
                  />
                  <span className="text-white text-sm font-mono">{currentGradient.secondary}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-2">Accent Color</label>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-8 rounded border-2 border-white/20"
                    style={{ backgroundColor: currentGradient.accent }}
                  />
                  <span className="text-white text-sm font-mono">{currentGradient.accent}</span>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="mb-6">
              <label className="block text-gray-300 text-sm mb-2">Preview</label>
              <div 
                className="w-full h-16 rounded-lg border-2 border-white/20"
                style={{
                  background: `linear-gradient(135deg, ${currentGradient.primary} 0%, ${currentGradient.secondary} 50%, ${currentGradient.primary} 100%)`
                }}
              />
            </div>

            {/* Preset Gradients */}
            <div>
              <label className="block text-gray-300 text-sm mb-3">
                {isReadOnly ? 'Available Themes' : 'Try Different Themes (Local Preview)'}
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {presetGradients.map((preset, index) => {
                  const isActive = 
                    preset.primary === currentGradient.primary &&
                    preset.secondary === currentGradient.secondary &&
                    preset.accent === currentGradient.accent;
                  
                  return (
                    <div
                      key={index}
                      onClick={() => handlePresetClick(preset)}
                      className={`relative p-3 rounded-lg border transition-all duration-300 ${
                        isActive ? 'border-[#39FF14] ring-2 ring-[#39FF14]/50' : 'border-white/20'
                      } ${
                        !isReadOnly ? 'cursor-pointer hover:border-white/40' : 'cursor-default'
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.secondary} 50%, ${preset.primary} 100%)`
                      }}
                    >
                      <div className="text-white text-xs font-medium">{preset.name}</div>
                      {isActive && (
                        <div className="absolute top-1 right-1 text-[#39FF14] text-xs">✓</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Local preview indicator */}
            {!isReadOnly && (
              <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 text-xs text-center">
                  ⚡ Local preview only - Changes won't be saved and will reset on page reload
                </p>
              </div>
            )}
            
            {/* Read-only indicator */}
            {isReadOnly && (
              <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <p className="text-blue-300 text-xs text-center">
                  🔒 Read-only view - Theme customization is not available in public storefront
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GradientCustomizer;