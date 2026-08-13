import React from 'react';
import { MarketAsset } from '../types';
import { Activity, ArrowUp, ArrowDown } from 'lucide-react';

interface OrderBookWidgetProps {
  asset: MarketAsset;
}

export const OrderBookWidget: React.FC<OrderBookWidgetProps> = ({ asset }) => {
  const currentPrice = asset.price;

  // Generate simulated Bids and Asks around current price
  const generateOrders = () => {
    const bids = [];
    const asks = [];

    for (let i = 1; i <= 5; i++) {
      const askPrice = currentPrice + i * (currentPrice * 0.0008);
      const askSize = Math.floor(Math.random() * 400 + 50);
      asks.unshift({
        price: askPrice,
        size: askSize,
        total: askPrice * askSize,
      });

      const bidPrice = Math.max(0.01, currentPrice - i * (currentPrice * 0.0008));
      const bidSize = Math.floor(Math.random() * 400 + 50);
      bids.push({
        price: bidPrice,
        size: bidSize,
        total: bidPrice * bidSize,
      });
    }

    return { bids, asks };
  };

  const { bids, asks } = generateOrders();
  const maxAskSize = Math.max(...asks.map((a) => a.size));
  const maxBidSize = Math.max(...bids.map((b) => b.size));

  return (
    <div className="bg-[#171b26] p-4 rounded-xl border border-[#2A2E39] font-mono text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#2A2E39]">
        <div className="flex items-center gap-2 font-bold text-[#dfe2f2]">
          <Activity className="w-4 h-4 text-[#2962ff]" />
          <span>Level II Order Depth ({asset.symbol})</span>
        </div>
        <span className="text-[10px] text-[#089981] bg-[#089981]/15 px-2 py-0.5 rounded font-bold">
          LIVE MATCHING
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-3">
        {/* Asks (Sell Orders - Red) */}
        <div>
          <div className="text-[10px] uppercase font-bold text-[#F23645] mb-2 border-b border-[#2A2E39] pb-1">
            Asks (Sells)
          </div>
          <div className="space-y-1">
            {asks.map((ask, idx) => {
              const widthPct = Math.min((ask.size / maxAskSize) * 100, 100);
              return (
                <div key={idx} className="relative flex justify-between py-0.5 px-1 rounded overflow-hidden">
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-[#F23645]/15 pointer-events-none"
                    style={{ width: `${widthPct}%` }}
                  />
                  <span className="text-[#F23645] font-bold z-10">
                    ${ask.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[#c3c5d8] z-10">{ask.size}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bids (Buy Orders - Green) */}
        <div>
          <div className="text-[10px] uppercase font-bold text-[#089981] mb-2 border-b border-[#2A2E39] pb-1">
            Bids (Buys)
          </div>
          <div className="space-y-1">
            {bids.map((bid, idx) => {
              const widthPct = Math.min((bid.size / maxBidSize) * 100, 100);
              return (
                <div key={idx} className="relative flex justify-between py-0.5 px-1 rounded overflow-hidden">
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-[#089981]/15 pointer-events-none"
                    style={{ width: `${widthPct}%` }}
                  />
                  <span className="text-[#089981] font-bold z-10">
                    ${bid.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[#c3c5d8] z-10">{bid.size}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
