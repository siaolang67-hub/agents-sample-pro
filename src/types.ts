export type MarketCategory = 'indices' | 'stocks' | 'crypto' | 'forex' | 'futures' | 'commodities';

export interface CandlestickPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma20?: number;
  sma50?: number;
  rsi?: number;
}

export interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

export interface MarketAsset {
  symbol: string;
  name: string;
  shortBadge: string;
  badgeColor: 'bearish' | 'primary' | 'bullish' | 'secondary' | 'amber' | 'purple';
  price: number;
  change: number;
  changePercent: number;
  sparkline: number[];
  high: number;
  low: number;
  open: number;
  volume: string;
  marketCap?: string;
  peRatio?: number;
  week52Low: number;
  week52High: number;
  sector?: string;
  category: MarketCategory;
  description: string;
  technicalGauge: 'Strong Sell' | 'Sell' | 'Neutral' | 'Buy' | 'Strong Buy';
  technicalScore: number; // -100 to 100
  rsiValue: number;
  candlesticks: CandlestickPoint[];
  lastTickTime?: number;
  lastTickDirection?: 'up' | 'down';
}

export interface MarketNews {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  url?: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  relatedSymbols: string[];
}

export interface SectorPerformance {
  name: string;
  changePercent: number;
  weight: string;
  topSymbol: string;
  assetCount: number;
}

