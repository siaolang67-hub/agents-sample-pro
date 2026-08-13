import React, { useState, useEffect } from 'react';
import { INITIAL_MARKET_ASSETS, SAMPLE_NEWS, SECTOR_PERFORMANCE } from './data/marketData';
import { MarketAsset, MarketCategory } from './types';
import { Header } from './components/Header';
import { TickerTape } from './components/TickerTape';
import { IndicesGrid } from './components/IndicesGrid';
import { SectorHeatmap } from './components/SectorHeatmap';
import { ScreenerTable } from './components/ScreenerTable';
import { AssetDetailModal } from './components/AssetDetailModal';
import { SearchModal } from './components/SearchModal';
import { NewsSection } from './components/NewsSection';
import { DisqusForum } from './components/DisqusForum';
import { Footer } from './components/Footer';
import { ChevronDown } from 'lucide-react';

export default function App() {
  const [assets, setAssets] = useState<MarketAsset[]>(INITIAL_MARKET_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(true);
  const [activeNav, setActiveNav] = useState('Markets');
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory | 'all'>('all');
  const [marketScope, setMarketScope] = useState('everywhere');
  const [isScopeDropdownOpen, setIsScopeDropdownOpen] = useState(false);

  // Starred symbols persistence
  const [starredSymbols, setStarredSymbols] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tv_starred_symbols');
      return saved ? JSON.parse(saved) : ['SPX', 'NVDA', 'BTCUSD'];
    } catch {
      return ['SPX', 'NVDA', 'BTCUSD'];
    }
  });

  const toggleStar = (symbol: string) => {
    setStarredSymbols((prev) => {
      const updated = prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol];
      try {
        localStorage.setItem('tv_starred_symbols', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  };

  // Real-time market tick simulation effect
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          // 40% chance to tick this asset
          if (Math.random() > 0.4) return asset;

          const deltaPercent = (Math.random() - 0.49) * 0.003;
          const oldPrice = asset.price;
          const newPrice = Number(
            Math.max(0.01, oldPrice * (1 + deltaPercent)).toFixed(
              oldPrice < 10 ? 4 : 2
            )
          );
          const priceDiff = newPrice - asset.open;
          const newChangePercent = Number(
            ((priceDiff / asset.open) * 100).toFixed(2)
          );

          const updatedSparkline = [...asset.sparkline.slice(1), newPrice];

          return {
            ...asset,
            price: newPrice,
            change: Number(priceDiff.toFixed(2)),
            changePercent: newChangePercent,
            sparkline: updatedSparkline,
            high: Math.max(asset.high, newPrice),
            low: Math.min(asset.low, newPrice),
            lastTickDirection: newPrice >= oldPrice ? 'up' : 'down',
            lastTickTime: Date.now(),
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const handleSelectSymbolByName = (symbol: string) => {
    const found = assets.find((a) => a.symbol === symbol);
    if (found) {
      setSelectedAsset(found);
    }
  };

  const marketScopes = [
    { key: 'everywhere', label: 'everywhere' },
    { key: 'us', label: 'in United States' },
    { key: 'europe', label: 'in Europe' },
    { key: 'asia', label: 'in Asia-Pacific' },
    { key: 'crypto', label: 'in Crypto' },
  ];

  return (
    <div className="bg-[#0f131e] text-[#dfe2f2] font-['Inter'] min-h-screen flex flex-col selection:bg-[#2962ff] selection:text-white">
      {/* Top Real-time Marquee Ticker Tape */}
      <TickerTape
        assets={assets}
        onSelectAsset={(asset) => setSelectedAsset(asset)}
      />

      {/* Top Navbar */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
      />

      {/* Main Content Container */}
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-6 py-8">
        {/* Page Hero Header */}
        <header className="mb-8 relative">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black font-[#Hanken_Grotesk] tracking-tight text-white">
              Markets, {marketScope}
            </h1>

            {/* Scope Dropdown Toggle */}
            <div className="relative">
              <button
                onClick={() => setIsScopeDropdownOpen(!isScopeDropdownOpen)}
                className="p-1 rounded-lg text-white hover:bg-[#2A2E39] transition-colors flex items-center"
                aria-label="Select market scope"
              >
                <ChevronDown className={`w-7 h-7 transition-transform duration-200 ${isScopeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isScopeDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-[#1E222D] border border-[#2A2E39] rounded-xl shadow-2xl py-2 z-30 animate-fadeIn">
                  {marketScopes.map((scope) => (
                    <button
                      key={scope.key}
                      onClick={() => {
                        setMarketScope(scope.label);
                        setIsScopeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[#2A2E39] ${
                        marketScope === scope.label
                          ? 'text-[#2962ff] font-bold bg-[#171b26]'
                          : 'text-[#dfe2f2]'
                      }`}
                    >
                      Markets, {scope.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#8d90a2] mt-1.5 font-mono">
            Track global stock benchmarks, commodities, foreign exchange, and digital assets in real time.
          </p>
        </header>

        {/* Indices Section */}
        <IndicesGrid
          assets={assets}
          onSelectAsset={(asset) => setSelectedAsset(asset)}
          onViewAllIndices={() => setSelectedCategory('indices')}
        />

        {/* Sector Performance Heatmap */}
        <SectorHeatmap
          sectors={SECTOR_PERFORMANCE}
          assets={assets}
          onSelectSymbol={handleSelectSymbolByName}
        />

        {/* Asset Screener & Data Table */}
        <ScreenerTable
          assets={assets}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onSelectAsset={(asset) => setSelectedAsset(asset)}
          onOpenAiAnalysis={(asset) => setSelectedAsset(asset)}
          starredSymbols={starredSymbols}
          onToggleStar={toggleStar}
        />

        {/* News Section */}
        <NewsSection
          news={SAMPLE_NEWS}
          onSelectSymbol={handleSelectSymbolByName}
        />

        {/* Discussion Forum */}
        <DisqusForum />
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Modals */}
      <SearchModal
        assets={assets}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectAsset={(asset) => setSelectedAsset(asset)}
      />

      <AssetDetailModal
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
      />
    </div>
  );
}
