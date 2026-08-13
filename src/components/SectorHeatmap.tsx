import React from 'react';
import { SectorPerformance, MarketAsset } from '../types';
import { Layers, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

interface SectorHeatmapProps {
  sectors: SectorPerformance[];
  assets: MarketAsset[];
  onSelectSymbol: (symbol: string) => void;
}

export const SectorHeatmap: React.FC<SectorHeatmapProps> = ({
  sectors,
  assets,
  onSelectSymbol,
}) => {
  return (
    <section className="mb-12 bg-[#1E222D] rounded-xl border border-[#2A2E39] p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[#2A2E39]">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#2962ff]" />
          <h2 className="text-xl font-bold font-['Hanken_Grotesk'] text-[#dfe2f2]">
            Market Sector Heatmap
          </h2>
        </div>
        <span className="text-xs font-mono text-[#8d90a2]">Relative weight & 24h performance</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {sectors.map((sec) => {
          const isPositive = sec.changePercent >= 0;
          let colorBg = 'bg-[#089981]/20 border-[#089981]/40 text-[#089981]';
          if (sec.changePercent > 2) {
            colorBg = 'bg-[#089981]/30 border-[#089981] text-[#089981]';
          } else if (sec.changePercent < 0 && sec.changePercent > -2) {
            colorBg = 'bg-[#F23645]/20 border-[#F23645]/40 text-[#F23645]';
          } else if (sec.changePercent <= -2) {
            colorBg = 'bg-[#F23645]/30 border-[#F23645] text-[#F23645]';
          }

          const topAsset = assets.find((a) => a.symbol === sec.topSymbol);

          return (
            <div
              key={sec.name}
              className={`p-4 rounded-xl border transition-all relative overflow-hidden group hover:scale-[1.01] ${colorBg}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white font-['Hanken_Grotesk']">
                    {sec.name}
                  </h3>
                  <p className="text-[11px] font-mono opacity-80 mt-0.5">
                    Market Weight: {sec.weight}
                  </p>
                </div>

                <div className="flex items-center gap-1 font-mono text-sm font-bold">
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>
                    {isPositive ? '+' : ''}
                    {sec.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Bottom Row: Key Ticker Link */}
              {topAsset && (
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="text-[11px] font-mono opacity-90">
                    Leader: <span className="font-bold text-white">{topAsset.symbol}</span> (${topAsset.price})
                  </div>
                  <button
                    onClick={() => onSelectSymbol(topAsset.symbol)}
                    className="p-1 rounded bg-black/20 hover:bg-black/40 text-white transition-colors"
                    title={`View ${topAsset.symbol} chart`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
