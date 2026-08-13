import React, { useState, useEffect, useRef } from 'react';
import { MarketAsset, MarketCategory } from '../types';
import { Search, X, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';

interface SearchModalProps {
  assets: MarketAsset[];
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset: (asset: MarketAsset) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  assets,
  isOpen,
  onClose,
  onSelectAsset,
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<MarketCategory | 'all'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filtered = assets.filter((asset) => {
    if (selectedCat !== 'all' && asset.category !== selectedCat) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      asset.symbol.toLowerCase().includes(q) ||
      asset.name.toLowerCase().includes(q) ||
      asset.category.toLowerCase().includes(q)
    );
  });

  const categories: { key: MarketCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'indices', label: 'Indices' },
    { key: 'stocks', label: 'Stocks' },
    { key: 'crypto', label: 'Crypto' },
    { key: 'forex', label: 'Forex' },
    { key: 'commodities', label: 'Commodities' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1E222D] border border-[#2A2E39] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col text-[#dfe2f2]">
        {/* Input Header */}
        <div className="p-4 border-b border-[#2A2E39] flex items-center gap-3 bg-[#171b26]">
          <Search className="w-5 h-5 text-[#2962ff]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol, company name, crypto, index..."
            className="w-full bg-transparent text-base text-white placeholder:text-[#8d90a2] focus:outline-none"
          />
          <button onClick={onClose} className="p-1 rounded text-[#8d90a2] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="px-4 py-3 border-b border-[#2A2E39] flex gap-2 overflow-x-auto scrollbar-none bg-[#1E222D]">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCat(c.key)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCat === c.key
                  ? 'bg-[#2962ff] text-white'
                  : 'bg-[#171b26] text-[#8d90a2] hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-[#2A2E39]/60 p-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[#8d90a2] text-sm font-mono">
              No matching assets found for "{query}".
            </div>
          ) : (
            filtered.map((asset) => {
              const isPositive = asset.changePercent >= 0;
              return (
                <div
                  key={asset.symbol}
                  onClick={() => {
                    onSelectAsset(asset);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#2A2E39] cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#171b26] border border-[#2A2E39] flex items-center justify-center font-bold text-xs text-[#2962ff]">
                      {asset.shortBadge}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-white group-hover:text-[#b6c4ff] transition-colors">
                          {asset.symbol}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#171b26] text-[#8d90a2]">
                          {asset.category}
                        </span>
                      </div>
                      <div className="text-xs text-[#8d90a2]">{asset.name}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-white">
                        ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className={`text-xs font-mono ${isPositive ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                        {isPositive ? '+' : ''}{asset.changePercent.toFixed(2)}%
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8d90a2] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 border-t border-[#2A2E39] bg-[#171b26] text-[11px] text-[#8d90a2] flex justify-between font-mono">
          <span>Press ESC to close</span>
          <span>{filtered.length} assets available</span>
        </div>
      </div>
    </div>
  );
};
