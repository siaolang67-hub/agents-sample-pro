import React, { useState, useMemo } from 'react';
import { MarketAsset, MarketCategory } from '../types';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Star,
  Search,
  ArrowUpDown,
  Download,
  SlidersHorizontal
} from 'lucide-react';

interface ScreenerTableProps {
  assets: MarketAsset[];
  selectedCategory: MarketCategory | 'all';
  onCategoryChange: (cat: MarketCategory | 'all') => void;
  onSelectAsset: (asset: MarketAsset) => void;
  onOpenAiAnalysis: (asset: MarketAsset) => void;
  starredSymbols: string[];
  onToggleStar: (symbol: string) => void;
}

type TabFilter = 'all' | 'gainers' | 'losers' | 'active';

export const ScreenerTable: React.FC<ScreenerTableProps> = ({
  assets,
  selectedCategory,
  onCategoryChange,
  onSelectAsset,
  onOpenAiAnalysis,
  starredSymbols,
  onToggleStar,
}) => {
  const [tabFilter, setTabFilter] = useState<TabFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'price' | 'changePercent' | 'name' | 'rsiValue'>('changePercent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isCompact, setIsCompact] = useState(false);

  const categories: { key: MarketCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'All Markets' },
    { key: 'indices', label: 'Indices' },
    { key: 'stocks', label: 'Stocks' },
    { key: 'crypto', label: 'Crypto' },
    { key: 'forex', label: 'Forex' },
    { key: 'commodities', label: 'Commodities' },
  ];

  const filteredAssets = useMemo(() => {
    return assets
      .filter((asset) => {
        if (selectedCategory !== 'all' && asset.category !== selectedCategory) {
          return false;
        }
        if (
          searchQuery &&
          !asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !asset.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        if (tabFilter === 'gainers') return asset.changePercent > 0;
        if (tabFilter === 'losers') return asset.changePercent < 0;
        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField] ?? 0;
        let valB = b[sortField] ?? 0;
        if (typeof valA === 'string') {
          valA = (valA as string).toLowerCase();
          valB = (valB as string).toLowerCase();
        }
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [assets, selectedCategory, searchQuery, tabFilter, sortField, sortOrder]);

  const toggleSort = (field: 'price' | 'changePercent' | 'name' | 'rsiValue') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const exportCsv = () => {
    const headers = ['Symbol', 'Name', 'Category', 'Price', 'Change %', 'RSI', 'Volume', 'Gauge'];
    const rows = filteredAssets.map((a) => [
      a.symbol,
      `"${a.name}"`,
      a.category,
      a.price,
      a.changePercent,
      a.rsiValue,
      a.volume,
      a.technicalGauge,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `market_screener_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getGaugeBadgeColor = (gauge: string) => {
    switch (gauge) {
      case 'Strong Buy':
        return 'bg-[#089981]/20 text-[#089981] border-[#089981]/40';
      case 'Buy':
        return 'bg-[#089981]/10 text-[#089981] border-[#089981]/20';
      case 'Sell':
        return 'bg-[#F23645]/10 text-[#F23645] border-[#F23645]/20';
      case 'Strong Sell':
        return 'bg-[#F23645]/20 text-[#F23645] border-[#F23645]/40';
      default:
        return 'bg-[#2A2E39] text-[#c3c5d8] border-[#2A2E39]';
    }
  };

  return (
    <section className="bg-[#1E222D] rounded-xl border border-[#2A2E39] p-6 shadow-sm">
      {/* Top Controls: Categories & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#2A2E39]">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const active = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => onCategoryChange(cat.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-[#2962ff] text-white shadow-sm'
                    : 'bg-[#171b26] text-[#c3c5d8] hover:bg-[#313441] hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Filter Tabs & Search & CSV Export */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-[#171b26] p-1 rounded-lg border border-[#2A2E39]">
            <button
              onClick={() => setTabFilter('all')}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                tabFilter === 'all'
                  ? 'bg-[#2A2E39] text-white'
                  : 'text-[#8d90a2] hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTabFilter('gainers')}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                tabFilter === 'gainers'
                  ? 'bg-[#089981]/20 text-[#089981]'
                  : 'text-[#8d90a2] hover:text-[#089981]'
              }`}
            >
              Gainers
            </button>
            <button
              onClick={() => setTabFilter('losers')}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                tabFilter === 'losers'
                  ? 'bg-[#F23645]/20 text-[#F23645]'
                  : 'text-[#8d90a2] hover:text-[#F23645]'
              }`}
            >
              Losers
            </button>
          </div>

          <div className="relative w-44">
            <Search className="w-3.5 h-3.5 text-[#8d90a2] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter symbol..."
              className="w-full bg-[#171b26] text-xs text-[#dfe2f2] placeholder:text-[#8d90a2] pl-8 pr-3 py-2 rounded-lg border border-[#2A2E39] focus:outline-none focus:border-[#2962ff]"
            />
          </div>

          <button
            onClick={() => setIsCompact(!isCompact)}
            className={`p-2 rounded-lg border text-xs font-mono transition-colors ${
              isCompact
                ? 'bg-[#2962ff]/20 border-[#2962ff] text-white'
                : 'bg-[#171b26] border-[#2A2E39] text-[#8d90a2] hover:text-white'
            }`}
            title="Toggle compact row density"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#171b26] border border-[#2A2E39] hover:border-[#2962ff] text-xs text-[#c3c5d8] hover:text-white transition-colors"
            title="Export CSV dataset"
          >
            <Download className="w-3.5 h-3.5 text-[#2962ff]" />
            <span className="hidden sm:inline font-mono">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#2A2E39] text-[#8d90a2] text-xs font-semibold uppercase tracking-wider">
              <th className="py-3 px-3 w-10 text-center">★</th>
              <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => toggleSort('name')}>
                <div className="flex items-center gap-1">
                  <span>Symbol / Name</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-right cursor-pointer hover:text-white" onClick={() => toggleSort('price')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Last Price</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-right cursor-pointer hover:text-white" onClick={() => toggleSort('changePercent')}>
                <div className="flex items-center justify-end gap-1">
                  <span>24h Change</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-center cursor-pointer hover:text-white" onClick={() => toggleSort('rsiValue')}>
                <div className="flex items-center justify-center gap-1">
                  <span>RSI (14)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">Technical Rating</th>
              <th className="py-3 px-3 text-center">52W Range</th>
              <th className="py-3 px-3 text-center">24h Sparkline</th>
              <th className="py-3 px-3 text-right">Volume</th>
              <th className="py-3 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2E39]/60">
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-[#8d90a2] text-sm">
                  No market symbols match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => {
                const isStarred = starredSymbols.includes(asset.symbol);
                const isPositive = asset.changePercent >= 0;

                const isTickingUp = asset.lastTickDirection === 'up';
                const isTickingDown = asset.lastTickDirection === 'down';

                let rowFlash = '';
                if (isTickingUp) rowFlash = 'bg-[#089981]/20 transition-colors duration-500';
                if (isTickingDown) rowFlash = 'bg-[#F23645]/20 transition-colors duration-500';

                // Calculate 52W % for mini bar
                const low = asset.week52Low || asset.low * 0.8;
                const high = asset.week52High || asset.high * 1.2;
                const pct52 = Math.min(Math.max(((asset.price - low) / (high - low || 1)) * 100, 0), 100);

                return (
                  <tr
                    key={asset.symbol}
                    className={`hover:bg-[#2A2E39]/40 transition-colors group cursor-pointer ${
                      isCompact ? 'py-1.5' : 'py-3'
                    } ${rowFlash}`}
                    onClick={() => onSelectAsset(asset)}
                  >
                    {/* Star Favorite */}
                    <td
                      className="py-3 px-3 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStar(asset.symbol);
                      }}
                    >
                      <button className="text-[#8d90a2] hover:text-amber-400 transition-colors">
                        <Star
                          className={`w-4 h-4 ${
                            isStarred ? 'fill-amber-400 text-amber-400' : ''
                          }`}
                        />
                      </button>
                    </td>

                    {/* Symbol & Name */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-[#dfe2f2] group-hover:text-[#b6c4ff] transition-colors">
                          {asset.symbol}
                        </span>
                        <span className="text-xs text-[#8d90a2] truncate max-w-[150px]">
                          {asset.name}
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-3 text-right font-mono-tabular font-bold text-sm text-[#dfe2f2]">
                      ${asset.price.toLocaleString(undefined, {
                        minimumFractionDigits: asset.price < 10 ? 4 : 2,
                        maximumFractionDigits: asset.price < 10 ? 4 : 2,
                      })}
                    </td>

                    {/* Change */}
                    <td className="py-3 px-3 text-right">
                      <div
                        className={`inline-flex items-center gap-1 font-mono-tabular text-xs font-semibold px-2 py-0.5 rounded ${
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
                    </td>

                    {/* RSI */}
                    <td className="py-3 px-3 text-center">
                      <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        {asset.rsiValue || 50}
                      </span>
                    </td>

                    {/* Technical Rating */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded border ${getGaugeBadgeColor(
                          asset.technicalGauge
                        )}`}
                      >
                        {asset.technicalGauge}
                      </span>
                    </td>

                    {/* 52W Range Mini Bar */}
                    <td className="py-3 px-3 text-center">
                      <div className="w-20 mx-auto space-y-0.5">
                        <div className="w-full h-1.5 bg-[#2A2E39] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#2962ff]"
                            style={{ width: `${pct52}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Sparkline Trend */}
                    <td className="py-3 px-3 text-center">
                      <div className="w-20 h-5 mx-auto">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24">
                          {(() => {
                            const min = Math.min(...asset.sparkline);
                            const max = Math.max(...asset.sparkline);
                            const range = max - min || 1;
                            const pts = asset.sparkline
                              .map(
                                (val, idx) =>
                                  `${(idx / (asset.sparkline.length - 1)) * 100},${
                                    22 - ((val - min) / range) * 20
                                  }`
                              )
                              .join(' ');
                            return (
                              <polyline
                                fill="none"
                                stroke={isPositive ? '#089981' : '#F23645'}
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={pts}
                              />
                            );
                          })()}
                        </svg>
                      </div>
                    </td>

                    {/* Volume */}
                    <td className="py-3 px-3 text-right font-mono text-xs text-[#c3c5d8]">
                      {asset.volume}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onOpenAiAnalysis(asset)}
                        className="p-1.5 rounded bg-[#171b26] border border-[#2A2E39] hover:border-[#2962ff] text-[#b6c4ff] hover:text-white transition-colors"
                        title="Get Gemini AI Market Analysis"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#2962ff]" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
