"use client";
import { useState, useEffect } from "react";

export default function Calendar() {
  const [stocks, setStocks] = useState<{ticker: string; name: string; date: string; daysOut: number}[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load watchlist and custom tickers from Redis
    fetch("/api/watchlist")
      .then(res => res.json())
      .then(async (data) => {
        if (data.tickers) setWatchlist(data.tickers);
        const customTickers = data.customStocks?.map((s: { ticker: string }) => s.ticker => s.ticker).join(",") || "";
        const url = customTickers ? `/api/earnings?extra=${customTickers}` : "/api/earnings";
        const earningsRes = await fetch(url);
        const earningsData = await earningsRes.json();
        if (earningsData.stocks) setStocks(earningsData.stocks);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getZone = (days: number) => {
    if (days < 0) return { label: "Reported", color: "text-gray-400 bg-gray-400/10 border-gray-400/30" };
    if (days <= 2) return { label: "Last Call", color: "text-red-400 bg-red-400/10 border-red-400/30" };
    if (days <= 10) return { label: "Enter Zone", color: "text-green-400 bg-green-400/10 border-green-400/30" };
    if (days <= 15) return { label: "Watch", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" };
    if (days === 999) return { label: "TBD", color: "text-gray-400 bg-gray-400/10 border-gray-400/30" };
    return { label: "Too Early", color: "text-gray-400 bg-gray-400/10 border-gray-400/30" };
  };

  const sorted = [...stocks].sort((a, b) => {
    if (a.daysOut === 999) return 1;
    if (b.daysOut === 999) return -1;
    if (a.daysOut < 0) return 1;
    if (b.daysOut < 0) return -1;
    return a.daysOut - b.daysOut;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <a href="/" className="text-green-400 font-bold text-xl tracking-wide">StraddleTracker</a>
        <div className="flex gap-6">
          <a href="/calendar" className="text-green-400 font-medium">Calendar</a>
          <a href="/analyzer" className="text-gray-300 hover:text-green-400 transition-colors font-medium">Analyzer</a>
          <a href="/watchlist" className="text-gray-300 hover:text-green-400 transition-colors font-medium">Watchlist</a>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-8 py-10">
        <h1 className="text-3xl font-bold mb-2">Earnings Calendar</h1>
        <p className="text-gray-400 mb-8">Live earnings dates — updates automatically</p>
        {loading ? (
          <div className="text-gray-400 text-center py-20">Loading live earnings dates...</div>
        ) : (
          <div className="space-y-3">
            {sorted.map((stock) => {
              const zone = getZone(stock.daysOut);
              const isWatched = watchlist.includes(stock.ticker);
              return (
                <div key={stock.ticker} className={`flex items-center justify-between bg-gray-900 border rounded-xl px-6 py-4 hover:border-green-400/30 transition-colors ${isWatched ? "border-green-400/40" : "border-white/10"}`}>
                  <div className="flex items-center gap-4">
                    <span className="text-green-400 font-bold text-lg w-16">{stock.ticker}</span>
                    <div>
                      <span className="text-gray-300">{stock.name}</span>
                      {isWatched && <span className="ml-2 text-xs text-green-400 opacity-70">● watching</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-gray-400 text-sm">{stock.date}</span>
                    <span className="text-gray-300 text-sm w-24 text-center">
                      {stock.daysOut === 999 ? "TBD" : stock.daysOut === 0 ? "Today" : stock.daysOut < 0 ? "Reported" : `${stock.daysOut}d out`}
                    </span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${zone.color}`}>
                      {zone.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}