import React, { useState, useEffect } from 'react';
import { BarChart3, Search, Globe, User, Activity, Pause, Play } from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  isSimulating,
  onToggleSimulation,
  activeNav,
  setActiveNav,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  const navItems = ['Products', 'Community', 'Markets', 'Brokers', 'More'];

  return (
    <nav className="flex justify-between items-center w-full px-6 py-2 h-16 max-w-[1280px] mx-auto z-50 bg-[#0f131e] border-b border-[#2A2E39] sticky top-0">
      <div className="flex items-center gap-6">
        {/* Brand Logo */}
        <button
          onClick={() => setActiveNav('Markets')}
          className="text-2xl font-black text-[#dfe2f2] flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded bg-[#2962ff]/20 text-[#2962ff] flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="font-['Hanken_Grotesk'] tracking-tight">TradingView</span>
        </button>

        {/* Search Input Box */}
        <div
          onClick={onOpenSearch}
          className="hidden lg:flex items-center bg-[#313441] rounded-full px-4 py-2 w-64 ml-2 border border-[#2A2E39] hover:border-[#2962ff] cursor-pointer transition-colors group"
        >
          <Search className="w-4 h-4 text-[#c3c5d8] mr-2 group-hover:text-[#2962ff] transition-colors" />
          <span className="text-xs text-[#c3c5d8] flex-1 select-none">Search (Ctrl+K)</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-[#8d90a2] bg-[#1E222D] rounded border border-[#2A2E39]">
            ⌘K
          </kbd>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex gap-6 ml-2">
          {navItems.map((item) => {
            const isActive = activeNav === item;
            return (
              <button
                key={item}
                onClick={() => setActiveNav(item)}
                className={`text-sm transition-colors duration-200 relative py-1 ${
                  isActive
                    ? 'text-[#b6c4ff] font-semibold'
                    : 'text-[#c3c5d8] hover:text-[#b6c4ff]'
                }`}
              >
                {item}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2962ff] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Live Simulation Indicator Button */}
        <button
          onClick={onToggleSimulation}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-colors border ${
            isSimulating
              ? 'bg-[#089981]/10 text-[#089981] border-[#089981]/30 hover:bg-[#089981]/20'
              : 'bg-[#2A2E39]/40 text-[#8d90a2] border-[#2A2E39] hover:bg-[#2A2E39]'
          }`}
          title={isSimulating ? 'Pause real-time market ticks' : 'Resume real-time market ticks'}
        >
          <Activity className={`w-3.5 h-3.5 ${isSimulating ? 'animate-pulse text-[#089981]' : ''}`} />
          <span>{isSimulating ? 'LIVE TICKER' : 'PAUSED'}</span>
          {isSimulating ? <Pause className="w-3 h-3 ml-1" /> : <Play className="w-3 h-3 ml-1" />}
        </button>

        {/* Search Mobile Button */}
        <button
          onClick={onOpenSearch}
          className="lg:hidden text-[#c3c5d8] hover:text-[#b6c4ff] p-2"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Language Button */}
        <button className="text-[#c3c5d8] hover:text-[#b6c4ff] transition-colors flex items-center gap-1 text-xs">
          <Globe className="w-4 h-4" />
          <span>EN</span>
        </button>

        {/* User Profile */}
        <button className="text-[#c3c5d8] hover:text-[#b6c4ff] transition-colors p-1.5 rounded-full hover:bg-[#1E222D]">
          <User className="w-5 h-5" />
        </button>

        {/* Get Started Button */}
        <button className="bg-[#2962ff] text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-[#1E53E5] transition-colors shadow-sm">
          Get started
        </button>
      </div>
    </nav>
  );
};
