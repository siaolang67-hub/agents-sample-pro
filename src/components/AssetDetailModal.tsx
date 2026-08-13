import React, { useState, useEffect } from 'react';
import { MarketAsset } from '../types';
import { OrderBookWidget } from './OrderBookWidget';
import {
  X,
  TrendingUp,
  TrendingDown,
  Sparkles,
  BarChart2,
  LineChart,
  RefreshCw,
  Layers,
  Eye,
  Sliders,
  Check
} from 'lucide-react';

interface AssetDetailModalProps {
  asset: MarketAsset | null;
  onClose: () => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({ asset, onClose }) => {
  if (!asset) return null;

  const [chartType, setChartType] = useState<'line' | 'candlestick'>('candlestick');
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M');
  const [showSma20, setShowSma20] = useState(true);
  const [showSma50, setShowSma50] = useState(true);
  const [showRsi, setShowRsi] = useState(true);
  const [showVolume, setShowVolume] = useState(true);

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'ai' | 'orderbook'>('chart');
  const [hoveredCandle, setHoveredCandle] = useState<any | null>(null);

  const isPositive = asset.changePercent >= 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const fetchAiAnalysis = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/gemini/market-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: asset.symbol,
          name: asset.name,
          category: asset.category,
          price: asset.price,
          changePercent: asset.changePercent,
        }),
      });
      const data = await res.json();
      setAiAnalysis(data.analysis);
    } catch (err) {
      console.error(err);
      setAiAnalysis('Unable to load AI analysis at this time.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'ai' && !aiAnalysis) {
      fetchAiAnalysis();
    }
  }, [activeTab, asset.symbol]);

  // Render SVG Candlesticks with Volume & Moving Averages
  const renderCandlestickChart = () => {
    const candles = asset.candlesticks || [];
    if (candles.length === 0) return null;

    const minLow = Math.min(...candles.map((c) => c.low));
    const maxHigh = Math.max(...candles.map((c) => c.high));
    const priceRange = maxHigh - minLow || 1;

    const maxVol = Math.max(...candles.map((c) => c.volume || 1));

    const width = 720;
    const chartHeight = 240;
    const volHeight = showVolume ? 60 : 0;
    const totalHeight = chartHeight + volHeight + 20;

    const candleWidth = (width / candles.length) * 0.65;

    // Generate SMA paths
    const sma20Points = candles
      .map((c, i) => {
        if (!c.sma20) return null;
        const x = (i / candles.length) * width + candleWidth;
        const y = chartHeight - ((c.sma20 - minLow) / priceRange) * (chartHeight - 30) - 15;
        return `${x},${y}`;
      })
      .filter(Boolean)
      .join(' ');

    const sma50Points = candles
      .map((c, i) => {
        if (!c.sma50) return null;
        const x = (i / candles.length) * width + candleWidth;
        const y = chartHeight - ((c.sma50 - minLow) / priceRange) * (chartHeight - 30) - 15;
        return `${x},${y}`;
      })
      .filter(Boolean)
      .join(' ');

    return (
      <div className="w-full bg-[#171b26] p-4 rounded-xl border border-[#2A2E39] relative flex flex-col justify-between select-none">
        {/* Hovered Tooltip Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs font-mono mb-2 pb-2 border-b border-[#2A2E39] text-[#8d90a2] min-h-[28px]">
          {hoveredCandle ? (
            <div className="flex flex-wrap gap-4 text-white">
              <span>Date: <strong className="text-[#b6c4ff]">{hoveredCandle.time}</strong></span>
              <span>O: <strong className="text-white">${hoveredCandle.open}</strong></span>
              <span>H: <strong className="text-[#089981]">${hoveredCandle.high}</strong></span>
              <span>L: <strong className="text-[#F23645]">${hoveredCandle.low}</strong></span>
              <span>C: <strong className="text-white">${hoveredCandle.close}</strong></span>
              <span>Vol: <strong className="text-[#2962ff]">{(hoveredCandle.volume / 1000000).toFixed(2)}M</strong></span>
            </div>
          ) : (
            <div className="text-[#8d90a2] italic">
              Hover over candles to inspect tick details & indicator values
            </div>
          )}

          <div className="flex items-center gap-3 text-[11px]">
            {showSma20 && <span className="text-[#f59e0b] font-bold">● SMA (20)</span>}
            {showSma50 && <span className="text-[#3b82f6] font-bold">● SMA (50)</span>}
          </div>
        </div>

        {/* SVG Main Canvas */}
        <svg
          className="w-full overflow-visible"
          viewBox={`0 0 ${width} ${totalHeight}`}
        >
          {/* Price Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = chartHeight * pct;
            const priceVal = maxHigh - pct * priceRange;
            return (
              <g key={i}>
                <line x1="0" y1={y} x2={width} y2={y} stroke="#2A2E39" strokeDasharray="3 3" strokeWidth="1" />
                <text x={width - 5} y={y - 4} fill="#8d90a2" fontSize="10" textAnchor="end" fontFamily="JetBrains Mono">
                  ${priceVal.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Volume Gridline Separator */}
          {showVolume && (
            <line x1="0" y1={chartHeight + 10} x2={width} y2={chartHeight + 10} stroke="#2A2E39" strokeWidth="1.5" />
          )}

          {/* Volume Bars */}
          {showVolume &&
            candles.map((c, idx) => {
              const x = (idx / candles.length) * width + candleWidth;
              const isBullish = c.close >= c.open;
              const volBarH = ((c.volume || 1) / maxVol) * (volHeight - 10);
              const yVol = totalHeight - volBarH;

              return (
                <rect
                  key={`vol-${idx}`}
                  x={x - candleWidth / 2}
                  y={yVol}
                  width={candleWidth}
                  height={volBarH}
                  fill={isBullish ? '#089981' : '#F23645'}
                  opacity="0.3"
                />
              );
            })}

          {/* Candlesticks */}
          {candles.map((c, idx) => {
            const x = (idx / candles.length) * width + candleWidth;
            const isBullish = c.close >= c.open;
            const color = isBullish ? '#089981' : '#F23645';

            const yHigh = chartHeight - ((c.high - minLow) / priceRange) * (chartHeight - 30) - 15;
            const yLow = chartHeight - ((c.low - minLow) / priceRange) * (chartHeight - 30) - 15;
            const yOpen = chartHeight - ((c.open - minLow) / priceRange) * (chartHeight - 30) - 15;
            const yClose = chartHeight - ((c.close - minLow) / priceRange) * (chartHeight - 30) - 15;

            const candleTop = Math.min(yOpen, yClose);
            const candleHeight = Math.max(Math.abs(yOpen - yClose), 2);

            return (
              <g
                key={idx}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredCandle(c)}
                onMouseLeave={() => setHoveredCandle(null)}
              >
                {/* Wick */}
                <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="1.5" />
                {/* Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={candleTop}
                  width={candleWidth}
                  height={candleHeight}
                  fill={color}
                  rx="1"
                />
              </g>
            );
          })}

          {/* SMA Lines */}
          {showSma20 && sma20Points && (
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              points={sma20Points}
            />
          )}

          {showSma50 && sma50Points && (
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              points={sma50Points}
            />
          )}
        </svg>

        {/* RSI Oscillator Subchart */}
        {showRsi && (
          <div className="mt-4 pt-3 border-t border-[#2A2E39]">
            <div className="flex justify-between items-center text-[10px] font-mono text-[#8d90a2] mb-1">
              <span className="font-bold text-purple-400">RSI (14 Period): {asset.rsiValue}</span>
              <span>30 Oversold / 70 Overbought</span>
            </div>
            <div className="w-full h-12 bg-[#131722] rounded border border-[#2A2E39] relative overflow-hidden">
              <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} 48`}>
                {/* 30 & 70 dashed lines */}
                <line x1="0" y1="14" x2={width} y2="14" stroke="#2A2E39" strokeDasharray="2 2" />
                <line x1="0" y1="34" x2={width} y2="34" stroke="#2A2E39" strokeDasharray="2 2" />

                <polyline
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="1.8"
                  points={candles
                    .map((c, i) => {
                      const x = (i / candles.length) * width + candleWidth;
                      const rsiVal = c.rsi || 50;
                      const y = 48 - (rsiVal / 100) * 48;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              </svg>
            </div>
          </div>
        )}

        {/* Date Labels Footer */}
        <div className="flex justify-between text-[10px] font-mono text-[#8d90a2] pt-2 mt-2 border-t border-[#2A2E39]">
          <span>{candles[0]?.time}</span>
          <span>{candles[Math.floor(candles.length / 2)]?.time}</span>
          <span>{candles[candles.length - 1]?.time}</span>
        </div>
      </div>
    );
  };

  // 52-Week Range Bar Helper
  const renderWeek52Bar = () => {
    const low = asset.week52Low || asset.low * 0.8;
    const high = asset.week52High || asset.high * 1.2;
    const current = asset.price;

    const range = high - low || 1;
    const currentPct = Math.min(Math.max(((current - low) / range) * 100, 0), 100);

    return (
      <div className="bg-[#171b26] p-4 rounded-xl border border-[#2A2E39] space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-[#8d90a2] font-semibold">52-Week Range</span>
          <span className="font-mono text-[11px] text-[#b6c4ff]">
            Current: ${current.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-[#F23645]">${low.toLocaleString()}</span>
          <div className="flex-1 h-2.5 bg-[#2A2E39] rounded-full relative overflow-hidden">
            <div
              className="absolute top-0 bottom-0 bg-[#2962ff] rounded-full transition-all duration-300"
              style={{ width: `${currentPct}%` }}
            />
          </div>
          <span className="font-mono text-xs text-[#089981]">${high.toLocaleString()}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1E222D] border border-[#2A2E39] rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col text-[#dfe2f2]">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#2A2E39] flex items-center justify-between sticky top-0 bg-[#1E222D] z-20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#2962ff]/10 border border-[#2962ff]/30 flex items-center justify-center font-bold text-lg text-[#2962ff]">
              {asset.shortBadge}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-['Hanken_Grotesk'] text-white">
                  {asset.name}
                </h2>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#2A2E39] text-[#c3c5d8]">
                  {asset.symbol}
                </span>
              </div>
              <p className="text-xs text-[#8d90a2] capitalize">{asset.sector || asset.category}</p>
            </div>
          </div>

          {/* Right Header: Price & Close */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-2xl font-bold font-mono-tabular text-white">
                ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className={`text-xs font-mono font-semibold ${isPositive ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                {isPositive ? '+' : ''}{asset.change.toFixed(2)} ({isPositive ? '+' : ''}{asset.changePercent.toFixed(2)}%)
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#8d90a2] hover:text-white hover:bg-[#2A2E39] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-[#2A2E39] flex items-center gap-6 bg-[#171b26]">
          <button
            onClick={() => setActiveTab('chart')}
            className={`py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'chart'
                ? 'border-[#2962ff] text-[#b6c4ff]'
                : 'border-transparent text-[#8d90a2] hover:text-[#dfe2f2]'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Interactive Technical Chart</span>
          </button>

          <button
            onClick={() => setActiveTab('orderbook')}
            className={`py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'orderbook'
                ? 'border-[#2962ff] text-[#b6c4ff]'
                : 'border-transparent text-[#8d90a2] hover:text-[#dfe2f2]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Level II Order Depth</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'ai'
                ? 'border-[#2962ff] text-[#b6c4ff]'
                : 'border-transparent text-[#8d90a2] hover:text-[#dfe2f2]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#2962ff]" />
            <span>Gemini AI Insights</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {activeTab === 'chart' ? (
            <>
              {/* Chart Overlay Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-[#171b26] p-3 rounded-xl border border-[#2A2E39]">
                {/* Timeframes */}
                <div className="flex items-center gap-1">
                  {(['1D', '1W', '1M', '3M', '1Y'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-3 py-1 text-xs font-mono font-medium rounded transition-colors ${
                        timeframe === tf
                          ? 'bg-[#2962ff] text-white'
                          : 'text-[#8d90a2] hover:text-white'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                {/* Technical Overlay Toggles */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <button
                    onClick={() => setShowSma20(!showSma20)}
                    className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1 ${
                      showSma20
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 font-bold'
                        : 'border-[#2A2E39] text-[#8d90a2]'
                    }`}
                  >
                    {showSma20 && <Check className="w-3 h-3" />}
                    <span>SMA 20</span>
                  </button>

                  <button
                    onClick={() => setShowSma50(!showSma50)}
                    className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1 ${
                      showSma50
                        ? 'bg-blue-500/15 border-blue-500/40 text-blue-400 font-bold'
                        : 'border-[#2A2E39] text-[#8d90a2]'
                    }`}
                  >
                    {showSma50 && <Check className="w-3 h-3" />}
                    <span>SMA 50</span>
                  </button>

                  <button
                    onClick={() => setShowVolume(!showVolume)}
                    className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1 ${
                      showVolume
                        ? 'bg-[#089981]/15 border-[#089981]/40 text-[#089981] font-bold'
                        : 'border-[#2A2E39] text-[#8d90a2]'
                    }`}
                  >
                    {showVolume && <Check className="w-3 h-3" />}
                    <span>Volume</span>
                  </button>

                  <button
                    onClick={() => setShowRsi(!showRsi)}
                    className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1 ${
                      showRsi
                        ? 'bg-purple-500/15 border-purple-500/40 text-purple-400 font-bold'
                        : 'border-[#2A2E39] text-[#8d90a2]'
                    }`}
                  >
                    {showRsi && <Check className="w-3 h-3" />}
                    <span>RSI</span>
                  </button>
                </div>
              </div>

              {/* Render Selected Candlestick Chart */}
              {renderCandlestickChart()}

              {/* 52-Week Range Bar */}
              {renderWeek52Bar()}

              {/* Key Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#171b26] p-4 rounded-xl border border-[#2A2E39]">
                  <div className="text-xs text-[#8d90a2] mb-1">Session Open</div>
                  <div className="font-mono text-sm font-semibold text-white">
                    ${asset.open?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                <div className="bg-[#171b26] p-4 rounded-xl border border-[#2A2E39]">
                  <div className="text-xs text-[#8d90a2] mb-1">Session High</div>
                  <div className="font-mono text-sm font-semibold text-[#089981]">
                    ${asset.high?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                <div className="bg-[#171b26] p-4 rounded-xl border border-[#2A2E39]">
                  <div className="text-xs text-[#8d90a2] mb-1">Session Low</div>
                  <div className="font-mono text-sm font-semibold text-[#F23645]">
                    ${asset.low?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                <div className="bg-[#171b26] p-4 rounded-xl border border-[#2A2E39]">
                  <div className="text-xs text-[#8d90a2] mb-1">Volume</div>
                  <div className="font-mono text-sm font-semibold text-white">
                    {asset.volume || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Technical Indicator Gauge */}
              <div className="bg-[#171b26] p-5 rounded-xl border border-[#2A2E39] flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Technical Consensus Rating</h3>
                  <p className="text-xs text-[#8d90a2]">
                    Combined score calculated across Moving Averages & Oscillators.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase text-[#8d90a2]">Sell</span>
                  <div className="w-48 h-3 bg-[#2A2E39] rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-[#F23645] via-[#2A2E39] to-[#089981] transition-all duration-500"
                      style={{
                        width: `${Math.min(Math.max((asset.technicalScore + 100) / 2, 5), 95)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold uppercase text-[#089981]">Buy</span>
                </div>

                <div className="px-4 py-2 rounded-lg bg-[#2A2E39] border border-[#313441] text-sm font-bold text-[#b6c4ff]">
                  {asset.technicalGauge}
                </div>
              </div>
            </>
          ) : activeTab === 'orderbook' ? (
            <OrderBookWidget asset={asset} />
          ) : (
            /* AI Insights Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-[#b6c4ff]">
                  <Sparkles className="w-5 h-5 text-[#2962ff]" />
                  <span>Gemini AI Market Intelligence</span>
                </div>
                <button
                  onClick={fetchAiAnalysis}
                  disabled={isLoadingAi}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#171b26] border border-[#2A2E39] hover:border-[#2962ff] text-xs text-[#c3c5d8] hover:text-white transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin text-[#2962ff]' : ''}`} />
                  <span>Re-analyze</span>
                </button>
              </div>

              {isLoadingAi ? (
                <div className="py-16 text-center space-y-3 bg-[#171b26] rounded-xl border border-[#2A2E39]">
                  <RefreshCw className="w-8 h-8 text-[#2962ff] animate-spin mx-auto" />
                  <p className="text-sm text-[#8d90a2] font-mono">
                    Evaluating order book structure and technical indicators for {asset.symbol}...
                  </p>
                </div>
              ) : (
                <div className="bg-[#171b26] p-6 rounded-xl border border-[#2A2E39] text-sm leading-relaxed text-[#dfe2f2] whitespace-pre-line font-sans">
                  {aiAnalysis}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
