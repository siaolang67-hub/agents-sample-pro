import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-12 px-6 max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center border-t border-[#2A2E39] mt-16 bg-[#0a0e19]">
      <div className="text-xs font-mono text-[#c3c5d8] mb-4 md:mb-0">
        © 2024 TradingView
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        <a className="text-xs text-[#c3c5d8] hover:text-[#b6c4ff] transition-colors" href="#">About</a>
        <a className="text-xs text-[#c3c5d8] hover:text-[#b6c4ff] transition-colors" href="#">Features</a>
        <a className="text-xs text-[#c3c5d8] hover:text-[#b6c4ff] transition-colors" href="#">Pricing</a>
        <a className="text-xs text-[#c3c5d8] hover:text-[#b6c4ff] transition-colors" href="#">Help Center</a>
        <a className="text-xs text-[#c3c5d8] hover:text-[#b6c4ff] transition-colors" href="#">Terms of Use</a>
        <a className="text-xs text-[#c3c5d8] hover:text-[#b6c4ff] transition-colors" href="#">Privacy Policy</a>
      </div>
    </footer>
  );
};
