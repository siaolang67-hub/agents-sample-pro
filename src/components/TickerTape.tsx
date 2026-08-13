import React from 'react';
import { MarketAsset } from '../types';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface TickerTapeProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
}

export const TickerTape: React.FC<TickerTapeProps> = ({ assets, onSelectAsset }) => {
  // Select key tickers for the tape
  const tapeAssets = assets.slice(0, 10);

  return (
    <div className="w-full bg-[#131722] border-b border-[#2A2E39] text-xs py-1.5 px-4 overflow-hidden select-none flex items-center justify-between z-40 sticky top-0 font-mono">
      {/* Market Status Pulse */}
      <div className="hidden xl:flex items-center gap-2 border-r border-[#2A2E39] pr-4 text-[#8d90a2] text-[11px] shrink-0">
        <span className="w-2 h-2 rounded-full bg-[#089981] animate-ping" />
        <span className="text-[#089981] font-bold">REGULAR MARKET OPEN</span>
        <Clock className="w-3 h-3 text-[#8d90a2]" />
      </div>

      {/* Marquee Tickers Row */}
      <div className="flex items-center gap-6 overflow-x-auto scrollbar-none py-0.5 px-2">
        {tapeAssets.map((asset) => {
          const isPositive = asset.changePercent >= 0;
          const isTickingUp = asset.lastTickDirection === 'up';
          const isTickingDown = asset.lastTickDirection === 'down';

          let flashClass = '';
          if (isTickingUp) flashClass = 'bg-[#089981]/25 text-white transition-colors duration-300';
          if (isTickingDown) flashClass = 'bg-[#F23645]/25 text-white transition-colors duration-300';

          return (
            <div
              key={asset.symbol}
              onClick={() => onSelectAsset(asset)}
              className={`flex items-center gap-2 cursor-pointer px-2 py-0.5 rounded transition-all hover:bg-[#1E222D] shrink-0 group ${flashClass}`}
            >
              <span className="font-bold text-[#dfe2f2] group-hover:text-[#b6c4ff]">
                {asset.symbol}
              </span>
              <span className="text-white font-mono-tabular font-medium">
                ${asset.price.toLocaleString(undefined, {
                  minimumFractionDigits: asset.price < 10 ? 4 : 2,
                })}
              </span>
              <span
                className={`flex items-center gap-0.5 text-[11px] font-semibold ${
                  isPositive ? 'text-[#089981]' : 'text-[#F23645]'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {isPositive ? '+' : ''}
                {asset.changePercent.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Indices Fast Summary */}
      <div className="hidden lg:flex items-center gap-3 border-l border-[#2A2E39] pl-4 text-[11px] shrink-0">
        <span className="text-[#8d90a2]">Global Volatility Index (VIX):</span>
        <span className="font-bold font-mono text-amber-400">15.82 (-2.1%)</span>
      </div>
    </div>
  );
};
