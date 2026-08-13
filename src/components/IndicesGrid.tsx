import React from 'react';
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { MarketAsset } from '../types';

interface IndicesGridProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  onViewAllIndices: () => void;
}

export const IndicesGrid: React.FC<IndicesGridProps> = ({
  assets,
  onSelectAsset,
  onViewAllIndices,
}) => {
  // Find primary indices: SPX, NDX, DJI
  const sp500 = assets.find((a) => a.symbol === 'SPX') || assets[0];
  const nasdaq = assets.find((a) => a.symbol === 'NDX') || assets[1];
  const dow = assets.find((a) => a.symbol === 'DJI') || assets[2];

  const topIndices = [sp500, nasdaq, dow].filter(Boolean);

  const renderBadge = (asset: MarketAsset) => {
    let bgClasses = 'bg-[#b6c4ff]/20 text-[#b6c4ff]';
    if (asset.symbol === 'SPX' || asset.changePercent < 0) {
      bgClasses = 'bg-[#F23645]/20 text-[#F23645]';
    } else if (asset.changePercent > 0) {
      bgClasses = 'bg-[#089981]/20 text-[#089981]';
    }

    return (
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${bgClasses}`}
      >
        {asset.shortBadge}
      </div>
    );
  };

  return (
    <section className="mb-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onViewAllIndices}
          className="flex items-center gap-2 group text-left text-[#dfe2f2] hover:text-[#b6c4ff] transition-colors"
        >
          <h2 className="text-2xl font-bold font-['Hanken_Grotesk'] tracking-tight">Indices</h2>
          <ChevronRight className="w-6 h-6 text-[#c3c5d8] group-hover:translate-x-0.5 transition-transform" />
        </button>
        <span className="text-xs text-[#8d90a2] font-mono">Real-time benchmark updates</span>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topIndices.map((asset) => {
          const isPositive = asset.changePercent >= 0;
          return (
            <div
              key={asset.symbol}
              onClick={() => onSelectAsset(asset)}
              className="bg-[#1E222D] rounded-lg p-5 border border-[#2A2E39] hover:border-[#2962ff] transition-all cursor-pointer group flex flex-col justify-between h-36 relative overflow-hidden shadow-sm hover:shadow-md"
            >
              {/* Top Row: Badge + Name */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {renderBadge(asset)}
                  <span className="font-semibold text-base text-[#dfe2f2] group-hover:text-white transition-colors">
                    {asset.name}
                  </span>
                </div>

                {/* Change Badge */}
                <div
                  className={`flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded font-medium ${
                    isPositive
                      ? 'bg-[#089981]/15 text-[#089981]'
                      : 'bg-[#F23645]/15 text-[#F23645]'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {isPositive ? '+' : ''}
                    {asset.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Bottom Row: Live Price + Sparkline SVG */}
              <div className="flex items-end justify-between mt-auto pt-2">
                <div>
                  <div className="text-xl font-bold font-mono-tabular text-[#dfe2f2]">
                    {asset.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div
                    className={`text-xs font-mono ${
                      isPositive ? 'text-[#089981]' : 'text-[#F23645]'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {asset.change.toFixed(2)}
                  </div>
                </div>

                {/* Miniature Sparkline */}
                <div className="w-20 h-8 opacity-80 group-hover:opacity-100 transition-opacity">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
                    {(() => {
                      const min = Math.min(...asset.sparkline);
                      const max = Math.max(...asset.sparkline);
                      const range = max - min || 1;
                      const pts = asset.sparkline
                        .map(
                          (val, idx) =>
                            `${(idx / (asset.sparkline.length - 1)) * 100},${
                              28 - ((val - min) / range) * 24
                            }`
                        )
                        .join(' ');
                      return (
                        <polyline
                          fill="none"
                          stroke={isPositive ? '#089981' : '#F23645'}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={pts}
                        />
                      );
                    })()}
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
