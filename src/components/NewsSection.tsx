import React from 'react';
import { MarketNews } from '../types';
import { Newspaper, ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface NewsSectionProps {
  news: MarketNews[];
  onSelectSymbol: (symbol: string) => void;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ news, onSelectSymbol }) => {
  return (
    <section className="mt-12 bg-[#1E222D] rounded-xl border border-[#2A2E39] p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[#2A2E39]">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-[#2962ff]" />
          <h2 className="text-xl font-bold font-['Hanken_Grotesk'] text-[#dfe2f2]">
            Market News & Sentiment
          </h2>
        </div>
        <span className="text-xs font-mono text-[#8d90a2]">Updated live</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {news.map((item) => {
          let SentimentIcon = Minus;
          let sentimentColor = 'text-[#c3c5d8] bg-[#2A2E39]';
          if (item.sentiment === 'bullish') {
            SentimentIcon = TrendingUp;
            sentimentColor = 'text-[#089981] bg-[#089981]/15';
          } else if (item.sentiment === 'bearish') {
            SentimentIcon = TrendingDown;
            sentimentColor = 'text-[#F23645] bg-[#F23645]/15';
          }

          return (
            <div
              key={item.id}
              className="bg-[#171b26] p-4 rounded-xl border border-[#2A2E39] hover:border-[#2962ff] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono text-[#8d90a2]">{item.source} • {item.timeAgo}</span>
                  <div className={`flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${sentimentColor}`}>
                    <SentimentIcon className="w-3 h-3" />
                    <span>{item.sentiment}</span>
                  </div>
                </div>

                <h3 className="font-semibold text-sm text-[#dfe2f2] group-hover:text-[#b6c4ff] transition-colors line-clamp-2 mb-3">
                  {item.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#2A2E39]/40">
                <span className="text-[10px] text-[#8d90a2] uppercase font-mono">Symbols:</span>
                <div className="flex flex-wrap gap-1">
                  {item.relatedSymbols.map((sym) => (
                    <button
                      key={sym}
                      onClick={() => onSelectSymbol(sym)}
                      className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#2A2E39] text-[#b6c4ff] hover:bg-[#2962ff] hover:text-white transition-colors"
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
